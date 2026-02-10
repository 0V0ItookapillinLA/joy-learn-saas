import { useState } from "react";
import { Button, Table, Tag, Space, Typography, Modal, message, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CoursewareCreator } from "@/components/ai-courseware/CoursewareCreator";

const { Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: "default", label: "草稿" },
  generating: { color: "processing", label: "生成中" },
  ready: { color: "success", label: "已就绪" },
  recording: { color: "processing", label: "录制中" },
  recorded: { color: "blue", label: "已录制" },
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
  const [previewCourseware, setPreviewCourseware] = useState<Courseware | null>(null);
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

  const hasVideo = (cw: Courseware) => {
    const urls = Array.isArray(cw.video_urls) ? cw.video_urls : [];
    return urls.length > 0 || cw.status === "recorded" || cw.status === "published";
  };

  const columns: ColumnsType<Courseware> = [
    {
      title: "课件标题",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: Courseware) => (
        <div>
          <Text strong>{title}</Text>
          {record.description && (
            <div><Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text></div>
          )}
        </div>
      ),
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
      title: "视频",
      key: "video",
      width: 100,
      render: (_: any, record: Courseware) => {
        if (record.status === "recording") return <Tag color="processing">录制中</Tag>;
        if (hasVideo(record)) return <Tag icon={<VideoCameraOutlined />} color="blue">已生成</Tag>;
        return <Text type="secondary">-</Text>;
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
      width: 200,
      render: (_: any, record: Courseware) => (
        <Space>
          {hasVideo(record) && (
            <Button
              type="link"
              size="small"
              onClick={(e) => { e.stopPropagation(); setPreviewCourseware(record); }}
            >
              预览
            </Button>
          )}
          <Button
            type="link"
            size="small"
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
    <DashboardLayout title="AI 制课" description="从知识库选取资料，AI 自动生成课程大纲、讲稿与数字人视频">
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

      {/* Video Preview Modal */}
      <Modal
        title={previewCourseware ? `课件预览: ${previewCourseware.title}` : "课件预览"}
        open={!!previewCourseware}
        onCancel={() => setPreviewCourseware(null)}
        footer={null}
        width={900}
        zIndex={1000}
        destroyOnClose
      >
        {previewCourseware && <CoursewarePreviewContent courseware={previewCourseware} />}
      </Modal>
    </DashboardLayout>
  );
}

// ====== Preview Content Component ======
function CoursewarePreviewContent({ courseware }: { courseware: Courseware }) {
  const outline = Array.isArray(courseware.outline) ? courseware.outline : [];
  const scripts = typeof courseware.scripts === "object" && courseware.scripts ? courseware.scripts : {};
  const videoUrls = Array.isArray(courseware.video_urls) ? courseware.video_urls : [];

  if (outline.length === 0) {
    return <Empty description="暂无课件内容" />;
  }

  return (
    <div>
      {/* Simulated PPT + Avatar video player */}
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", color: "#fff", padding: 40 }}>
          <PlayCircleOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.8 }} />
          <Typography.Title level={3} style={{ color: "#fff", margin: 0 }}>
            {courseware.title}
          </Typography.Title>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 8, display: "block" }}>
            {outline.length} 个章节 · 数字人讲解视频
          </Text>
          {videoUrls.length > 0 ? (
            <Tag color="green" style={{ marginTop: 16 }}>视频已生成，点击播放</Tag>
          ) : (
            <Tag color="orange" style={{ marginTop: 16 }}>视频录制中，请稍后刷新查看</Tag>
          )}
        </div>

        {/* Avatar placeholder in bottom-right */}
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid rgba(255,255,255,0.3)",
        }}>
          <Text style={{ color: "#fff", fontSize: 24 }}>🎙️</Text>
        </div>
      </div>

      {/* Chapter list */}
      <Typography.Title level={5}>章节列表</Typography.Title>
      {outline.map((chapter: any, i: number) => (
        <div key={i} style={{
          padding: "12px 16px",
          marginBottom: 8,
          background: "#fafafa",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <Text strong>第 {i + 1} 章: {chapter.title}</Text>
            {chapter.description && (
              <div><Text type="secondary" style={{ fontSize: 12 }}>{chapter.description}</Text></div>
            )}
          </div>
          <Tag color={scripts[chapter.title] || scripts[`chapter_${i}`] ? "green" : "default"}>
            {scripts[chapter.title] || scripts[`chapter_${i}`] ? "讲稿就绪" : "待生成"}
          </Tag>
        </div>
      ))}
    </div>
  );
}
