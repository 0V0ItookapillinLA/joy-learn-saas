import { Card, Row, Col, Typography, Tag, Progress, Select, Table, Space, Avatar, Statistic } from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  BookOutlined,
  FireOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  UserOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Text, Title } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  trophy: <TrophyOutlined style={{ fontSize: 20 }} />,
  star: <StarOutlined style={{ fontSize: 20 }} />,
  thunder: <ThunderboltOutlined style={{ fontSize: 20 }} />,
  team: <TeamOutlined style={{ fontSize: 20 }} />,
  book: <BookOutlined style={{ fontSize: 20 }} />,
  fire: <FireOutlined style={{ fontSize: 20 }} />,
  check: <CheckCircleOutlined style={{ fontSize: 20 }} />,
  rocket: <RocketOutlined style={{ fontSize: 20 }} />,
};

const allAchievements = [
  { id: "1", name: "初出茅庐", icon: "star", points: 10 },
  { id: "2", name: "学霸之路", icon: "fire", points: 20 },
  { id: "3", name: "满分达人", icon: "trophy", points: 30 },
  { id: "4", name: "知识渊博", icon: "book", points: 50 },
  { id: "5", name: "团队之星", icon: "team", points: 25 },
  { id: "6", name: "闪电侠", icon: "thunder", points: 15 },
  { id: "7", name: "持之以恒", icon: "fire", points: 100 },
  { id: "8", name: "火箭起飞", icon: "rocket", points: 80 },
];

interface MemberAchievement {
  id: string;
  name: string;
  department: string;
  earnedCount: number;
  totalPoints: number;
  latestAchievement: string;
  earnedIds: string[];
}

const mockMembers: MemberAchievement[] = [
  { id: "1", name: "钱七", department: "客服组", earnedCount: 6, totalPoints: 150, latestAchievement: "持之以恒", earnedIds: ["1","2","3","5","6","7"] },
  { id: "2", name: "张三", department: "销售一组", earnedCount: 5, totalPoints: 105, latestAchievement: "知识渊博", earnedIds: ["1","2","3","4","6"] },
  { id: "3", name: "王五", department: "客服组", earnedCount: 4, totalPoints: 75, latestAchievement: "满分达人", earnedIds: ["1","2","3","5"] },
  { id: "4", name: "李四", department: "销售一组", earnedCount: 3, totalPoints: 45, latestAchievement: "学霸之路", earnedIds: ["1","2","6"] },
  { id: "5", name: "周九", department: "销售二组", earnedCount: 2, totalPoints: 30, latestAchievement: "初出茅庐", earnedIds: ["1","2"] },
  { id: "6", name: "赵六", department: "销售二组", earnedCount: 1, totalPoints: 10, latestAchievement: "初出茅庐", earnedIds: ["1"] },
  { id: "7", name: "孙八", department: "销售一组", earnedCount: 1, totalPoints: 10, latestAchievement: "初出茅庐", earnedIds: ["1"] },
  { id: "8", name: "吴十", department: "客服组", earnedCount: 0, totalPoints: 0, latestAchievement: "-", earnedIds: [] },
];

const departments = ["全部", "销售一组", "销售二组", "客服组"];

export function AchievementWall() {
  const [deptFilter, setDeptFilter] = useState("全部");
  const filtered = deptFilter === "全部" ? mockMembers : mockMembers.filter(m => m.department === deptFilter);

  const totalEarned = filtered.reduce((s, m) => s + m.earnedCount, 0);
  const avgEarned = filtered.length > 0 ? (totalEarned / filtered.length).toFixed(1) : "0";
  const topScorer = [...filtered].sort((a, b) => b.totalPoints - a.totalPoints)[0];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Space>
          <TrophyOutlined />
          <Text strong>团队成就概览</Text>
        </Space>
        <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 140 }}
          options={departments.map(d => ({ label: d, value: d }))}
        />
      </div>

      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="团队总勋章数" value={totalEarned} prefix={<TrophyOutlined style={{ color: "#faad14" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="人均勋章" value={avgEarned} prefix={<StarOutlined style={{ color: "#1677ff" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="勋章达人" value={topScorer?.name || "-"} prefix={<CrownOutlined style={{ color: "#faad14" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队完成率"
              value={Math.round((totalEarned / (filtered.length * allAchievements.length)) * 100)}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
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
            title: "已获勋章",
            dataIndex: "earnedCount",
            width: 120,
            sorter: (a, b) => a.earnedCount - b.earnedCount,
            render: (c: number) => (
              <span>
                <TrophyOutlined style={{ color: "#faad14", marginRight: 4 }} />
                {c} / {allAchievements.length}
              </span>
            ),
          },
          {
            title: "勋章详情",
            key: "badges",
            render: (_: any, record: MemberAchievement) => (
              <div style={{ display: "flex", gap: 4 }}>
                {allAchievements.map(a => (
                  <span
                    key={a.id}
                    style={{
                      opacity: record.earnedIds.includes(a.id) ? 1 : 0.2,
                      filter: record.earnedIds.includes(a.id) ? "none" : "grayscale(100%)",
                    }}
                    title={a.name}
                  >
                    {iconMap[a.icon]}
                  </span>
                ))}
              </div>
            ),
          },
          {
            title: "总积分",
            dataIndex: "totalPoints",
            width: 100,
            sorter: (a, b) => a.totalPoints - b.totalPoints,
            render: (p: number) => <Tag color="gold">{p} 分</Tag>,
          },
          {
            title: "最新勋章",
            dataIndex: "latestAchievement",
            width: 120,
          },
        ]}
      />
    </div>
  );
}
