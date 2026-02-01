import { Card, Row, Col, List, Typography, Tag, Button, Avatar, Progress, Tooltip } from "antd";
import { RightOutlined, WarningOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface RiskOrg {
  id: string;
  name: string;
  progress: number;
  traineeCount: number;
  trend: "up" | "down" | "stable";
}

interface RiskStudent {
  id: string;
  name: string;
  avatar?: string;
  practiceCount: number;
  latestScore: number;
  department: string;
  daysSinceActive: number;
}

const riskOrgs: RiskOrg[] = [
  { id: "1", name: "华北销售部", progress: 20, traineeCount: 45, trend: "down" },
  { id: "2", name: "研发二组", progress: 25, traineeCount: 32, trend: "stable" },
  { id: "3", name: "客服三组", progress: 30, traineeCount: 28, trend: "up" },
  { id: "4", name: "华东物流部", progress: 32, traineeCount: 56, trend: "down" },
  { id: "5", name: "市场拓展组", progress: 35, traineeCount: 18, trend: "stable" },
];

const riskStudents: RiskStudent[] = [
  { id: "1", name: "张三", practiceCount: 15, latestScore: 45, department: "华北销售部", daysSinceActive: 3 },
  { id: "2", name: "李四", practiceCount: 12, latestScore: 52, department: "研发二组", daysSinceActive: 5 },
  { id: "3", name: "王五", practiceCount: 18, latestScore: 48, department: "客服三组", daysSinceActive: 2 },
  { id: "4", name: "赵六", practiceCount: 20, latestScore: 55, department: "华东物流部", daysSinceActive: 7 },
];

interface RiskMonitorProps {
  onOrgClick?: (orgId: string) => void;
  onStudentClick?: (studentId: string) => void;
}

export function RiskMonitor({ onOrgClick, onStudentClick }: RiskMonitorProps) {
  return (
    <Row gutter={16}>
      <Col span={12}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <WarningOutlined style={{ color: "#faad14" }} />
            <span>需关注的组织</span>
            <Tag color="orange">{riskOrgs.length}</Tag>
          </div>
        }
        size="small"
        extra={<Button type="link" size="small">查看全部</Button>}
      >
        <List
          dataSource={riskOrgs}
          renderItem={(org) => (
            <List.Item
              style={{ padding: "8px 0", cursor: "pointer" }}
              onClick={() => onOrgClick?.(org.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>{org.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{org.traineeCount}人</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Progress
                    percent={org.progress}
                    size="small"
                    strokeColor={org.progress < 30 ? "#ff4d4f" : "#faad14"}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <RightOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
      </Col>

      <Col span={12}>
      {/* 滞后人员名单 */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserOutlined style={{ color: "#ff4d4f" }} />
            <span>滞后人员名单</span>
            <Tooltip title="练习多次但仍不合格的学员">
              <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
            </Tooltip>
          </div>
        }
        size="small"
        extra={<Button type="link" size="small">查看全部</Button>}
      >
        <List
          dataSource={riskStudents}
          renderItem={(student) => (
            <List.Item
              style={{ padding: "8px 0", cursor: "pointer" }}
              onClick={() => onStudentClick?.(student.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <Avatar size={32} icon={<UserOutlined />} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13 }}>{student.name}</Text>
                    <Tag color="red" style={{ fontSize: 11 }}>
                      练{student.practiceCount}次 | {student.latestScore}分
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {student.department}
                    {student.daysSinceActive > 5 && (
                      <span style={{ color: "#ff4d4f", marginLeft: 8 }}>
                        {student.daysSinceActive}天未活跃
                      </span>
                    )}
                  </Text>
                </div>
                <RightOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
              </div>
            </List.Item>
          )}
        />
      </Card>
      </Col>
    </Row>
  );
}
