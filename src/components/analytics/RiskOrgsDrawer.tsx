import { Drawer, List, Typography, Tag, Avatar, Progress, Button, Divider, Card } from "antd";
import { UserOutlined, WarningOutlined, RightOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface RiskOrg {
  id: string;
  name: string;
  progress: number;
  traineeCount: number;
  riskPoints: string[];
  suggestion: string;
}

const riskOrgsDetail: RiskOrg[] = [
  { 
    id: "1", 
    name: "华北销售部", 
    progress: 20, 
    traineeCount: 45, 
    riskPoints: ["完成率低于30%", "近7天无新增完课", "3名学员超过14天未活跃"],
    suggestion: "建议组织专项督促会议，明确培训截止时间"
  },
  { 
    id: "2", 
    name: "研发二组", 
    progress: 25, 
    traineeCount: 32,
    riskPoints: ["AI陪练参与率低", "平均练习时长不足"],
    suggestion: "建议调整练习场景难度，增加趣味性"
  },
  { 
    id: "3", 
    name: "客服三组", 
    progress: 30, 
    traineeCount: 28,
    riskPoints: ["考核通过率偏低", "重复练习比例高"],
    suggestion: "建议增加辅导课程，降低考核难度"
  },
  { 
    id: "4", 
    name: "华东物流部", 
    progress: 32, 
    traineeCount: 56,
    riskPoints: ["大批量学员进度停滞", "登录频次下降"],
    suggestion: "建议发送催办通知，了解学员困难"
  },
  { 
    id: "5", 
    name: "市场拓展组", 
    progress: 35, 
    traineeCount: 18,
    riskPoints: ["学习时间集中在非工作时段"],
    suggestion: "建议协调工作安排，保障学习时间"
  },
];

interface RiskOrgsDrawerProps {
  open: boolean;
  onClose: () => void;
  onOrgClick?: (orgId: string) => void;
}

export function RiskOrgsDrawer({ open, onClose, onOrgClick }: RiskOrgsDrawerProps) {
  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WarningOutlined style={{ color: "#faad14" }} />
          <span>需关注的组织</span>
          <Tag color="orange">{riskOrgsDetail.length}</Tag>
        </div>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
      zIndex={1000}
    >
      <List
        dataSource={riskOrgsDetail}
        renderItem={(org) => (
          <Card 
            size="small" 
            style={{ marginBottom: 12, cursor: "pointer" }}
            onClick={() => {
              onOrgClick?.(org.name);
              onClose();
            }}
            hoverable
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <Text strong style={{ fontSize: 15 }}>{org.name}</Text>
                <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>{org.traineeCount}人</Text>
              </div>
              <RightOutlined style={{ color: "#bfbfbf" }} />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>完成进度</Text>
              <Progress 
                percent={org.progress} 
                strokeColor="#1677ff"
                trailColor="#f0f5ff"
                size="small" 
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>风险点：</Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {org.riskPoints.map((point, index) => (
                  <Tag key={index} color="red" style={{ fontSize: 11 }}>{point}</Tag>
                ))}
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "#f0f5ff", borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: "#1677ff" }}>💡 {org.suggestion}</Text>
            </div>
          </Card>
        )}
      />
    </Drawer>
  );
}
