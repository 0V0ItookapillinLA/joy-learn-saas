import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Row, Col, Select, Button, Breadcrumb, Typography, Segmented } from "antd";
import { DownloadOutlined, BellOutlined, HomeOutlined } from "@ant-design/icons";
import { useState } from "react";

// Import all analytics components
import { KPICards } from "@/components/analytics/KPICards";
import { TrainingFunnel } from "@/components/analytics/TrainingFunnel";
import { ProgressDistribution } from "@/components/analytics/ProgressDistribution";
import { RiskMonitor } from "@/components/analytics/RiskMonitor";
import { OrgComparison } from "@/components/analytics/OrgComparison";
import { SkillHeatmap } from "@/components/analytics/SkillHeatmap";
import { PassRateTrend } from "@/components/analytics/PassRateTrend";
import { StudentListTable } from "@/components/analytics/StudentListTable";
import { StudentProfile } from "@/components/analytics/StudentProfile";

const { Text } = Typography;

type ViewLevel = "global" | "org" | "students" | "profile";

interface BreadcrumbItem {
  title: string;
  level: ViewLevel;
  data?: any;
}

export default function TrainingAnalytics() {
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("global");
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { title: "全局总揽", level: "global" },
  ]);

  const navigateTo = (level: ViewLevel, data?: { orgId?: string; studentId?: string; skill?: string }) => {
    setCurrentLevel(level);
    
    if (level === "global") {
      setBreadcrumbs([{ title: "全局总揽", level: "global" }]);
      setSelectedOrg(null);
      setSelectedStudent(null);
      setSelectedSkill(null);
    } else if (level === "org") {
      setSelectedOrg(data?.orgId || null);
      setBreadcrumbs([
        { title: "全局总揽", level: "global" },
        { title: "组织效能透视", level: "org" },
      ]);
      setSelectedStudent(null);
    } else if (level === "students") {
      setSelectedOrg(data?.orgId || selectedOrg);
      setSelectedSkill(data?.skill || null);
      setBreadcrumbs([
        { title: "全局总揽", level: "global" },
        { title: "组织效能透视", level: "org" },
        { title: "学员列表", level: "students" },
      ]);
      setSelectedStudent(null);
    } else if (level === "profile") {
      setSelectedStudent(data?.studentId || null);
      setBreadcrumbs([
        { title: "全局总揽", level: "global" },
        { title: "组织效能透视", level: "org" },
        { title: "学员列表", level: "students" },
        { title: "学员档案", level: "profile" },
      ]);
    }
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    navigateTo(level);
  };

  const handleOrgClick = (orgId: string) => {
    navigateTo("org", { orgId });
  };

  const handleStudentClick = (studentId: string) => {
    navigateTo("profile", { studentId });
  };

  const handleHeatmapCellClick = (org: string, skill: string, score: number) => {
    setSelectedOrg(org);
    setSelectedSkill(skill);
    navigateTo("students", { orgId: org, skill });
  };

  const handleViewStudentList = () => {
    navigateTo("students");
  };

  const handleBackFromProfile = () => {
    navigateTo("students");
  };

  return (
    <DashboardLayout title="AI培训效果监控看板" description="从全局到个体的多维度培训效能洞察">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={breadcrumbs.map((item, index) => ({
              title: index === breadcrumbs.length - 1 ? (
                <Text strong>{item.title}</Text>
              ) : (
                <a onClick={() => handleBreadcrumbClick(item.level)}>{item.title}</a>
              ),
            }))}
          />
        </div>
        <div className="flex items-center gap-3">
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
          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button icon={<BellOutlined />}>订阅</Button>
        </div>
      </div>

      {/* Level 1: Global Dashboard */}
      {currentLevel === "global" && (
        <>
          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards />
          </div>

          {/* Main Content */}
          <Row gutter={16}>
            {/* Left Column: Funnel + Distribution */}
            <Col span={14}>
              <div className="mb-4">
                <TrainingFunnel />
              </div>
              <ProgressDistribution />
            </Col>

            {/* Right Column: Risk Monitor */}
            <Col span={10}>
              <RiskMonitor
                onOrgClick={handleOrgClick}
                onStudentClick={handleStudentClick}
              />
            </Col>
          </Row>

          {/* Quick Action to Org View */}
          <div className="mt-4 text-center">
            <Button type="link" onClick={() => navigateTo("org")}>
              查看组织效能详情 →
            </Button>
          </div>
        </>
      )}

      {/* Level 2: Organization Drill-down */}
      {currentLevel === "org" && (
        <>
          {/* Org Comparison */}
          <div className="mb-4">
            <OrgComparison onOrgClick={handleOrgClick} />
          </div>

          {/* Skill Heatmap */}
          <div className="mb-4">
            <SkillHeatmap onCellClick={handleHeatmapCellClick} />
          </div>

          {/* Pass Rate Trend */}
          <PassRateTrend />

          {/* Quick Action to Student List */}
          <div className="mt-4 text-center">
            <Button type="link" onClick={handleViewStudentList}>
              查看学员详情列表 →
            </Button>
          </div>
        </>
      )}

      {/* Level 3: Student List */}
      {currentLevel === "students" && (
        <StudentListTable
          onViewDetail={handleStudentClick}
          departmentFilter={selectedOrg || undefined}
          skillFilter={selectedSkill || undefined}
        />
      )}

      {/* Level 4: Student Profile */}
      {currentLevel === "profile" && selectedStudent && (
        <StudentProfile
          studentId={selectedStudent}
          onBack={handleBackFromProfile}
        />
      )}
    </DashboardLayout>
  );
}
