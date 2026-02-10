import { useState } from "react";
import { Modal, Form, Input, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadDocModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryOptions = [
  { label: "话术", value: "话术" },
  { label: "流程", value: "流程" },
  { label: "产品", value: "产品" },
  { label: "方法论", value: "方法论" },
  { label: "通用", value: "general" },
];

export function UploadDocModal({ open, onClose, onSuccess }: UploadDocModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.error("请选择文件");
        return;
      }

      setLoading(true);
      const file = fileList[0].originFileObj;
      if (!file) return;

      // Get organization_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user!.id)
        .single();

      if (!profile?.organization_id) {
        message.error("未找到组织信息");
        return;
      }

      // Upload file to storage
      const filePath = `knowledge/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("training-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("training-attachments")
        .getPublicUrl(filePath);

      // Create document record
      const { data: doc, error: insertError } = await supabase
        .from("knowledge_documents" as any)
        .insert({
          title: values.title,
          description: values.description || null,
          category: values.category || "general",
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          status: "processing",
          organization_id: profile.organization_id,
          created_by: user!.id,
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger AI parsing
      supabase.functions
        .invoke("ai-parse-document", {
          body: { documentId: (doc as any).id, fileUrl: urlData.publicUrl, fileName: file.name },
        })
        .catch(console.error);

      message.success("文档上传成功，AI 正在解析中...");
      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="上传资料"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="上传"
      cancelText="取消"
      destroyOnClose
      zIndex={1000}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label="文档标题" rules={[{ required: true, message: "请输入标题" }]}>
          <Input placeholder="输入文档标题" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={2} placeholder="可选的文档描述" />
        </Form.Item>
        <Form.Item name="category" label="分类">
          <Select options={categoryOptions} placeholder="选择分类" allowClear />
        </Form.Item>
        <Form.Item label="文件" required>
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
            beforeUpload={() => false}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
