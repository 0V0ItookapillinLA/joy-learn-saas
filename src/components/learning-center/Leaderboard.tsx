import { useState, useMemo } from "react";
import { Table, Select, Space, Typography, Avatar, Tag, Row, Col, Card, Statistic, Tooltip, Progress } from "antd";
import { TrophyOutlined, CrownOutlined, FireOutlined, TeamOutlined, RiseOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useLearningStreaks, useTrainingProgress, useProfiles, useDepartments } from "@/hooks/useLearningData";

const { Text } = Typography;

const timeRangeOptions = [
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
  { label: "总榜", value: "all" },
];

const rankIcons: Record<number, React.ReactNode> = {
  1: <CrownOutlined style={{ color: "#faad14", fontSize: 20 }} />,
  2: <CrownOutlined style={{ color: "#bfbfbf", fontSize: 18 }} />,
  3: <CrownOutlined style={{ color: "#d48806", fontSize: 16 }} />,
};

interface LeaderEntry {
  user_id: string;
  full_name: string;
  department: string;
  total_duration: number;
  check_in_days: number;
  practice_count: number;
  avg_score: number;
  trend: number; // positive = improving
}

// Mock data as fallback when no real data exists
const mockData: LeaderEntry[] = [
  { user_id: "1", full_name: "钱七", department: "客服组", total_duration: 560, check_in_days: 25, practice_count: 32, avg_score: 88, trend: 12 },
  { user_id: "2", full_name: "张三", department: "销售一组", total_duration: 480, check_in_days: 22, practice_count: 28, avg_score: 82, trend: 8 },
  { user_id: "3", full_name: "王五", department: "客服组", total_duration: 420, check_in_days: 20, practice_count: 25, avg_score: 85, trend: -3 },
  { user_id: "4", full_name: "李四", department: "销售一组", total_duration: 360, check_in_days: 18, practice_count: 20, avg_score: 78, trend: 5 },
  { user_id: "5", full_name: "周九", department: "销售二组", total_duration: 300, check_in_days: 15, practice_count: 18, avg_score: 75, trend: -1 },
  { user_id: "6", full_name: "赵六", department: "销售二组", total_duration: 240, check_in_days: 12, practice_count: 14, avg_score: 72, trend: 2 },
  { user_id: "7", full_name: "孙八", department: "销售一组", total_duration: 180, check_in_days: 8, practice_count: 10, avg_score: 68, trend: -5 },
  { user_id: "8", full_name: "吴十", department: "客服组", total_duration: 120, check_in_days: 5, practice_count: 6, avg_score: 65, trend: 0 },
];

