import { useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface PositionHierarchyItem {
  id: string;
  name: string;
  parentId?: string;
}

interface AddPositionModalProps {
  open: boolean;
  positions: PositionHierarchyItem[];
  onClose: () => void;
  onAdd: (newPosition: PositionHierarchyItem) => void;
}

export function AddPositionModal({
  open,
  positions,
  onClose,
  onAdd,
}: AddPositionModalProps) {
  const [form] = Form.useForm();
  const [level, setLevel] = useState<"first" | "second" | "third">("first");

  // Get categories (first level)
  const categories = positions.filter((p) => !p.parentId);
  
  // Get second level positions for selected parent
  const [selectedFirstLevel, setSelectedFirstLevel] = useState<string | undefined>();
  const secondLevelPositions = positions.filter((p) => p.parentId === selectedFirstLevel);

  const handleLevelChange = (value: "first" | "second" | "third") => {
    setLevel(value);
    form.resetFields(["parentId", "secondLevelParentId", "name"]);
    setSelectedFirstLevel(undefined);
  };

  const handleFirstLevelChange = (value: string) => {
    setSelectedFirstLevel(value);
    form.resetFields(["secondLevelParentId"]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      let parentId: string | undefined;
      if (level === "second") {
        parentId = values.parentId;
      } else if (level === "third") {
        parentId = values.secondLevelParentId;
      }

      const newPosition: PositionHierarchyItem = {
        id: `pos-${Date.now()}`,
        name: values.name,
        parentId,
      };

      onAdd(newPosition);
      message.success("岗位添加成功");
      form.resetFields();
      setLevel("first");
      setSelectedFirstLevel(undefined);
      onClose();
    } catch (error) {
      // Validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLevel("first");
    setSelectedFirstLevel(undefined);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PlusOutlined />
          <span>新增岗位</span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="添加"
      cancelText="取消"
      width={480}
      zIndex={1001}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="岗位层级"
          name="level"
          initialValue="first"
        >
          <Select
            value={level}
            onChange={handleLevelChange}
            options={[
              { value: "first", label: "一级（岗位序列）" },
              { value: "second", label: "二级（具体岗位）" },
              { value: "third", label: "三级（岗位细分）" },
            ]}
          />
        </Form.Item>

        {level === "second" && (
          <Form.Item
            label="上级序列"
            name="parentId"
            rules={[{ required: true, message: "请选择上级序列" }]}
          >
            <Select
              placeholder="选择一级岗位序列"
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Form.Item>
        )}

        {level === "third" && (
          <>
            <Form.Item
              label="上级序列"
              name="parentId"
              rules={[{ required: true, message: "请选择上级序列" }]}
            >
              <Select
                placeholder="选择一级岗位序列"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                onChange={handleFirstLevelChange}
              />
            </Form.Item>
            <Form.Item
              label="上级岗位"
              name="secondLevelParentId"
              rules={[{ required: true, message: "请选择上级岗位" }]}
            >
              <Select
                placeholder="选择二级岗位"
                options={secondLevelPositions.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                disabled={!selectedFirstLevel}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="岗位名称"
          name="name"
          rules={[{ required: true, message: "请输入岗位名称" }]}
        >
          <Input placeholder="输入岗位名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
