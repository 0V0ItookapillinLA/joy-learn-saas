import { Tabs } from "antd";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Leaderboard } from "@/components/learning-center/Leaderboard";
import { CheckInCalendar } from "@/components/learning-center/CheckInCalendar";
import { AchievementWall } from "@/components/learning-center/AchievementWall";
import { DepartmentPK } from "@/components/learning-center/DepartmentPK";
import { AIInsightsPanel } from "@/components/learning-center/AIInsightsPanel";

const tabItems = [
  { key: "leaderboard", label: "🏆 实时排行", children: <Leaderboard /> },
  { key: "ai-insights", label: "🤖 AI 数据看板", children: <AIInsightsPanel /> },
  { key: "checkin", label: "📅 打卡监控", children: <CheckInCalendar /> },
  { key: "achievements", label: "🎖 勋章统计", children: <AchievementWall /> },
  { key: "department-pk", label: "⚔️ 部门 PK", children: <DepartmentPK /> },
];

export default function LearningCenter() {
  return (
    <DashboardLayout title="学习中心" description="团队学习数据总览 · 实时赛马 · AI 智能分析">
      <Tabs items={tabItems} size="large" />
    </DashboardLayout>
  );
}
