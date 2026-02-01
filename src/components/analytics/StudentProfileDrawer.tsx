import { Drawer, Typography, Tag, Avatar, Divider, Space, Button } from "antd";
import {
  UserOutlined,
  PlusOutlined,
  BellOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

interface StudentProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  studentId: string | null;
}

// Mock data for a student
const studentData = {
  id: "1",
  name: "张伟",
  avatar: "",
  employeeId: "E001",
  department: "华东销售部",
  position: "销售经理",
  status: "in_progress",
  aiGrade: "A",
  overallScore: 82,
  practiceCount: 18,
  lastActive: "2026-01-31",
};

const radarData = [
  { skill: "沟通表达", current: 85, standard: 80 },
  { skill: "产品知识", current: 72, standard: 85 },
  { skill: "需求挖掘", current: 78, standard: 75 },
  { skill: "异议处理", current: 65, standard: 80 },
  { skill: "客户维护", current: 80, standard: 75 },
];

const recommendations = [
  { id: "1", title: "高情商客诉处理", type: "scenario", matchScore: 92, reason: "因你在[异议处理]得分较低，推荐练习此场景" },
  { id: "2", title: "产品知识精讲", type: "knowledge", matchScore: 85, reason: "补强[产品知识]短板" },
  { id: "3", title: "需求挖掘实战", type: "scenario", matchScore: 78, reason: "提升[需求挖掘]技能" },
];

const practiceHistory = [
  { id: "1", date: "2026-01-31 14:30", title: "客户异议处理模拟", score: 85, aiComment: "语速过快，建议放慢节奏", highlights: ["应变能力强"], lowlights: ["未充分倾听"] },
  { id: "2", date: "2026-01-28 10:15", title: "需求评审演练", score: 78, aiComment: "逻辑清晰，但缺少数据支撑", highlights: ["结构化表达"], lowlights: ["论据不足"] },
  { id: "3", date: "2026-01-25 16:00", title: "产品演示模拟", score: 72, aiComment: "产品知识有待加强", highlights: ["态度积极"], lowlights: ["关键功能描述不准确"] },
  { id: "4", date: "2026-01-20 09:30", title: "客户首访模拟", score: 88, aiComment: "优秀的开场和破冰", highlights: ["亲和力强", "提问技巧好"], lowlights: [] },
];

export function StudentProfileDrawer({ open, onClose, studentId }: StudentProfileDrawerProps) {
  if (!studentId) return null;

  return (
    <Drawer
      title={null}
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size={48} icon={<UserOutlined />} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Title level={5} style={{ margin: 0 }}>{studentData.name}</Title>
                <Tag>{studentData.position}</Tag>
                <Tag color="blue">{studentData.department}</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                工号: {studentData.employeeId} | 练习次数: {studentData.practiceCount} | 最近活跃: {studentData.lastActive}
              </Text>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#1677ff" }}>A</div>
              <Text type="secondary" style={{ fontSize: 11 }}>AI评级</Text>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Radar Chart */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>能力雷达图 (成长地图)</Title>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="岗位标准"
                dataKey="standard"
                stroke="#d9d9d9"
                fill="#d9d9d9"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="当前能力"
                dataKey="current"
                stroke="#1677ff"
                fill="#1677ff"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>短板分析：</Text>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Tag color="red">异议处理 (-15分)</Tag>
              <Tag color="orange">产品知识 (-13分)</Tag>
            </div>
          </div>
        </div>

        <Divider />

        {/* AI Summary */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12 }}>AI 综合评价</Title>
          <Paragraph style={{ marginBottom: 12 }}>
            该学员整体表现<Text strong>良好</Text>，在<Text type="success">沟通表达</Text>和<Text type="success">客户维护</Text>方面表现突出。
            但在处理<Text type="danger">客户异议</Text>时容易急躁，且<Text type="warning">产品知识</Text>储备不足，建议针对性强化训练。
          </Paragraph>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color="green">逻辑清晰</Tag>
            <Tag color="green">表达流畅</Tag>
            <Tag color="orange">语速过快</Tag>
            <Tag color="red">耐心不足</Tag>
          </div>
        </div>

        <Divider />

        {/* Recommendations */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>智能推荐课程</Title>
            <Button type="link" size="small">查看更多</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  padding: "12px 16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Text strong>{rec.title}</Text>
                    <Tag color={rec.type === "scenario" ? "blue" : "green"}>
                      {rec.type === "scenario" ? "模拟场景" : "知识点"}
                    </Tag>
                    <Tag color="gold">匹配度 {rec.matchScore}%</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{rec.reason}</Text>
                </div>
                <Button type="primary" size="small" icon={<PlusOutlined />}>指派</Button>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Practice History */}
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>练习历史记录</Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {practiceHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  borderLeft: `3px solid ${item.score >= 80 ? "#52c41a" : item.score >= 60 ? "#1677ff" : "#ff4d4f"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>{item.date}</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: item.score >= 80 ? "#52c41a" : item.score >= 60 ? "#1677ff" : "#ff4d4f" }}>
                      {item.score}分
                    </span>
                    <Button type="link" size="small" icon={<PlayCircleOutlined />}>回放</Button>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>AI点评：{item.aiComment}</Text>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {item.highlights.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 12 }} />
                      {item.highlights.map((h) => (
                        <Tag key={h} color="green" style={{ fontSize: 11 }}>{h}</Tag>
                      ))}
                    </div>
                  )}
                  {item.lowlights.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 12 }} />
                      {item.lowlights.map((l) => (
                        <Tag key={l} color="red" style={{ fontSize: 11 }}>{l}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ 
        position: "sticky", 
        bottom: 0, 
        padding: "16px 24px", 
        borderTop: "1px solid #f0f0f0", 
        background: "#fff",
        display: "flex",
        gap: 12,
        justifyContent: "flex-end"
      }}>
        <Button icon={<BellOutlined />}>催办</Button>
        <Button type="primary" icon={<PlusOutlined />}>指派任务</Button>
      </div>
    </Drawer>
  );
}
