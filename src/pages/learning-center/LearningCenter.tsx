import { Tabs } from "antd";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Leaderboard } from "@/components/learning-center/Leaderboard";
import { CheckInCalendar } from "@/components/learning-center/CheckInCalendar";
import { AchievementWall } from "@/components/learning-center/AchievementWall";
import { DepartmentPK } from "@/components/learning-center/DepartmentPK";

const tabItems = [
  { key: "leaderboard", label: "排行榜", children: <Leaderboard /> },
  { key: "checkin", label: "学习打卡", children: <CheckInCalendar /> },
  { key: "achievements", label: "成就墙", children: <AchievementWall /> },
  { key: "department-pk", label: "部门 PK", children: <DepartmentPK /> },
];

export default function LearningCenter() {
  return (
    <DashboardLayout title="学习中心" description="排行榜、打卡、成就与部门竞赛">
      <Tabs items={tabItems} size="large" />
    </DashboardLayout>
  );
}
