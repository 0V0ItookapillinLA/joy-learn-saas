import { useState, useEffect } from "react";
import { Modal, Form, Select, Input, Checkbox, List, Tag, Button, message, Spin, Typography, Space, Avatar } from "antd";
import { BookOutlined, UserOutlined, SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface KnowledgeItem {
  id: string;
  title: string;
  type: "video" | "document" | "article" | "practice";
  duration?: number;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  employeeId: string;
  department: string;
}

interface TaskAssignModalProps {
  open: boolean;
  onClose: () => void;
  selectedStudents: Student[];
  recommendedKnowledge?: KnowledgeItem[];
  weakSkills?: string[];
}

// Mock knowledge library
const mockKnowledgeLibrary: KnowledgeItem[] = [
  { id: "k1", title: "客户需求分析技巧", type: "video", duration: 15, description: "学习如何准确把握客户需求" },
  { id: "k2", title: "异议处理话术指南", type: "document", description: "常见客户异议及应对策略" },
  { id: "k3", title: "产品知识手册", type: "document", description: "全产品线知识汇总" },
  { id: "k4", title: "沟通表达进阶课程", type: "video", duration: 30, description: "提升沟通技巧和表达能力" },
  { id: "k5", title: "情绪管理与压力调节", type: "article", description: "职场情绪管理方法" },
  { id: "k6", title: "客户拜访模拟练习", type: "practice", duration: 20, description: "AI模拟客户场景对练" },
  { id: "k7", title: "销售技巧实战演练", type: "practice", duration: 25, description: "真实场景销售能力训练" },
];

const typeColors: Record<string, string> = {
  video: "blue",
  document: "green",
  article: "orange",
  practice: "purple",
};

const typeLabels: Record<string, string> = {
  video: "视频",
  document: "文档",
  article: "文章",
  practice: "练习",
};

export function TaskAssignModal({
  open,
  onClose,
  selectedStudents,
  recommendedKnowledge,
  weakSkills = [],
}: TaskAssignModalProps) {
  const [form] = Form.useForm();
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Initialize with recommended knowledge if provided
  useEffect(() => {
    if (recommendedKnowledge && recommendedKnowledge.length > 0) {
      setSelectedKnowledge(recommendedKnowledge.map(k => k.id));
    }
  }, [recommendedKnowledge]);

  const filteredKnowledge = mockKnowledgeLibrary.filter(
    k => k.title.includes(searchKeyword) || k.description?.includes(searchKeyword)
  );

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const values = form.getFieldsValue();
      const knowledgeItems = mockKnowledgeLibrary.filter(k => selectedKnowledge.includes(k.id));

      // Call edge function to send via JingME
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-jingme-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          students: selectedStudents,
          knowledgeItems,
          taskTitle: values.taskTitle,
          taskMessage: values.taskMessage,
          deadline: values.deadline,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success(`已成功向 ${selectedStudents.length} 位学员发送任务`);
        onClose();
        form.resetFields();
        setSelectedKnowledge([]);
      } else {
        throw new Error(result.error || "发送失败");
      }
    } catch (error) {
      console.error("Task assign error:", error);
      message.error(error instanceof Error ? error.message : "任务指派失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const toggleKnowledge = (id: string) => {
    setSelectedKnowledge(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      title="指派学习任务"
      open={open}
      onCancel={onClose}
      width={720}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSubmit}
          disabled={selectedKnowledge.length === 0}
        >
          通过京ME发送
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ taskTitle: "能力提升学习任务" }}>
        {/* Selected Students */}
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f5f5f5", borderRadius: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>指派对象 ({selectedStudents.length}人)</Text>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedStudents.slice(0, 5).map(s => (
              <Tag key={s.id} icon={<UserOutlined />}>
                {s.name} ({s.employeeId})
              </Tag>
            ))}
            {selectedStudents.length > 5 && (
              <Tag>+{selectedStudents.length - 5} 人</Tag>
            )}
          </div>
        </div>

        {/* Weak skills hint */}
        {weakSkills.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fff7e6", borderRadius: 8, border: "1px solid #ffd591" }}>
            <Text style={{ fontSize: 12, color: "#d46b08" }}>
              💡 根据AI评估，该学员需要加强以下能力：
            </Text>
            <div style={{ marginTop: 8 }}>
              {weakSkills.map(skill => (
                <Tag key={skill} color="orange">{skill}</Tag>
              ))}
            </div>
          </div>
        )}

        <Form.Item name="taskTitle" label="任务标题" rules={[{ required: true, message: "请输入任务标题" }]}>
          <Input placeholder="请输入任务标题" maxLength={50} />
        </Form.Item>

        <Form.Item name="taskMessage" label="附加说明">
          <TextArea rows={2} placeholder="可选：添加任务说明或鼓励语" maxLength={200} />
        </Form.Item>

        {/* Knowledge Selection */}
        <Form.Item label="选择关联知识内容" required>
          <Input.Search
            placeholder="搜索知识内容..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ marginBottom: 12 }}
            allowClear
          />
          <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #d9d9d9", borderRadius: 8 }}>
            <List
              dataSource={filteredKnowledge}
              renderItem={item => (
                <List.Item
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: selectedKnowledge.includes(item.id) ? "#e6f4ff" : "transparent",
                  }}
                  onClick={() => toggleKnowledge(item.id)}
                >
                  <Checkbox
                    checked={selectedKnowledge.includes(item.id)}
                    style={{ marginRight: 12 }}
                  />
                  <List.Item.Meta
                    avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: typeColors[item.type] === "blue" ? "#1677ff" : typeColors[item.type] === "green" ? "#52c41a" : typeColors[item.type] === "orange" ? "#fa8c16" : "#722ed1" }} />}
                    title={
                      <Space>
                        <span>{item.title}</span>
                        <Tag color={typeColors[item.type]}>{typeLabels[item.type]}</Tag>
                        {item.duration && <Text type="secondary" style={{ fontSize: 12 }}>{item.duration}分钟</Text>}
                      </Space>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </div>
          {selectedKnowledge.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
              已选择 {selectedKnowledge.length} 项内容
            </Text>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
