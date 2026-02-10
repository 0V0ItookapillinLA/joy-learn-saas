import { useState, useEffect } from "react";
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
  const [currentChapter, setCurrentChapter] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (currentChapter < outline.length - 1) {
            setCurrentChapter((c) => c + 1);
            return 0;
          }
          setPlaying(false);
          return 100;
        }
        return p + 0.5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [playing, currentChapter, outline.length]);

  if (outline.length === 0) {
    return <Empty description="暂无课件内容" />;
  }

  const chapter = outline[currentChapter] || outline[0];
  const script = scripts[chapter?.title] || scripts[chapter?.id] || scripts[`ch_${currentChapter + 1}`] || "";

  return (
    <div>
      {/* Simulated Video Player */}
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        {/* PPT Content Area */}
        <div style={{ padding: "40px 100px 40px 40px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography.Title level={3} style={{ color: "#fff", margin: "0 0 16px 0" }}>
            第 {currentChapter + 1} 章: {chapter?.title}
          </Typography.Title>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.8, maxHeight: 200, overflow: "hidden" }}>
            {script ? script.slice(0, 300) + (script.length > 300 ? "..." : "") : "讲稿内容加载中..."}
          </div>
        </div>

        {/* Digital Avatar */}
        <div style={{
          position: "absolute", bottom: 20, right: 20,
          width: 90, height: 90, borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "3px solid rgba(255,255,255,0.4)",
          animation: playing ? "pulse 2s ease-in-out infinite" : "none",
        }}>
          <span style={{ fontSize: 36 }}>🎙️</span>
        </div>

        {/* Play/Pause Overlay */}
        {!playing && (
          <div
            onClick={() => { setPlaying(true); if (progress >= 100) { setProgress(0); setCurrentChapter(0); } }}
            style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.3)", cursor: "pointer",
            }}
          >
            <PlayCircleOutlined style={{ fontSize: 72, color: "#fff", opacity: 0.9 }} />
          </div>
        )}

        {/* Progress Bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#667eea", transition: "width 50ms linear" }} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Button size="small" onClick={() => setPlaying(!playing)}>
          {playing ? "暂停" : "播放"}
        </Button>
        <Text type="secondary" style={{ fontSize: 12 }}>
          第 {currentChapter + 1}/{outline.length} 章 · {chapter?.title}
        </Text>
      </div>

      {/* Chapter List */}
      <Typography.Title level={5}>章节列表</Typography.Title>
      {outline.map((ch: any, i: number) => (
        <div
          key={i}
          onClick={() => { setCurrentChapter(i); setProgress(0); }}
          style={{
            padding: "10px 16px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
            background: i === currentChapter ? "#e6f4ff" : "#fafafa",
            border: i === currentChapter ? "1px solid #91caff" : "1px solid transparent",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <Text strong={i === currentChapter}>第 {i + 1} 章: {ch.title}</Text>
          <Tag color="green">已录制</Tag>
        </div>
      ))}

      <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
    </div>
  );
}
