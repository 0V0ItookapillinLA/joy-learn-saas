import { Drawer, Typography, Tag, Avatar, Divider, Button } from "antd";
import {
  UserOutlined,
  PlusOutlined,
  BellOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  UpOutlined,
  MessageOutlined,
  BulbOutlined,
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
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

interface StudentProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  studentId: string | null;
}

interface DialogMessage {
  role: "ai" | "trainee";
  content: string;
  timestamp: string;
}

interface PracticeDetail {
  id: string;
  date: string;
  title: string;
  score: number;
  aiComment: string;
  highlights: string[];
  lowlights: string[];
  duration: string;
  suggestions: string[];
  dialogHistory: DialogMessage[];
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

const practiceHistory: PracticeDetail[] = [
  { 
    id: "1", 
    date: "2026-01-31 14:30", 
    title: "客户异议处理模拟", 
    score: 85, 
    aiComment: "语速过快，建议放慢节奏",
    highlights: ["应变能力强", "情绪稳定"], 
    lowlights: ["未充分倾听", "打断客户"],
    duration: "8分32秒",
    suggestions: [
      "在客户表达不满时，先让对方说完再回应",
      "适当使用「我理解您的感受」等共情语句",
      "语速建议控制在每分钟120-150字"
    ],
    dialogHistory: [
      { role: "ai", content: "您好，我是王先生，上次买的产品有质量问题，我要退货！", timestamp: "00:05" },
      { role: "trainee", content: "王先生您好，非常抱歉给您带来不便，请问具体是什么问题呢？", timestamp: "00:12" },
      { role: "ai", content: "产品用了两天就坏了，这质量也太差了吧！", timestamp: "00:20" },
      { role: "trainee", content: "我理解您的心情，这确实让人很困扰。我先帮您登记一下，尽快给您处理退换货。", timestamp: "00:28" },
      { role: "ai", content: "行，那你们要怎么处理？", timestamp: "00:35" },
      { role: "trainee", content: "我们可以为您安排上门取件，3个工作日内完成退款，您看可以吗？", timestamp: "00:42" },
    ]
  },
  { 
    id: "2", 
    date: "2026-01-28 10:15", 
    title: "需求评审演练", 
    score: 78, 
    aiComment: "逻辑清晰，但缺少数据支撑",
    highlights: ["结构化表达", "条理清晰"], 
    lowlights: ["论据不足", "数据引用少"],
    duration: "12分15秒",
    suggestions: [
      "准备充分的市场数据和案例支撑观点",
      "使用具体数字来增强说服力",
      "可以引用行业报告或竞品分析"
    ],
    dialogHistory: [
      { role: "ai", content: "请介绍一下这个功能的需求背景和预期收益。", timestamp: "00:10" },
      { role: "trainee", content: "这个功能是为了解决用户反馈的痛点问题，预计能提升用户体验。", timestamp: "00:25" },
      { role: "ai", content: "能具体说说有多少用户反馈这个问题吗？", timestamp: "00:35" },
      { role: "trainee", content: "大概...有一些用户反馈过，我需要回去核实具体数据。", timestamp: "00:45" },
    ]
  },
  { 
    id: "3", 
    date: "2026-01-25 16:00", 
    title: "产品演示模拟", 
    score: 72, 
    aiComment: "产品知识有待加强",
    highlights: ["态度积极", "热情友好"], 
    lowlights: ["关键功能描述不准确", "技术细节模糊"],
    duration: "15分08秒",
    suggestions: [
      "系统学习产品技术文档和FAQ",
      "熟记产品核心功能和技术参数",
      "提前准备常见问题的标准答复"
    ],
    dialogHistory: [
      { role: "ai", content: "这个产品的最大并发处理能力是多少？", timestamp: "02:30" },
      { role: "trainee", content: "嗯，我们的产品性能很好，可以处理很多请求。", timestamp: "02:40" },
      { role: "ai", content: "具体是多少呢？比如每秒多少请求？", timestamp: "02:50" },
      { role: "trainee", content: "这个...我需要和技术同事确认一下具体数值。", timestamp: "03:00" },
    ]
  },
  { 
    id: "4", 
    date: "2026-01-20 09:30", 
    title: "客户首访模拟", 
    score: 88, 
    aiComment: "优秀的开场和破冰",
    highlights: ["亲和力强", "提问技巧好", "建立信任感快"], 
    lowlights: [],
    duration: "10分45秒",
    suggestions: [
      "可以在介绍环节加入更多个性化内容",
      "注意观察客户的非语言信号"
    ],
    dialogHistory: [
      { role: "ai", content: "请进，你们公司的人来了。", timestamp: "00:05" },
      { role: "trainee", content: "李总您好！感谢您百忙之中抽出时间。我注意到咱们公司最近刚拿下了一个大项目，恭喜恭喜！", timestamp: "00:15" },
      { role: "ai", content: "哈哈，你消息挺灵通的嘛，谢谢。坐吧，喝点什么？", timestamp: "00:25" },
      { role: "trainee", content: "谢谢李总，白水就好。对了，我知道您时间宝贵，今天主要想了解一下贵公司在XX方面的需求...", timestamp: "00:35" },
    ]
  },
];

function PracticeHistorySection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>练习历史记录</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {practiceHistory.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#fafafa",
              borderRadius: 8,
              borderLeft: `3px solid ${item.score >= 80 ? "#52c41a" : item.score >= 60 ? "#1677ff" : "#ff4d4f"}`,
              overflow: "hidden",
            }}
          >
            {/* Header Row */}
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>{item.date}</Text>
                  <Tag style={{ marginLeft: 8 }}>{item.duration}</Tag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: item.score >= 80 ? "#52c41a" : item.score >= 60 ? "#1677ff" : "#ff4d4f" }}>
                    {item.score}分
                  </span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={expandedId === item.id ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => toggleExpand(item.id)}
                  >
                    {expandedId === item.id ? "收起" : "查看详情"}
                  </Button>
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

            {/* Expanded Detail */}
            {expandedId === item.id && (
              <div style={{ borderTop: "1px solid #e8e8e8", padding: "16px", background: "#fff" }}>
                {/* Suggestions */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <BulbOutlined style={{ color: "#faad14" }} />
                    <Text strong style={{ fontSize: 13 }}>改进建议</Text>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {item.suggestions.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 12 }}>{s}</Text>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dialog History */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MessageOutlined style={{ color: "#1677ff" }} />
                    <Text strong style={{ fontSize: 13 }}>对话记录</Text>
                  </div>
                  <div style={{ 
                    border: "1px solid #f0f0f0", 
                    borderRadius: 4,
                    overflow: "hidden"
                  }}>
                    {item.dialogHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          borderBottom: idx < item.dialogHistory.length - 1 ? "1px solid #f0f0f0" : "none",
                        }}
                      >
                        {/* Role Label */}
                        <div
                          style={{
                            width: 80,
                            flexShrink: 0,
                            padding: "12px 16px",
                            background: "#fafafa",
                            borderRight: "1px solid #f0f0f0",
                            display: "flex",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              fontSize: 13,
                              color: msg.role === "trainee" ? "#fa8c16" : "#8c8c8c",
                            }}
                          >
                            {msg.role === "trainee" ? "我" : "AI 陪练"}
                          </Text>
                        </div>
                        {/* Content */}
                        <div
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            background: "#fff",
                          }}
                        >
                          <Text style={{ fontSize: 13, lineHeight: 1.6, color: "#262626" }}>
                            {msg.content}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <PracticeHistorySection />
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
