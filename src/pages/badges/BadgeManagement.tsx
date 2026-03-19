import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Table, Button, Card, Tag, Space, Modal, Form, Input, InputNumber, Select, Row, Col, Statistic, Typography, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, StarOutlined, FireOutlined, BookOutlined, TeamOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from "@/hooks/useAchievements";

const { TextArea } = Input;
const { Text } = Typography;

const categoryOptions = [
  { label: "学习类", value: "learning", icon: <BookOutlined /> },
  { label: "练习类", value: "practice", icon: <FireOutlined /> },
  { label: "考核类", value: "exam", icon: <StarOutlined /> },
  { label: "社交类", value: "social", icon: <TeamOutlined /> },
  { label: "成就类", value: "milestone", icon: <TrophyOutlined /> },
];

const tierOptions = [
  { label: "铜牌", value: "bronze", color: "#d48806" },
  { label: "银牌", value: "silver", color: "#bfbfbf" },
  { label: "金牌", value: "gold", color: "#faad14" },
  { label: "钻石", value: "diamond", color: "#1677ff" },
];

const iconOptions = [
  { label: "🏆 奖杯", value: "trophy" },
  { label: "⭐ 星星", value: "star" },
  { label: "🔥 火焰", value: "fire" },
  { label: "📚 书本", value: "book" },
  { label: "🎯 靶心", value: "target" },
  { label: "💎 钻石", value: "diamond" },
  { label: "🚀 火箭", value: "rocket" },
  { label: "🎖 勋章", value: "medal" },
  { label: "👑 皇冠", value: "crown" },
  { label: "⚡ 闪电", value: "lightning" },
];

const conditionTypeOptions = [
  { label: "累计学习天数 ≥", value: "check_in_days" },
  { label: "累计学习时长(分钟) ≥", value: "total_duration" },
  { label: "练习次数 ≥", value: "practice_count" },
  { label: "平均得分 ≥", value: "avg_score" },
  { label: "连续打卡天数 ≥", value: "streak_days" },
  { label: "课程完成数 ≥", value: "course_completed" },
  { label: "考试通过数 ≥", value: "exam_passed" },
];

interface BadgeForm {
  id?: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  points: number;
  condition_type: string;
  condition_value: number;
  unlock_message: string;
}

const defaultForm: BadgeForm = {
  name: "", description: "", icon: "trophy", category: "learning",
  tier: "bronze", points: 10, condition_type: "check_in_days",
  condition_value: 7, unlock_message: "",
};

