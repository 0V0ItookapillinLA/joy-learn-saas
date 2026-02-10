import { Drawer, Typography, Tag, Space, Button, Descriptions, List, Empty, Popconfirm, message } from "antd";
import { DeleteOutlined, ReloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const { Text, Paragraph, Title } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: "default", label: "草稿" },
  processing: { color: "processing", label: "解析中" },
  ready: { color: "success", label: "就绪" },
  error: { color: "error", label: "失败" },
};

interface KnowledgeDoc {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  ai_summary: string | null;
  ai_key_points: any;
  category: string | null;
  tags: any;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

interface Props {
  doc: KnowledgeDoc | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function KnowledgeDocDrawer({ doc, onClose, onDelete, onRefresh }: Props) {
  const [reparsing, setReparsing] = useState(false);

  if (!doc) return null;

  const keyPoints = Array.isArray(doc.ai_key_points) ? doc.ai_key_points : [];
  const s = statusMap[doc.status] || { color: "default", label: doc.status };

  const handleReparse = async () => {
    setReparsing(true);
    try {
      await supabase
        .from("knowledge_documents" as any)
        .update({ status: "processing" } as any)
        .eq("id", doc.id);

      await supabase.functions.invoke("ai-parse-document", {
        body: { documentId: doc.id, fileUrl: doc.file_url, fileName: doc.file_name },
      });

      message.success("重新解析已触发");
      onRefresh();
    } catch (err) {
      message.error("重新解析失败");
    } finally {
      setReparsing(false);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <Drawer
      title={doc.title}
      open={!!doc}
      onClose={onClose}
      width={560}
      zIndex={1000}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} loading={reparsing} onClick={handleReparse}>
            重新解析
          </Button>
          <Popconfirm title="确定删除此文档？" onConfirm={() => onDelete(doc.id)} okText="删除" cancelText="取消">
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      }
    >
      <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="状态"><Tag color={s.color}>{s.label}</Tag></Descriptions.Item>
        <Descriptions.Item label="分类">{doc.category || "通用"}</Descriptions.Item>
        <Descriptions.Item label="文件名">{doc.file_name || "-"}</Descriptions.Item>
        <Descriptions.Item label="文件大小">{formatSize(doc.file_size)}</Descriptions.Item>
        <Descriptions.Item label="上传时间">{new Date(doc.created_at).toLocaleString("zh-CN")}</Descriptions.Item>
      </Descriptions>

      {doc.description && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>描述</Title>
          <Paragraph>{doc.description}</Paragraph>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <Title level={5}>AI 摘要</Title>
        {doc.ai_summary ? (
          <Paragraph style={{ background: "#f6f8fa", padding: 12, borderRadius: 8 }}>
            {doc.ai_summary}
          </Paragraph>
        ) : (
          <Text type="secondary">{doc.status === "processing" ? "AI 正在解析中..." : "暂无摘要"}</Text>
        )}
      </div>

      <div>
        <Title level={5}>知识点 ({keyPoints.length})</Title>
        {keyPoints.length > 0 ? (
          <List
            size="small"
            dataSource={keyPoints}
            renderItem={(item: any, index: number) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 16, color: "#1677ff" }} />}
                  title={item.title || `知识点 ${index + 1}`}
                  description={item.content}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description={doc.status === "processing" ? "正在提取知识点..." : "暂无知识点"} />
        )}
      </div>
    </Drawer>
  );
}