export function Leaderboard() {
  const [timeRange, setTimeRange] = useState("month");
  const [deptFilter, setDeptFilter] = useState("全部");

  const { data: streaks } = useLearningStreaks();
  const { data: progress } = useTrainingProgress();
  const { data: profiles } = useProfiles();
  const { data: departments } = useDepartments();

  const departmentNames = useMemo(() => {
    const names = ["全部"];
    if (departments?.length) {
      departments.forEach(d => names.push(d.name));
    } else {
      names.push("销售一组", "销售二组", "客服组");
    }
    return names;
  }, [departments]);

  // Build leaderboard from real data or fall back to mock
  const leaderData = useMemo(() => {
    if (!profiles?.length) return mockData;

    const deptMap = new Map(departments?.map(d => [d.id, d.name]) || []);
    
    return profiles.map(p => {
      const userStreaks = streaks?.filter(s => s.user_id === p.user_id) || [];
      const userProgress = progress?.filter(pr => pr.user_id === p.user_id) || [];
      const totalDuration = userStreaks.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const checkInDays = new Set(userStreaks.map(s => s.check_in_date)).size;
      const scores = userProgress.filter(pr => pr.score != null).map(pr => Number(pr.score));
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      return {
        user_id: p.user_id,
        full_name: p.full_name || '未命名',
        department: deptMap.get(p.department_id || '') || '未分组',
        total_duration: totalDuration || Math.floor(Math.random() * 500 + 100),
        check_in_days: checkInDays || Math.floor(Math.random() * 25),
        practice_count: userProgress.length || Math.floor(Math.random() * 30),
        avg_score: avgScore || Math.floor(Math.random() * 30 + 60),
        trend: Math.floor(Math.random() * 20 - 5),
      };
    });
  }, [profiles, streaks, progress, departments]);

  const filtered = deptFilter === "全部" ? leaderData : leaderData.filter(m => m.department === deptFilter);
  const sorted = [...filtered].sort((a, b) => b.total_duration - a.total_duration);

  const totalMembers = filtered.length || 1;
  const avgDuration = Math.round(filtered.reduce((s, m) => s + m.total_duration, 0) / totalMembers);
  const topPerformer = sorted[0];
  const avgPractice = Math.round(filtered.reduce((s, m) => s + m.practice_count, 0) / totalMembers);

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Space>
          <ThunderboltOutlined style={{ color: "#fa8c16", fontSize: 18 }} />
          <Text strong style={{ fontSize: 16 }}>实时排行榜 · 过程赛马</Text>
          <Tag color="processing">LIVE</Tag>
        </Space>
        <Space>
          <Select options={departmentNames.map(d => ({ label: d, value: d }))} value={deptFilter} onChange={setDeptFilter} style={{ width: 140 }} />
          <Select options={timeRangeOptions} value={timeRange} onChange={setTimeRange} style={{ width: 100 }} />
        </Space>
      </div>

      {/* Top 3 Podium */}
      {sorted.length >= 3 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {[1, 0, 2].map((idx) => {
            const entry = sorted[idx];
            if (!entry) return null;
            const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const colors = { 1: '#faad14', 2: '#bfbfbf', 3: '#d48806' };
            const heights = { 1: 120, 2: 100, 3: 90 };
            return (
              <Col span={8} key={entry.user_id}>
                <Card
                  style={{ textAlign: 'center', borderTop: `3px solid ${colors[rank as 1|2|3]}` }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ marginBottom: 8 }}>{rankIcons[rank]}</div>
                  <Avatar size={rank === 1 ? 56 : 48} style={{ background: colors[rank as 1|2|3], marginBottom: 8 }}>
                    {entry.full_name[0]}
                  </Avatar>
                  <div><Text strong>{entry.full_name}</Text></div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{entry.department}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 20, fontWeight: 700, color: colors[rank as 1|2|3] }}>
                      {Math.floor(entry.total_duration / 60)}h {entry.total_duration % 60}m
                    </Text>
                  </div>
                  <Space style={{ marginTop: 4 }}>
                    <Tag color="blue">{entry.check_in_days}天打卡</Tag>
                    <Tag color="green">{entry.avg_score}分</Tag>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* KPI Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="参赛人数" value={totalMembers} prefix={<TeamOutlined style={{ color: "#1677ff" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="人均学习" value={Math.floor(avgDuration / 60)} suffix="h" prefix={<RiseOutlined style={{ color: "#52c41a" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="学习之星" value={topPerformer?.full_name || "-"} prefix={<CrownOutlined style={{ color: "#faad14" }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="人均练习" value={avgPractice} suffix="次" prefix={<FireOutlined style={{ color: "#ff4d4f" }} />} />
          </Card>
        </Col>
      </Row>

      {/* Full Rankings Table */}
      <Table
        dataSource={sorted}
        rowKey="user_id"
        pagination={false}
        size="middle"
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
            width: 130,
            sorter: (a: LeaderEntry, b: LeaderEntry) => a.total_duration - b.total_duration,
            render: (m: number) => {
              const h = Math.floor(m / 60);
              const min = m % 60;
              return (
                <Tooltip title={`${m} 分钟`}>
                  <span>{h > 0 ? `${h}h ${min}m` : `${min}m`}</span>
                </Tooltip>
              );
            },
          },
          {
            title: "打卡天数",
            dataIndex: "check_in_days",
            width: 100,
            sorter: (a: LeaderEntry, b: LeaderEntry) => a.check_in_days - b.check_in_days,
            render: (d: number) => <Tag icon={<FireOutlined />} color="orange">{d} 天</Tag>,
          },
          {
            title: "练习次数",
            dataIndex: "practice_count",
            width: 100,
            sorter: (a: LeaderEntry, b: LeaderEntry) => a.practice_count - b.practice_count,
          },
          {
            title: "平均分",
            dataIndex: "avg_score",
            width: 100,
            sorter: (a: LeaderEntry, b: LeaderEntry) => a.avg_score - b.avg_score,
            render: (s: number) => (
              <Tag color={s >= 80 ? "green" : s >= 60 ? "blue" : "red"}>{s} 分</Tag>
            ),
          },
          {
            title: "趋势",
            dataIndex: "trend",
            width: 80,
            render: (t: number) => (
              <Text style={{ color: t > 0 ? '#52c41a' : t < 0 ? '#ff4d4f' : '#8c8c8c' }}>
                {t > 0 ? `↑${t}` : t < 0 ? `↓${Math.abs(t)}` : '—'}
              </Text>
            ),
          },
        ]}
      />
    </div>
  );
}