export default function BadgeManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<BadgeForm>(defaultForm);
  const [form] = Form.useForm();

  const { data: achievements, isLoading } = useAchievements();
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  const handleCreate = () => {
    setEditForm(defaultForm);
    form.setFieldsValue(defaultForm);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    const condition = record.condition || {};
    const formValues: BadgeForm = {
      id: record.id,
      name: record.name,
      description: record.description || "",
      icon: record.icon || "trophy",
      category: record.category || "learning",
      tier: (record as any).tier || "bronze",
      points: record.points || 10,
      condition_type: condition.type || "check_in_days",
      condition_value: condition.value || 7,
      unlock_message: (record as any).unlock_message || "",
    };
    setEditForm(formValues);
    form.setFieldsValue(formValues);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description,
        icon: values.icon,
        category: values.category,
        points: values.points,
        condition: { type: values.condition_type, value: values.condition_value },
        tier: values.tier,
        unlock_message: values.unlock_message,
      };

      if (editForm.id) {
        await updateMutation.mutateAsync({ id: editForm.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch {
      message.error("请填写完整信息");
    }
  };

  const tierColorMap: Record<string, string> = { bronze: "#d48806", silver: "#bfbfbf", gold: "#faad14", diamond: "#1677ff" };
  const tierLabelMap: Record<string, string> = { bronze: "铜牌", silver: "银牌", gold: "金牌", diamond: "钻石" };
  const categoryLabelMap: Record<string, string> = { learning: "学习", practice: "练习", exam: "考核", social: "社交", milestone: "成就" };
  const iconEmojiMap: Record<string, string> = { trophy: "🏆", star: "⭐", fire: "🔥", book: "📚", target: "🎯", diamond: "💎", rocket: "🚀", medal: "🎖", crown: "👑", lightning: "⚡" };

  const totalBadges = achievements?.length || 0;
  const totalPoints = achievements?.reduce((s, a) => s + (a.points || 0), 0) || 0;

  return (
    <DashboardLayout title="徽章管理" description="自定义徽章维度、样式、积分与获取条件">
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small"><Statistic title="徽章总数" value={totalBadges} prefix={<TrophyOutlined style={{ color: "#faad14" }} />} /></Card>
          </Col>
          <Col span={6}>
            <Card size="small"><Statistic title="总积分池" value={totalPoints} prefix={<StarOutlined style={{ color: "#1677ff" }} />} /></Card>
          </Col>
          <Col span={6}>
            <Card size="small"><Statistic title="分类数" value={new Set(achievements?.map(a => a.category)).size || 0} prefix={<BookOutlined style={{ color: "#52c41a" }} />} /></Card>
          </Col>
          <Col span={6}>
            <Card size="small"><Statistic title="最高积分" value={Math.max(...(achievements?.map(a => a.points) || [0]))} prefix={<ThunderboltOutlined style={{ color: "#ff4d4f" }} />} /></Card>
          </Col>
        </Row>
      </div>

      <Card
        title="徽章列表"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建徽章</Button>}
      >
        <Table
          dataSource={achievements || []}
          rowKey="id"
          loading={isLoading}
          columns={[
            {
              title: "徽章",
              key: "badge",
              render: (_, record: any) => (
                <Space>
                  <span style={{ fontSize: 24 }}>{iconEmojiMap[record.icon] || "🏆"}</span>
                  <div>
                    <Text strong>{record.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
                  </div>
                </Space>
              ),
            },
            {
              title: "分类",
              dataIndex: "category",
              width: 80,
              render: (c: string) => <Tag>{categoryLabelMap[c] || c}</Tag>,
            },
            {
              title: "等级",
              key: "tier",
              width: 80,
              render: (_, record: any) => {
                const tier = (record as any).tier || "bronze";
                return <Tag color={tierColorMap[tier]}>{tierLabelMap[tier] || tier}</Tag>;
              },
            },
            {
              title: "积分",
              dataIndex: "points",
              width: 80,
              sorter: (a: any, b: any) => a.points - b.points,
              render: (p: number) => <Text strong style={{ color: "#faad14" }}>{p}</Text>,
            },
            {
              title: "获取条件",
              key: "condition",
              render: (_, record: any) => {
                const cond = record.condition as any;
                if (!cond?.type) return <Text type="secondary">未设置</Text>;
                const label = conditionTypeOptions.find(o => o.value === cond.type)?.label || cond.type;
                return <Text>{label} {cond.value}</Text>;
              },
            },
            {
              title: "操作",
              key: "action",
              width: 120,
              render: (_, record: any) => (
                <Space>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                  <Popconfirm title="确定删除？" onConfirm={() => deleteMutation.mutate(record.id)}>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editForm.id ? "编辑徽章" : "新建徽章"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={640}
      >
        <Form form={form} layout="vertical" initialValues={editForm}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="徽章名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
                <Input placeholder="如：学习达人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="图标" name="icon">
                <Select options={iconOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述" name="description">
            <TextArea rows={2} placeholder="徽章说明" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="分类" name="category">
                <Select options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="等级" name="tier">
                <Select options={tierOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="积分" name="points" rules={[{ required: true }]}>
                <InputNumber min={1} max={1000} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Text strong style={{ display: "block", marginBottom: 8 }}>获取条件</Text>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="condition_type">
                <Select options={conditionTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="condition_value">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="解锁提示语" name="unlock_message">
            <Input placeholder="恭喜获得XX徽章！" />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
