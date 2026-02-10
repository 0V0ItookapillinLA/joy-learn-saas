import { useState } from "react";
import { Table, Select, Space, Typography, Avatar, Tag } from "antd";
import { TrophyOutlined, CrownOutlined, FireOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { Text } = Typography;

const timeRangeOptions = [
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
  { label: "总榜", value: "all" },
];

const rankIcons: Record<number, React.ReactNode> = {
  1: <CrownOutlined style={{ color: "#faad14", fontSize: 18 }} />,
  2: <CrownOutlined style={{ color: "#bfbfbf", fontSize: 16 }} />,
  3: <CrownOutlined style={{ color: "#d48806", fontSize: 14 }} />,
};

interface LeaderEntry {
  user_id: string;
  full_name: string;
  department_name: string | null;
  total_duration: number;
  check_in_days: number;
}

export function Leaderboard() {
  const [timeRange, setTimeRange] = useState("month");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", timeRange],
    queryFn: async () => {
      // Get streaks with profile info
      let query = supabase
        .from("learning_streaks" as any)
        .select("user_id, duration_minutes, check_in_date");

      if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("check_in_date", weekAgo.toISOString().split("T")[0]);
      } else if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        query = query.gte("check_in_date", monthAgo.toISOString().split("T")[0]);
      }

      const { data: streaks, error } = await query;
      if (error) throw error;

      // Aggregate by user
      const userMap = new Map<string, { total: number; days: Set<string> }>();
      for (const s of (streaks || []) as any[]) {
        const existing = userMap.get(s.user_id) || { total: 0, days: new Set<string>() };
        existing.total += s.duration_minutes || 0;
        existing.days.add(s.check_in_date);
        userMap.set(s.user_id, existing);
      }

      // Get profiles
      const userIds = Array.from(userMap.keys());
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, department_id")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const result: LeaderEntry[] = userIds.map((uid) => {
        const stats = userMap.get(uid)!;
        const profile = profileMap.get(uid);
        return {
          user_id: uid,
          full_name: profile?.full_name || "未知用户",
          department_name: null,
          total_duration: stats.total,
          check_in_days: stats.days.size,
        };
      });

      result.sort((a, b) => b.total_duration - a.total_duration);
      return result;
    },
  });

  // Mock data for display when no real data
  const displayData = entries.length > 0 ? entries : [
    { user_id: "1", full_name: "张三", department_name: "销售部", total_duration: 480, check_in_days: 22 },
    { user_id: "2", full_name: "李四", department_name: "客服部", total_duration: 360, check_in_days: 18 },
    { user_id: "3", full_name: "王五", department_name: "销售部", total_duration: 300, check_in_days: 15 },
    { user_id: "4", full_name: "赵六", department_name: "市场部", total_duration: 240, check_in_days: 12 },
    { user_id: "5", full_name: "钱七", department_name: "客服部", total_duration: 180, check_in_days: 10 },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Select
          options={timeRangeOptions}
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 100 }}
        />
      </div>

      <Table
        loading={isLoading}
        dataSource={displayData}
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
            title: "学员",
            dataIndex: "full_name",
            render: (name: string) => (
              <Space>
                <Avatar size="small" style={{ background: "#1677ff" }}>
                  {name.slice(0, 1)}
                </Avatar>
                <Text strong>{name}</Text>
              </Space>
            ),
          },
          {
            title: "部门",
            dataIndex: "department_name",
            width: 120,
            render: (d: string | null) => d || "-",
          },
          {
            title: "学习时长",
            dataIndex: "total_duration",
            width: 120,
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
            render: (d: number) => <Tag icon={<FireOutlined />} color="orange">{d} 天</Tag>,
          },
        ]}
      />
    </div>
  );
}
