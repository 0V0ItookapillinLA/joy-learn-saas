import { useState } from "react";
import { Table, Select, Space, Typography, Avatar, Tag, Row, Col, Card, Statistic } from "antd";
import { TrophyOutlined, CrownOutlined, FireOutlined, TeamOutlined, RiseOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

const timeRangeOptions = [
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
  { label: "总榜", value: "all" },
];

const departments = ["全部", "销售一组", "销售二组", "客服组"];

const rankIcons: Record<number, React.ReactNode> = {
  1: <CrownOutlined style={{ color: "#faad14", fontSize: 18 }} />,
  2: <CrownOutlined style={{ color: "#bfbfbf", fontSize: 16 }} />,
  3: <CrownOutlined style={{ color: "#d48806", fontSize: 14 }} />,
};

interface LeaderEntry {
  user_id: string;
  full_name: string;
  department: string;
  total_duration: number;
  check_in_days: number;
  practice_count: number;
  avg_score: number;
}

const mockData: LeaderEntry[] = [
  { user_id: "1", full_name: "钱七", department: "客服组", total_duration: 560, check_in_days: 25, practice_count: 32, avg_score: 88 },
  { user_id: "2", full_name: "张三", department: "销售一组", total_duration: 480, check_in_days: 22, practice_count: 28, avg_score: 82 },
  { user_id: "3", full_name: "王五", department: "客服组", total_duration: 420, check_in_days: 20, practice_count: 25, avg_score: 85 },
  { user_id: "4", full_name: "李四", department: "销售一组", total_duration: 360, check_in_days: 18, practice_count: 20, avg_score: 78 },
  { user_id: "5", full_name: "周九", department: "销售二组", total_duration: 300, check_in_days: 15, practice_count: 18, avg_score: 75 },
  { user_id: "6", full_name: "赵六", department: "销售二组", total_duration: 240, check_in_days: 12, practice_count: 14, avg_score: 72 },
  { user_id: "7", full_name: "孙八", department: "销售一组", total_duration: 180, check_in_days: 8, practice_count: 10, avg_score: 68 },
  { user_id: "8", full_name: "吴十", department: "客服组", total_duration: 120, check_in_days: 5, practice_count: 6, avg_score: 65 },
];

export function Leaderboard() {
  const [timeRange, setTimeRange] = useState("month");
  const [deptFilter, setDeptFilter] = useState("全部");

  const filtered = deptFilter === "全部" ? mockData : mockData.filter(m => m.department === deptFilter);
  const sorted = [...filtered].sort((a, b) => b.total_duration - a.total_duration);

  const totalMembers = filtered.length;
  const avgDuration = Math.round(filtered.reduce((s, m) => s + m.total_duration, 0) / totalMembers);
  const topPerformer = sorted[0];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Space>
          <TeamOutlined />
          <Text strong>团队学习排行</Text>
        </Space>
        <Space>
          <Select options={departments.map(d => ({ label: d, value: d }))} value={deptFilter} onChange={setDeptFilter} style={{ width: 140 }} />
          <Select options={timeRangeOptions} value={timeRange} onChange={setTimeRange} style={{ width: 100 }} />
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="团队人数" value={totalMembers} prefix={<TeamOutlined style={{ color: "#1677ff" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="人均学习时长" value={Math.floor(avgDuration / 60)} suffix="h" prefix={<RiseOutlined style={{ color: "#52c41a" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="学习之星" value={topPerformer?.full_name || "-"} prefix={<CrownOutlined style={{ color: "#faad14" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="人均练习次数" value={Math.round(filtered.reduce((s, m) => s + m.practice_count, 0) / totalMembers)} prefix={<FireOutlined style={{ color: "#ff4d4f" }} />} />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={sorted}
        rowKey="user_id"
        pagination={false}
        columns={[
          {
            title: "排名",
            key: "rank",
            width: 70,
            render: (_: any, __: any, index: number) => (
              <span>{rankIcons[index + 1] || <Text type="secondary">{index + 1}</Text>}</span>
            ),
          },
          {
            title: "成员",
            dataIndex: "full_name",
            render: (name: string) => (
              <Space>
                <Avatar size="small" style={{ background: "#1677ff" }}>{name[0]}</Avatar>
                <Text strong>{name}</Text>
              </Space>
            ),
          },
          { title: "部门", dataIndex: "department", width: 120 },
          {
            title: "学习时长",
            dataIndex: "total_duration",
            width: 120,
            sorter: (a, b) => a.total_duration - b.total_duration,
            render: (m: number) => {
              const h = Math.floor(m / 60);
              const min = m % 60;
              return h > 0 ? `${h}h ${min}m` : `${min}m`;
            },
          },
          {
            title: "打卡天数",
            dataIndex: "check_in_days",
            width: 100,
            sorter: (a, b) => a.check_in_days - b.check_in_days,
            render: (d: number) => <Tag icon={<FireOutlined />} color="orange">{d} 天</Tag>,
          },
          {
            title: "练习次数",
            dataIndex: "practice_count",
            width: 100,
            sorter: (a, b) => a.practice_count - b.practice_count,
          },
          {
            title: "平均分",
            dataIndex: "avg_score",
            width: 100,
            sorter: (a, b) => a.avg_score - b.avg_score,
            render: (s: number) => (
              <Tag color={s >= 80 ? "green" : s >= 60 ? "blue" : "red"}>{s} 分</Tag>
            ),
          },
        ]}
      />
    </div>
  );
}
