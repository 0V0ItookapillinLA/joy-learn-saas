import { useState } from "react";
import { Button, Table, Tag, Input, Space, Typography, message, Modal, Form, Select, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, FileTextOutlined, FilePdfOutlined, FileWordOutlined, FilePptOutlined, ArrowLeftOutlined, FolderOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadDocModal } from "@/components/knowledge-base/UploadDocModal";
import { KnowledgeDocDrawer } from "@/components/knowledge-base/KnowledgeDocDrawer";

const { Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: "default", label: "草稿" },
  processing: { color: "processing", label: "解析中" },
  ready: { color: "success", label: "就绪" },
  error: { color: "error", label: "失败" },
};

const authorityOptions = [
  { label: "高", value: "高" },
  { label: "中", value: "中" },
  { label: "低", value: "低" },
];

const fileIcon = (type: string | null) => {
  if (!type) return <FileTextOutlined />;
  if (type.includes("pdf")) return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
  if (type.includes("word") || type.includes("docx")) return <FileWordOutlined style={{ color: "#1677ff" }} />;
  if (type.includes("presentation") || type.includes("pptx")) return <FilePptOutlined style={{ color: "#fa8c16" }} />;
  return <FileTextOutlined />;
};

interface KnowledgeBaseItem {
  id: string;
  name: string;
  description: string | null;
  authority_level: string | null;
  organization_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

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
  knowledge_base_id: string | null;
}

export default function KnowledgeBase() {
  const [currentKB, setCurrentKB] = useState<KnowledgeBaseItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drawerDoc, setDrawerDoc] = useState<KnowledgeDoc | null>(null);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ====== Knowledge Bases List ======
  const { data: knowledgeBases = [], isLoading: kbLoading } = useQuery({
    queryKey: ["knowledge-bases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_bases" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as KnowledgeBaseItem[];
    },
  });

  // ====== Documents in current KB ======
  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["knowledge-documents", currentKB?.id, search],
    enabled: !!currentKB,
    queryFn: async () => {
      let query = supabase
        .from("knowledge_documents" as any)
        .select("*")
        .eq("knowledge_base_id", currentKB!.id)
        .order("created_at", { ascending: false });
      if (search) query = query.ilike("title", `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as KnowledgeDoc[];
    },
  });

  // ====== Doc counts per KB ======
  const { data: docCounts = {} } = useQuery({
    queryKey: ["knowledge-doc-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_documents" as any)
        .select("knowledge_base_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        if (d.knowledge_base_id) {
          counts[d.knowledge_base_id] = (counts[d.knowledge_base_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const createKBMutation = useMutation({
    mutationFn: async (values: { name: string; description: string; authority_level: string }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user!.id)
        .single();
      if (!profile?.organization_id) throw new Error("未找到组织信息");

      const { error } = await supabase.from("knowledge_bases" as any).insert({
        name: values.name,
        description: values.description || null,
        authority_level: values.authority_level || "中",
        organization_id: profile.organization_id,
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
      message.success("知识库创建成功");
      setCreateOpen(false);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.message || "创建失败"),
  });

  const deleteKBMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_bases" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
      message.success("知识库已删除");
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

  // ====== KB List Columns ======
  const kbColumns: ColumnsType<KnowledgeBaseItem> = [
    {
      title: "知识库名称",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Space>
          <FolderOutlined style={{ color: "#faad14", fontSize: 16 }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "知识库描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) => desc || "-",
    },
    {
      title: "文档数量",
      key: "docCount",
      width: 100,
      render: (_: any, record: KnowledgeBaseItem) => (docCounts as any)[record.id] || 0,
    },
    {
      title: "文档权威性",
      dataIndex: "authority_level",
      key: "authority_level",
      width: 120,
      render: (level: string) => {
        const colorMap: Record<string, string> = { "高": "red", "中": "orange", "低": "green" };
        return <Tag color={colorMap[level] || "default"}>{level || "中"}</Tag>;
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
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (t: string) => new Date(t).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_: any, record: KnowledgeBaseItem) => (
        <Space>
          <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setCurrentKB(record); }}>
            查看
          </Button>
          <Popconfirm
            title="确定删除此知识库？"
            onConfirm={(e) => { e?.stopPropagation(); deleteKBMutation.mutate(record.id); }}
            onCancel={(e) => e?.stopPropagation()}
            okText="删除"
            cancelText="取消"
          >
            <Button type="link" danger size="small" onClick={(e) => e.stopPropagation()}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ====== Doc List Columns ======
  const docColumns: ColumnsType<KnowledgeDoc> = [
    {
      title: "文件标题",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: KnowledgeDoc) => (
        <Space>
          {fileIcon(record.file_type)}
          <div>
            <Text strong>{title}</Text>
            {record.file_name && (
              <div><Text type="secondary" style={{ fontSize: 12 }}>{record.file_name}</Text></div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (cat: string) => cat || "通用",
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
      title: "知识点数",
      key: "points",
      width: 100,
      render: (_: any, record: KnowledgeDoc) => {
        const points = Array.isArray(record.ai_key_points) ? record.ai_key_points.length : 0;
        return points > 0 ? <Tag color="blue">{points} 个</Tag> : <Text type="secondary">-</Text>;
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
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (t: string) => new Date(t).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_: any, record: KnowledgeDoc) => (
        <Space>
          <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setDrawerDoc(record); }}>
            基础信息
          </Button>
        </Space>
      ),
    },
  ];

  // ====== Inside a Knowledge Base ======
  if (currentKB) {
    return (
      <DashboardLayout title="知识库" description="管理培训资料，AI 自动提取知识点">
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => { setCurrentKB(null); setSearch(""); }} />
          <Typography.Title level={4} style={{ margin: 0 }}>{currentKB.name}</Typography.Title>
        </div>

        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <Input
            placeholder="输入关键词搜索"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
            新建文件
          </Button>
        </div>

        <Table
          columns={docColumns}
          dataSource={docs}
          rowKey="id"
          loading={docsLoading}
          onRow={(record) => ({
            onClick: () => setDrawerDoc(record),
            style: { cursor: "pointer" },
          })}
          pagination={{ pageSize: 20 }}
        />

        <UploadDocModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          knowledgeBaseId={currentKB.id}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
            queryClient.invalidateQueries({ queryKey: ["knowledge-doc-counts"] });
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

  // ====== Root: Knowledge Bases List ======
  return (
    <DashboardLayout title="知识库" description="管理培训资料，AI 自动提取知识点">
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Input
          placeholder="输入关键词搜索"
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          新建知识库
        </Button>
      </div>

      <Table
        columns={kbColumns}
        dataSource={knowledgeBases.filter(kb => !search || kb.name.includes(search))}
        rowKey="id"
        loading={kbLoading}
        onRow={(record) => ({
          onClick: () => setCurrentKB(record),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 20 }}
      />

      {/* Create Knowledge Base Modal */}
      <Modal
        title="新建"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createKBMutation.isPending}
        okText="确定"
        cancelText="取消"
        destroyOnClose
        zIndex={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createKBMutation.mutate(values)}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: "请输入知识库名称" }]}>
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item name="description" label="知识库描述" rules={[{ required: true, message: "请输入知识库描述" }]}>
            <Input.TextArea rows={3} placeholder="请输入知识库描述" showCount maxLength={2000} />
          </Form.Item>
          <Form.Item name="authority_level" label="文档权威性" initialValue="中">
            <Select options={authorityOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
