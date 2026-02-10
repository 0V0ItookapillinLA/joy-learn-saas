import { useState } from "react";
import { Button, Table, Tag, Space, Typography, Modal, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CoursewareCreator } from "@/components/ai-courseware/CoursewareCreator";

const { Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: "default", label: "草稿" },
  generating: { color: "processing", label: "生成中" },
  ready: { color: "success", label: "就绪" },
  published: { color: "blue", label: "已发布" },
};

interface Courseware {
  id: string;
  title: string;
  description: string | null;
  source_documents: any;
  outline: any;
  scripts: any;
  status: string;
  character_id: string | null;
  video_urls: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export default function AICourseware() {
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editingCourseware, setEditingCourseware] = useState<Courseware | null>(null);
  const queryClient = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["ai-courseware"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_courseware" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Courseware[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_courseware" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-courseware"] });
      message.success("课件已删除");
    },
  });

  const columns: ColumnsType<Courseware> = [
    {
      title: "课件标题",
      dataIndex: "title",
      key: "title",
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const s = statusMap[status] || { color: "default", label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: "章节数",
      key: "chapters",
      width: 100,
      render: (_: any, record: Courseware) => {
        const outline = Array.isArray(record.outline) ? record.outline.length : 0;
        return outline > 0 ? `${outline} 章` : "-";
      },
    },
    {
      title: "引用文档",
      key: "docs",
      width: 100,
      render: (_: any, record: Courseware) => {
        const docs = Array.isArray(record.source_documents) ? record.source_documents.length : 0;
        return docs > 0 ? <Tag>{docs} 篇</Tag> : "-";
      },
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (t: string) => new Date(t).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_: any, record: Courseware) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditingCourseware(record);
              setCreatorOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: "确定删除此课件？",
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="AI 制课" description="从知识库选取资料，AI 自动生成课程大纲和讲稿">
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCourseware(null);
            setCreatorOpen(true);
          }}
        >
          新建课件
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <CoursewareCreator
        open={creatorOpen}
        courseware={editingCourseware}
        onClose={() => {
          setCreatorOpen(false);
          setEditingCourseware(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["ai-courseware"] });
          setCreatorOpen(false);
          setEditingCourseware(null);
        }}
      />
    </DashboardLayout>
  );
}
