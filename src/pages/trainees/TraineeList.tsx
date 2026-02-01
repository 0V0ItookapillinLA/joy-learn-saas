import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Dropdown,
  Row,
  Col,
  Statistic,
  Space,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserAddOutlined,
  EyeOutlined,
  LineChartOutlined,
  MailOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface Trainee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  department: string;
  status: "active" | "inactive" | "pending";
  enrolledPlans: number;
  completedPlans: number;
  avgScore: number;
  lastActive: string | null;
}

// Mock trainees data
const mockTrainees: Trainee[] = [
  {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    avatar: null,
    department: "销售部",
    status: "active",
    enrolledPlans: 3,
    completedPlans: 1,
    avgScore: 85,
    lastActive: "2024-01-25",
  },
  {
    id: "2",
    name: "李四",
    email: "lisi@example.com",
    avatar: null,
    department: "客服部",
    status: "active",
    enrolledPlans: 2,
    completedPlans: 2,
    avgScore: 92,
    lastActive: "2024-01-24",
  },
  {
    id: "3",
    name: "王五",
    email: "wangwu@example.com",
    avatar: null,
    department: "市场部",
    status: "inactive",
    enrolledPlans: 1,
    completedPlans: 0,
    avgScore: 0,
    lastActive: "2024-01-10",
  },
  {
    id: "4",
    name: "赵六",
    email: "zhaoliu@example.com",
    avatar: null,
    department: "技术部",
    status: "active",
    enrolledPlans: 4,
    completedPlans: 3,
    avgScore: 88,
    lastActive: "2024-01-25",
  },
  {
    id: "5",
    name: "钱七",
    email: "qianqi@example.com",
    avatar: null,
    department: "销售部",
    status: "pending",
    enrolledPlans: 0,
    completedPlans: 0,
    avgScore: 0,
    lastActive: null,
  },
];

const statusConfig = {
  active: { label: "活跃", color: "success" },
  inactive: { label: "不活跃", color: "default" },
  pending: { label: "待激活", color: "warning" },
};

export default function TraineeList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrainees = mockTrainees.filter(
    (trainee) =>
      trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnsType<Trainee> = [
    {
      title: "学员",
      key: "trainee",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: "#1677ff" }}>
            {record.name.slice(0, 2)}
          </Avatar>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].label}
        </Tag>
      ),
    },
    {
      title: "参与培训",
      key: "training",
      render: (_, record) => (
        <span>
          <span className="font-medium">{record.completedPlans}</span>
          <span className="text-gray-500">/{record.enrolledPlans} 完成</span>
        </span>
      ),
    },
    {
      title: "平均得分",
      dataIndex: "avgScore",
      key: "avgScore",
      render: (score: number) =>
        score > 0 ? (
          <span style={{ color: score >= 80 ? "#52c41a" : "#faad14", fontWeight: 500 }}>
            {score}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        ),
    },
    {
      title: "最近活跃",
      dataIndex: "lastActive",
      key: "lastActive",
      render: (date: string | null) => (
        <span className="text-gray-500">{date || "从未登录"}</span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "view", icon: <EyeOutlined />, label: "查看详情" },
              { key: "growth", icon: <LineChartOutlined />, label: "成长地图" },
              { key: "mail", icon: <MailOutlined />, label: "发送提醒" },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <DashboardLayout title="学员列表" description="查看和管理所有学员">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Space>
            <Input
              placeholder="搜索学员姓名、邮箱或部门..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Button icon={<FilterOutlined />}>筛选</Button>
          </Space>
          <Space>
            <Button icon={<DownloadOutlined />}>导出</Button>
            <Button type="primary" icon={<UserAddOutlined />}>
              邀请学员
            </Button>
          </Space>
        </div>

        {/* Stats Overview */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic title="总学员数" value={248} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃学员"
                value={186}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待激活"
                value={42}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均得分"
                value={85.2}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Trainees Table */}
        <Card title={`学员列表（共 ${filteredTrainees.length} 名学员）`}>
          <Table
            columns={columns}
            dataSource={filteredTrainees}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
