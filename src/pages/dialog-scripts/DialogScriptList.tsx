import { useState } from "react";
import { Table, Button, Tag, Input, Space, Popconfirm, Typography, Card, Row, Col, Statistic, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, MessageOutlined } from "@ant-design/icons";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDialogScripts, useDeleteDialogScript, type DialogScript } from "@/hooks/useDialogScripts";
import { DialogScriptCreator } from "@/components/dialog-scripts/DialogScriptCreator";
import { format } from "date-fns";

const { Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: "default", label: "草稿" },
  published: { color: "success", label: "已发布" },
};

const modeMap: Record<string, { color: string; label: string }> = {
  practice: { color: "blue", label: "练习模式" },
  exam: { color: "orange", label: "考试模式" },
  practice_then_exam: { color: "purple", label: "先练后考" },
};

export default function DialogScriptList() {
  const [search, setSearch] = useState("");
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<DialogScript | null>(null);

  const { data: scripts = [], isLoading } = useDialogScripts();
  const deleteMutation = useDeleteDialogScript();

  const filtered = scripts.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: scripts.length,
    published: scripts.filter((s) => s.status === "published").length,
    draft: scripts.filter((s) => s.status === "draft").length,
  };

  const columns: ColumnsType<DialogScript> = [
    {
      title: "剧本标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ whiteSpace: "nowrap" }}>{title}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "模式",
      dataIndex: "mode",
      key: "mode",
      width: 120,
      render: (mode: string) => {
        const m = modeMap[mode] || { color: "default", label: mode };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: "对话轮次",
      key: "turns",
      width: 100,
      render: (_, record) => {
        const turns = Array.isArray(record.dialog_turns) ? record.dialog_turns : [];
        return <Tag icon={<MessageOutlined />}>{turns.length} 轮</Tag>;
      },
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
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (v: string) => format(new Date(v), "yyyy-MM-dd HH:mm"),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingScript(record);
              setCreatorOpen(true);
            }}
          />
          <Popconfirm
            title="确定删除此剧本？"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="AI 对话" description="基于知识库生成对话练习与考试剧本">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic title="剧本总数" value={stats.total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="已发布" value={stats.published} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="草稿" value={stats.draft} valueStyle={{ color: "#999" }} />
          </Card>
        </Col>
      </Row>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Input
          placeholder="搜索剧本..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingScript(null);
            setCreatorOpen(true);
          }}
        >
          新建对话剧本
        </Button>
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{
          emptyText: (
            <Empty description="暂无对话剧本" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={() => { setEditingScript(null); setCreatorOpen(true); }}>
                创建第一个剧本
              </Button>
            </Empty>
          ),
        }}
      />

      <DialogScriptCreator
        open={creatorOpen}
        onClose={() => {
          setCreatorOpen(false);
          setEditingScript(null);
        }}
        editingScript={editingScript}
      />
    </DashboardLayout>
  );
}
