import { Card, Row, Col, Typography, Tag, Progress, Empty } from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  BookOutlined,
  FireOutlined,
  CheckCircleOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const { Text, Title } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  trophy: <TrophyOutlined style={{ fontSize: 28 }} />,
  star: <StarOutlined style={{ fontSize: 28 }} />,
  thunder: <ThunderboltOutlined style={{ fontSize: 28 }} />,
  team: <TeamOutlined style={{ fontSize: 28 }} />,
  book: <BookOutlined style={{ fontSize: 28 }} />,
  fire: <FireOutlined style={{ fontSize: 28 }} />,
  check: <CheckCircleOutlined style={{ fontSize: 28 }} />,
  rocket: <RocketOutlined style={{ fontSize: 28 }} />,
};

const categoryColors: Record<string, string> = {
  learning: "blue",
  practice: "green",
  exam: "orange",
  social: "purple",
};

const categoryLabels: Record<string, string> = {
  learning: "学习",
  practice: "练习",
  exam: "考核",
  social: "社交",
};

// Default achievements for display
const defaultAchievements = [
  { id: "1", name: "初出茅庐", description: "完成第一次练习", icon: "star", category: "practice", points: 10, earned: true },
  { id: "2", name: "学霸之路", description: "连续打卡7天", icon: "fire", category: "learning", points: 20, earned: true },
  { id: "3", name: "满分达人", description: "练习中获得满分", icon: "trophy", category: "practice", points: 30, earned: true },
  { id: "4", name: "知识渊博", description: "完成10门课程", icon: "book", category: "learning", points: 50, earned: false },
  { id: "5", name: "团队之星", description: "帮助5位同事", icon: "team", category: "social", points: 25, earned: false },
  { id: "6", name: "闪电侠", description: "5分钟内完成练习", icon: "thunder", category: "practice", points: 15, earned: false },
  { id: "7", name: "持之以恒", description: "连续打卡30天", icon: "fire", category: "learning", points: 100, earned: false },
  { id: "8", name: "火箭起飞", description: "一个月内晋升一级", icon: "rocket", category: "exam", points: 80, earned: false },
];

export function AchievementWall() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      const { data: achievements } = await supabase
        .from("achievements" as any)
        .select("*");

      const { data: earned } = await supabase
        .from("user_achievements" as any)
        .select("achievement_id")
        .eq("user_id", user!.id);

      const earnedSet = new Set((earned || []).map((e: any) => e.achievement_id));

      return {
        achievements: (achievements || []) as any[],
        earnedSet,
      };
    },
    enabled: !!user,
  });

  const achievements = data?.achievements?.length
    ? data.achievements.map((a: any) => ({ ...a, earned: data.earnedSet.has(a.id) }))
    : defaultAchievements;

  const earnedCount = achievements.filter((a: any) => a.earned).length;
  const totalPoints = achievements.filter((a: any) => a.earned).reduce((sum: number, a: any) => sum + (a.points || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
        <div>
          <Text type="secondary">已解锁</Text>
          <Title level={3} style={{ margin: 0 }}>{earnedCount}/{achievements.length}</Title>
        </div>
        <div>
          <Text type="secondary">总积分</Text>
          <Title level={3} style={{ margin: 0, color: "#faad14" }}>{totalPoints}</Title>
        </div>
        <Progress
          percent={Math.round((earnedCount / achievements.length) * 100)}
          style={{ flex: 1, maxWidth: 300 }}
        />
      </div>

      <Row gutter={[16, 16]}>
        {achievements.map((ach: any) => (
          <Col key={ach.id} xs={12} sm={8} md={6}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                opacity: ach.earned ? 1 : 0.4,
                filter: ach.earned ? "none" : "grayscale(100%)",
                border: ach.earned ? "1px solid #52c41a" : undefined,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                {iconMap[ach.icon] || <TrophyOutlined style={{ fontSize: 28 }} />}
              </div>
              <Text strong style={{ display: "block" }}>{ach.name}</Text>
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                {ach.description}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={categoryColors[ach.category] || "default"}>
                  {categoryLabels[ach.category] || ach.category}
                </Tag>
                <Tag color="gold">{ach.points} 分</Tag>
              </div>
              {ach.earned && (
                <CheckCircleOutlined style={{ color: "#52c41a", position: "absolute", top: 8, right: 8 }} />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
