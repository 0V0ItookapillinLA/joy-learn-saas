import { Typography, Card, Statistic, Row, Col, Table, Tag, Avatar, Select, Space } from "antd";
import { FireOutlined, CalendarOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Text, Title } = Typography;

interface MemberCheckIn {
  id: string;
  name: string;
  department: string;
  monthDays: number;
  currentStreak: number;
  totalHours: number;
  lastActive: string;
}

const mockMembers: MemberCheckIn[] = [
  { id: "1", name: "张三", department: "销售一组", monthDays: 22, currentStreak: 15, totalHours: 48, lastActive: "2026-02-10" },
  { id: "2", name: "李四", department: "销售一组", monthDays: 18, currentStreak: 8, totalHours: 36, lastActive: "2026-02-09" },
  { id: "3", name: "王五", department: "客服组", monthDays: 20, currentStreak: 12, totalHours: 42, lastActive: "2026-02-10" },
  { id: "4", name: "赵六", department: "销售二组", monthDays: 12, currentStreak: 3, totalHours: 24, lastActive: "2026-02-07" },
  { id: "5", name: "钱七", department: "客服组", monthDays: 25, currentStreak: 25, totalHours: 56, lastActive: "2026-02-10" },
  { id: "6", name: "孙八", department: "销售一组", monthDays: 8, currentStreak: 0, totalHours: 16, lastActive: "2026-02-03" },
  { id: "7", name: "周九", department: "销售二组", monthDays: 15, currentStreak: 5, totalHours: 30, lastActive: "2026-02-09" },
  { id: "8", name: "吴十", department: "客服组", monthDays: 10, currentStreak: 2, totalHours: 20, lastActive: "2026-02-08" },
];

const departments = ["全部", "销售一组", "销售二组", "客服组"];

export function CheckInCalendar() {
  const [deptFilter, setDeptFilter] = useState("全部");

  const filtered = deptFilter === "全部" ? mockMembers : mockMembers.filter(m => m.department === deptFilter);

  const avgMonthDays = Math.round(filtered.reduce((s, m) => s + m.monthDays, 0) / filtered.length);
  const avgStreak = Math.round(filtered.reduce((s, m) => s + m.currentStreak, 0) / filtered.length);
  const totalHours = filtered.reduce((s, m) => s + m.totalHours, 0);
  const activeLast3Days = filtered.filter(m => {
    const d = new Date(m.lastActive);
    const now = new Date();
    return (now.getTime() - d.getTime()) / 86400000 <= 3;
  }).length;

  return (
    <div>
      {/* Filter */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Space>
          <TeamOutlined />
          <Text strong>团队打卡概览</Text>
        </Space>
        <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 140 }}
          options={departments.map(d => ({ label: d, value: d }))}
        />
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="人均本月打卡"
              value={avgMonthDays}
              suffix="天"
              prefix={<CalendarOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="人均连续打卡"
              value={avgStreak}
              suffix="天"
              prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队总学习时长"
              value={totalHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="近3天活跃人数"
              value={activeLast3Days}
              suffix={`/ ${filtered.length}`}
              prefix={<UserOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Member Table */}
      <Table
        dataSource={filtered}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: "成员",
            dataIndex: "name",
            render: (name: string) => (
              <Space>
                <Avatar size="small" style={{ background: "#1677ff" }}>{name[0]}</Avatar>
                <Text strong>{name}</Text>
              </Space>
            ),
          },
          { title: "部门", dataIndex: "department", width: 120 },
          {
            title: "本月打卡",
            dataIndex: "monthDays",
            width: 110,
            sorter: (a, b) => a.monthDays - b.monthDays,
            render: (d: number) => <Tag color={d >= 20 ? "green" : d >= 10 ? "blue" : "orange"}>{d} 天</Tag>,
          },
          {
            title: "连续打卡",
            dataIndex: "currentStreak",
            width: 110,
            sorter: (a, b) => a.currentStreak - b.currentStreak,
            render: (d: number) => (
              <span>
                {d > 0 && <FireOutlined style={{ color: "#ff4d4f", marginRight: 4 }} />}
                {d} 天
              </span>
            ),
          },
          {
            title: "累计时长",
            dataIndex: "totalHours",
            width: 100,
            sorter: (a, b) => a.totalHours - b.totalHours,
            render: (h: number) => `${h}h`,
          },
          {
            title: "最后活跃",
            dataIndex: "lastActive",
            width: 120,
            render: (d: string) => {
              const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
              return (
                <span>
                  {d}
                  {days > 3 && <Tag color="red" style={{ marginLeft: 4 }}>⚠ {days}天未活跃</Tag>}
                </span>
              );
            },
          },
        ]}
      />
    </div>
  );
}
