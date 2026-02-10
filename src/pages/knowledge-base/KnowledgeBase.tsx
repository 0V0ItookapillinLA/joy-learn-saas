import { useState } from "react";
import { Button, Table, Tag, Input, Select, Space, Typography, message, Breadcrumb } from "antd";
import { PlusOutlined, SearchOutlined, FileTextOutlined, FilePdfOutlined, FileWordOutlined, FilePptOutlined, FolderOutlined, HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadDocModal } from "@/components/knowledge-base/UploadDocModal";
import { KnowledgeDocDrawer } from "@/components/knowledge-base/KnowledgeDocDrawer";

const { Text } = Typography;

const mockFolders = [
  { id: "folder-sales", name: "销售话术", icon: "📢", docCount: 12 },
  { id: "folder-product", name: "产品知识", icon: "📦", docCount: 8 },
  { id: "folder-service", name: "客服流程", icon: "🎧", docCount: 6 },
  { id: "folder-onboarding", name: "新人培训", icon: "🎓", docCount: 15 },
  { id: "folder-methodology", name: "方法论", icon: "📐", docCount: 4 },
];

const categoryOptions = [
  { label: "全部分类", value: "" },
  { label: "话术", value: "话术" },
  { label: "流程", value: "流程" },
  { label: "产品", value: "产品" },
  { label: "方法论", value: "方法论" },
  { label: "通用", value: "general" },
];

const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "草稿", value: "draft" },
  { label: "解析中", value: "processing" },
  { label: "就绪", value: "ready" },
  { label: "失败", value: "error" },
];

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: "default", label: "草稿" },
  processing: { color: "processing", label: "解析中" },
  ready: { color: "success", label: "就绪" },
  error: { color: "error", label: "失败" },
};

const fileIcon = (type: string | null) => {
  if (!type) return <FileTextOutlined />;
  if (type.includes("pdf")) return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
  if (type.includes("word") || type.includes("docx")) return <FileWordOutlined style={{ color: "#1677ff" }} />;
  if (type.includes("presentation") || type.includes("pptx")) return <FilePptOutlined style={{ color: "#fa8c16" }} />;
  return <FileTextOutlined />;
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

type FolderRow = { _type: "folder"; id: string; name: string; icon: string; docCount: number };
type DocRow = KnowledgeDoc & { _type: "doc" };
type TableRow = FolderRow | DocRow;

export default function KnowledgeBase() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drawerDoc, setDrawerDoc] = useState<KnowledgeDoc | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["knowledge-documents", categoryFilter, statusFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("knowledge_documents" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (categoryFilter) query = query.eq("category", categoryFilter);
      if (statusFilter) query = query.eq("status", statusFilter);
      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as KnowledgeDoc[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_documents" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
      message.success("文档已删除");
      setDrawerDoc(null);
    },
  });

  const currentFolderData = mockFolders.find(f => f.id === currentFolder);

  // Build mixed datasource: folders + docs at root, only docs inside folder
  const tableData: TableRow[] = currentFolder
    ? docs.map(d => ({ ...d, _type: "doc" as const }))
    : [
        ...mockFolders.map(f => ({ _type: "folder" as const, ...f })),
        ...docs.map(d => ({ ...d, _type: "doc" as const })),
      ];

  const columns: ColumnsType<TableRow> = [
    {
      title: "文档",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: TableRow) => {
        if (record._type === "folder") {
          return (
            <Space>
              <FolderOutlined style={{ color: "#faad14", fontSize: 18 }} />
              <div>
                <Text strong>{record.icon} {record.name}</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>{record.docCount} 份资料</Text></div>
              </div>
            </Space>
          );
        }
        return (
          <Space>
            {fileIcon(record.file_type)}
            <div>
              <Text strong>{record.title}</Text>
              {record.file_name && (
                <div><Text type="secondary" style={{ fontSize: 12 }}>{record.file_name}</Text></div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "分类",
      key: "category",
      width: 100,
      render: (_: any, record: TableRow) => record._type === "folder" ? "-" : (record.category || "通用"),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_: any, record: TableRow) => {
        if (record._type === "folder") return "-";
        const s = statusMap[record.status] || { color: "default", label: record.status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: "知识点数",
      key: "points",
      width: 100,
      render: (_: any, record: TableRow) => {
        if (record._type === "folder") return "-";
        const points = Array.isArray(record.ai_key_points) ? record.ai_key_points.length : 0;
        return points > 0 ? <Tag color="blue">{points} 个</Tag> : <Text type="secondary">-</Text>;
      },
    },
    {
      title: "上传时间",
      key: "created_at",
      width: 180,
      render: (_: any, record: TableRow) => {
        if (record._type === "folder") return "-";
        return new Date(record.created_at).toLocaleString("zh-CN");
      },
    },
  ];

  return (
    <DashboardLayout title="知识库" description="管理培训资料，AI 自动提取知识点">
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={() => setCurrentFolder(null)} style={{ cursor: "pointer" }}>
                  <HomeOutlined style={{ marginRight: 4 }} />
                  知识库
                </a>
              ),
            },
            ...(currentFolderData
              ? [{ title: <span>{currentFolderData.icon} {currentFolderData.name}</span> }]
              : []),
          ]}
        />
      </div>

      {/* Filter & Upload Bar */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Space wrap>
          {currentFolder && (
            <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentFolder(null)}>
              返回上层
            </Button>
          )}
          <Select style={{ width: 120 }} options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} />
          <Select style={{ width: 120 }} options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
          <Input
            placeholder="搜索文档标题"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
          上传资料
        </Button>
      </div>

      {/* Table with folders + docs */}
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey={(r) => r._type === "folder" ? r.id : r.id}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => {
            if (record._type === "folder") {
              setCurrentFolder(record.id);
            } else {
              setDrawerDoc(record);
            }
          },
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 20 }}
      />

      <UploadDocModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
          setUploadOpen(false);
        }}
      />

      <KnowledgeDocDrawer
        doc={drawerDoc}
        onClose={() => setDrawerDoc(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] })}
      />
    </DashboardLayout>
  );
}
