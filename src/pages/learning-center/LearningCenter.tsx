import { Tabs } from "antd";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Leaderboard } from "@/components/learning-center/Leaderboard";
import { CheckInCalendar } from "@/components/learning-center/CheckInCalendar";
import { AchievementWall } from "@/components/learning-center/AchievementWall";
import { DepartmentPK } from "@/components/learning-center/DepartmentPK";

const tabItems = [
  { key: "leaderboard", label: "团队排行", children: <Leaderboard /> },
  { key: "checkin", label: "打卡监控", children: <CheckInCalendar /> },
  { key: "achievements", label: "勋章统计", children: <AchievementWall /> },
  { key: "department-pk", label: "部门 PK", children: <DepartmentPK /> },
];

export default function LearningCenter() {
  return (
    <DashboardLayout title="学习中心" description="管理员视角 · 团队学习数据总览与监控">
      <Tabs items={tabItems} size="large" />
    </DashboardLayout>
  );
}
