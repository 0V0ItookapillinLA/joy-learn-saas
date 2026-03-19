import { Tabs } from "antd";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Leaderboard } from "@/components/learning-center/Leaderboard";
import { CheckInCalendar } from "@/components/learning-center/CheckInCalendar";
import { AchievementWall } from "@/components/learning-center/AchievementWall";
import { DepartmentPK } from "@/components/learning-center/DepartmentPK";
import { AIInsightsPanel } from "@/components/learning-center/AIInsightsPanel";
import { Row, Col, Select, Button } from "antd";
import { DownloadOutlined, BellOutlined } from "@ant-design/icons";
import { useState } from "react";

// Import analytics components
import { KPICards } from "@/components/analytics/KPICards";
import { TrainingFunnel } from "@/components/analytics/TrainingFunnel";
import { ProgressDistribution } from "@/components/analytics/ProgressDistribution";
import { RiskMonitor } from "@/components/analytics/RiskMonitor";
import { StudentListTable } from "@/components/analytics/StudentListTable";
import { StudentProfileDrawer } from "@/components/analytics/StudentProfileDrawer";
import { RiskOrgsDrawer } from "@/components/analytics/RiskOrgsDrawer";
import { RiskStudentsDrawer } from "@/components/analytics/RiskStudentsDrawer";

function AnalyticsTab() {
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [orgsDrawerOpen, setOrgsDrawerOpen] = useState(false);
  const [studentsDrawerOpen, setStudentsDrawerOpen] = useState(false);

  const handleStudentClick = (studentId: string) => {
    setSelectedStudent(studentId);
    setProfileDrawerOpen(true);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={selectedOrg} onChange={setSelectedOrg} style={{ width: 160 }}
            options={[
              { label: "全部组织", value: "all" },
              { label: "华东销售部", value: "华东销售部" },
              { label: "华北销售部", value: "华北销售部" },
              { label: "研发一组", value: "研发一组" },
              { label: "客服一组", value: "客服一组" },
            ]}
          />
          <Select defaultValue="all" style={{ width: 140 }}>
            <Select.Option value="all">全部项目</Select.Option>
            <Select.Option value="sales">销售培训</Select.Option>
            <Select.Option value="service">客服培训</Select.Option>
          </Select>
          <Select defaultValue="30" style={{ width: 140 }}>
            <Select.Option value="7">最近7天</Select.Option>
            <Select.Option value="30">最近30天</Select.Option>
            <Select.Option value="90">最近90天</Select.Option>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button icon={<BellOutlined />}>订阅</Button>
        </div>
      </div>

      <div className="mb-6"><KPICards /></div>
      <Row gutter={16} className="mb-6">
        <Col span={12}><TrainingFunnel /></Col>
        <Col span={12}><ProgressDistribution /></Col>
      </Row>
      <div className="mb-6">
        <RiskMonitor
          onOrgClick={(orgId) => setSelectedOrg(orgId)}
          onStudentClick={handleStudentClick}
          onViewAllOrgs={() => setOrgsDrawerOpen(true)}
          onViewAllStudents={() => setStudentsDrawerOpen(true)}
        />
      </div>
      <StudentListTable onViewDetail={handleStudentClick} departmentFilter={selectedOrg !== "all" ? selectedOrg : undefined} />

      <StudentProfileDrawer open={profileDrawerOpen} onClose={() => { setProfileDrawerOpen(false); setSelectedStudent(null); }} studentId={selectedStudent} />
      <RiskOrgsDrawer open={orgsDrawerOpen} onClose={() => setOrgsDrawerOpen(false)} onOrgClick={(orgId) => setSelectedOrg(orgId)} />
      <RiskStudentsDrawer open={studentsDrawerOpen} onClose={() => setStudentsDrawerOpen(false)} onStudentClick={handleStudentClick} />
    </div>
  );
}

const tabItems = [
  { key: "analytics", label: "📊 数据看板", children: <AnalyticsTab /> },
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
