import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Row, Col, Select, Button } from "antd";
import { DownloadOutlined, BellOutlined } from "@ant-design/icons";
import { useState } from "react";

// Import all analytics components
import { KPICards } from "@/components/analytics/KPICards";
import { TrainingFunnel } from "@/components/analytics/TrainingFunnel";
import { ProgressDistribution } from "@/components/analytics/ProgressDistribution";
import { RiskMonitor } from "@/components/analytics/RiskMonitor";
import { StudentListTable } from "@/components/analytics/StudentListTable";
import { StudentProfileDrawer } from "@/components/analytics/StudentProfileDrawer";

export default function TrainingAnalytics() {
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleStudentClick = (studentId: string) => {
    setSelectedStudent(studentId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedStudent(null);
  };

  return (
    <DashboardLayout title="AI培训效果监控看板" description="从全局到个体的多维度培训效能洞察">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select 
            value={selectedOrg} 
            onChange={setSelectedOrg} 
            style={{ width: 160 }}
            options={[
              { label: "全部组织", value: "all" },
              { label: "华东销售部", value: "华东销售部" },
              { label: "华北销售部", value: "华北销售部" },
              { label: "研发一组", value: "研发一组" },
              { label: "研发二组", value: "研发二组" },
              { label: "客服一组", value: "客服一组" },
              { label: "客服三组", value: "客服三组" },
              { label: "市场部", value: "市场部" },
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

      {/* KPI Cards */}
      <div className="mb-6">
        <KPICards />
      </div>

      {/* Main Content - Balanced Layout */}
      <Row gutter={16} className="mb-6">
        {/* Left Column */}
        <Col span={12}>
          <TrainingFunnel />
        </Col>
        {/* Right Column */}
        <Col span={12}>
          <ProgressDistribution />
        </Col>
      </Row>

      {/* Risk Monitor - Full Width */}
      <div className="mb-6">
        <RiskMonitor
          onOrgClick={(orgId) => setSelectedOrg(orgId)}
          onStudentClick={handleStudentClick}
        />
      </div>

      {/* Student List Table - Full Width at Bottom */}
      <StudentListTable
        onViewDetail={handleStudentClick}
        departmentFilter={selectedOrg !== "all" ? selectedOrg : undefined}
      />

      {/* Student Profile Drawer */}
      <StudentProfileDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        studentId={selectedStudent}
      />
    </DashboardLayout>
  );
}
