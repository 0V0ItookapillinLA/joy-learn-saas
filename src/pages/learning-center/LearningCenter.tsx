import { Tabs, Drawer, Button } from "antd";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckInCalendar } from "@/components/learning-center/CheckInCalendar";
import { AchievementWall } from "@/components/learning-center/AchievementWall";
import { Row, Col, Select, Card, Typography } from "antd";
import { DownloadOutlined, BellOutlined, CalendarOutlined, TrophyOutlined } from "@ant-design/icons";
import { useState } from "react";

import { KPICards } from "@/components/analytics/KPICards";
import { TrainingFunnel } from "@/components/analytics/TrainingFunnel";
import { ProgressDistribution } from "@/components/analytics/ProgressDistribution";
import { RiskMonitor } from "@/components/analytics/RiskMonitor";
import { StudentListTable } from "@/components/analytics/StudentListTable";
import { StudentProfileDrawer } from "@/components/analytics/StudentProfileDrawer";
import { RiskOrgsDrawer } from "@/components/analytics/RiskOrgsDrawer";
import { RiskStudentsDrawer } from "@/components/analytics/RiskStudentsDrawer";

const { Text } = Typography;

function AnalyticsTab() {
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [orgsDrawerOpen, setOrgsDrawerOpen] = useState(false);
  const [studentsDrawerOpen, setStudentsDrawerOpen] = useState(false);
  const [checkInDrawerOpen, setCheckInDrawerOpen] = useState(false);
  const [achievementDrawerOpen, setAchievementDrawerOpen] = useState(false);

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

      {/* Check-in and Achievement summary cards */}
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card
            title={<><CalendarOutlined style={{ marginRight: 8 }} />打卡监控</>}
            extra={<Button type="link" onClick={() => setCheckInDrawerOpen(true)}>查看全部</Button>}
            size="small"
          >
            <Row gutter={16}>
              <Col span={8}><div style={{ textAlign: "center" }}><Text type="secondary">人均本月打卡</Text><div style={{ fontSize: 24, fontWeight: 700 }}>18 天</div></div></Col>
              <Col span={8}><div style={{ textAlign: "center" }}><Text type="secondary">人均连续打卡</Text><div style={{ fontSize: 24, fontWeight: 700 }}>8 天</div></div></Col>
              <Col span={8}><div style={{ textAlign: "center" }}><Text type="secondary">近3天活跃</Text><div style={{ fontSize: 24, fontWeight: 700 }}>5/8</div></div></Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<><TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} />勋章统计</>}
            extra={<Button type="link" onClick={() => setAchievementDrawerOpen(true)}>查看全部</Button>}
            size="small"
          >
            <Row gutter={16}>
              <Col span={8}><div style={{ textAlign: "center" }}><Text type="secondary">团队总勋章</Text><div style={{ fontSize: 24, fontWeight: 700 }}>22</div></div></Col>
              <Col span={8}><div style={{ textAlign: "center" }}><Text type="secondary">人均勋章</Text><div style={{ fontSize: 24, fontWeight: 700 }}>2.8</div></div></Col>
              <Col span={8}><div style={{ textAlign: "center" }}><Text type="secondary">完成率</Text><div style={{ fontSize: 24, fontWeight: 700 }}>35%</div></div></Col>
            </Row>
          </Card>
        </Col>
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

      {/* Check-in full drawer */}
      <Drawer title="打卡监控详情" placement="right" width="50vw" open={checkInDrawerOpen} onClose={() => setCheckInDrawerOpen(false)} zIndex={1001}>
        <CheckInCalendar />
      </Drawer>

      {/* Achievement full drawer */}
      <Drawer title="勋章统计详情" placement="right" width="50vw" open={achievementDrawerOpen} onClose={() => setAchievementDrawerOpen(false)} zIndex={1001}>
        <AchievementWall />
      </Drawer>
    </div>
  );
}

const tabItems = [
  { key: "analytics", label: "📊 数据看板", children: <AnalyticsTab /> },
];

export default function LearningCenter() {
  return (
    <DashboardLayout title="学习中心" description="团队学习数据总览 · 打卡监控 · 勋章统计 · 风险预警">
      <Tabs items={tabItems} size="large" />
    </DashboardLayout>
  );
}
