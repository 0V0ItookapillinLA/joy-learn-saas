import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, Card, Statistic, Row, Col, Input, Button, Table, Tag, Space, Avatar, Tooltip, message } from "antd";
import { PlusOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { PracticeEditSheet } from "@/components/practices/PracticeEditSheet";
import { usePracticeSessions, useCreatePracticeSession, useDeletePracticeSession } from "@/hooks/usePracticeSessions";
import type { ColumnsType } from "antd/es/table";

export default function PracticePlanList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<any>(null);

  const { data: practices, isLoading } = usePracticeSessions();
  const createMutation = useCreatePracticeSession();
  const deleteMutation = useDeletePracticeSession();

  const filteredPractices = (practices || []).filter(
    (practice) =>
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (practice.ai_role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingPractice(null);
    setSheetOpen(true);
  };

  const handleEdit = (practice: any) => {
    setEditingPractice({
      id: practice.id,
      title: practice.title,
      scenarioDescription: practice.scenario_description || "",
      aiRoleId: "1",
      aiRoleInfo: practice.ai_role || "",
      traineeRole: practice.trainee_role || "",
      dialogueGoal: practice.description || "",
      passScore: 50,
      assessmentItems: practice.scoring_criteria?.items || [],
    });
    setSheetOpen(true);
  };

  const handleSave = async (data: any) => {
    const scoringCriteria = {
      items: data.assessmentItems,
      passScore: data.passScore,
    };

    await createMutation.mutateAsync({
      title: data.title,
      description: data.dialogueGoal,
      scenario_description: data.scenarioDescription,
      ai_role: data.aiRoleInfo,
      trainee_role: data.traineeRole,
      scoring_criteria: scoringCriteria,
      practice_mode: 'free_dialogue',
    });
  };

  const handleCopy = (practice: any) => {
    message.success(`已复制练习：${practice.title}`);
  };

  const handleDelete = (practice: any) => {
    deleteMutation.mutate(practice.id);
  };

  const handlePreview = (practice: any) => {
    message.info(`预览练习：${practice.title}`);
  };

  const handleInvite = (practice: any) => {
    message.info(`邀请学员参加：${practice.title}`);
  };

  // Stats
  const totalPractices = filteredPractices.length;
  const activePractices = filteredPractices.length;

  const columns: ColumnsType<any> = [
    {
      title: "练习名称",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500 truncate max-w-[200px]">
            {record.scenario_description || record.description}
          </div>
        </div>
      ),
    },
    {
      title: "AI角色",
      dataIndex: "ai_role",
      key: "ai_role",
      render: (text) => <Tag>{text?.slice(0, 20) || "未设置"}</Tag>,
    },
    {
      title: "练习模式",
      dataIndex: "practice_mode",
      key: "practice_mode",
      render: (mode) => (
        <Tag color="blue">
          {mode === 'free_dialogue' ? '自由对话' : '固定剧本'}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleInvite(record)}>
            邀请
          </Button>
          <Button type="link" size="small" onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleCopy(record)}>
            复制
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="练习计划" description="管理AI对话练习场景">
      <div className="space-y-6">
        {/* Stats */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="练习场景" value={totalPractices} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="已启用" value={activePractices} valueStyle={{ color: "#3b82f6" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="练习人数" value={0} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="使用次数" value={0} />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Input
            placeholder="搜索练习名称、AI角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            style={{ width: 320 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建练习计划
          </Button>
        </div>

        {/* Table */}
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredPractices}
            rowKey="id"
            loading={isLoading}
            locale={{
              emptyText: (
                <div className="py-8 text-gray-500">
                  <p>暂无练习计划</p>
                  <p className="text-sm">点击"新建练习计划"创建第一个练习</p>
                </div>
              ),
            }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      </div>

      <PracticeEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
        initialData={editingPractice}
      />
    </DashboardLayout>
  );
}
