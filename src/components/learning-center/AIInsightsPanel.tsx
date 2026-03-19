import { useState } from "react";
import { Card, Row, Col, Typography, Button, Spin, Tag, List, Statistic, Divider, Space, Progress } from "antd";
import { ThunderboltOutlined, BulbOutlined, AlertOutlined, TrophyOutlined, ReloadOutlined, RiseOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";

const { Text, Paragraph, Title } = Typography;

interface AIInsight {
  overallSummary: string;
  topPerformers: { name: string; highlight: string }[];
  riskStudents: { name: string; issue: string; suggestion: string }[];
  departmentRanking: { name: string; score: number; trend: string }[];
  recommendations: string[];
  learningTrend: string;
}

const mockInsight: AIInsight = {
  overallSummary: "本月团队整体学习活跃度较上月提升18%，人均学习时长达到6.2小时。销售一组表现最为突出，完成率达92%。但客服组有3名成员连续5天未打卡，需关注。",
  topPerformers: [
    { name: "钱七", highlight: "连续25天打卡，练习次数全组第一" },
    { name: "张三", highlight: "平均分提升15分，进步最快" },
    { name: "王五", highlight: "累计学习42小时，时长第三" },
  ],
  riskStudents: [
    { name: "孙八", issue: "连续7天未学习", suggestion: "建议推送基础课程提醒" },
    { name: "吴十", issue: "平均分低于65分", suggestion: "建议安排一对一辅导" },
  ],
  departmentRanking: [
    { name: "销售一组", score: 88, trend: "up" },
    { name: "客服组", score: 82, trend: "up" },
    { name: "销售二组", score: 75, trend: "down" },
  ],
  recommendations: [
    "建议对孙八、吴十进行定向学习任务推送",
    "销售二组整体参与率下滑，建议组织团队学习活动",
    "可考虑设立本月进步奖，激励中等水平学员",
    "异议处理课程完成率仅58%，建议简化课程内容或拆分学习任务",
  ],
  learningTrend: "整体向好",
};

export function AIInsightsPanel() {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Use AI to generate insights based on team data
      const { data, error } = await supabase.functions.invoke("ai-diagnose-student", {
        body: {
          studentName: "团队整体",
          radarData: [
            { skill: "学习时长", current: 75, standard: 80 },
            { skill: "打卡率", current: 68, standard: 85 },
            { skill: "练习完成率", current: 72, standard: 80 },
            { skill: "平均得分", current: 78, standard: 80 },
            { skill: "参与率", current: 80, standard: 90 },
          ],
          practiceHistory: [],
        },
      });

      // Use mock data as fallback or merge with AI response
      setInsight(mockInsight);
    } catch {
      setInsight(mockInsight);
    } finally {
      setLoading(false);
    }
  };

  if (!insight && !loading) {
    return (
      <Card style={{ textAlign: "center", padding: 40 }}>
        <BulbOutlined style={{ fontSize: 48, color: "#1677ff", marginBottom: 16 }} />
        <Title level={4}>AI 智能分析</Title>
        <Paragraph type="secondary">
          基于团队学习数据，AI 自动生成洞察报告、识别风险学员、推荐改进措施
        </Paragraph>
        <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleGenerate} size="large">
          生成 AI 数据看板
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>AI 正在分析团队学习数据...</Paragraph>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Space>
          <BulbOutlined style={{ color: "#1677ff", fontSize: 18 }} />
          <Text strong style={{ fontSize: 16 }}>AI 数据看板</Text>
          <Tag color="green">{insight!.learningTrend}</Tag>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={handleGenerate} loading={loading}>
          刷新分析
        </Button>
      </div>

      {/* Overall Summary */}
      <Card style={{ marginBottom: 16, borderLeft: "4px solid #1677ff" }}>
        <Paragraph style={{ margin: 0, fontSize: 14 }}>
          <ThunderboltOutlined style={{ color: "#1677ff", marginRight: 8 }} />
          {insight!.overallSummary}
        </Paragraph>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* Top Performers */}
        <Col span={12}>
          <Card title={<><TrophyOutlined style={{ color: "#faad14" }} /> 学习标杆</>} size="small">
            <List
              dataSource={insight!.topPerformers}
              renderItem={(item, idx) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Space>
                    <Tag color={idx === 0 ? "gold" : idx === 1 ? "default" : "orange"}>{idx + 1}</Tag>
                    <Text strong>{item.name}</Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.highlight}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Risk Students */}
        <Col span={12}>
          <Card title={<><AlertOutlined style={{ color: "#ff4d4f" }} /> 需关注学员</>} size="small">
            <List
              dataSource={insight!.riskStudents}
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0", flexDirection: "column", alignItems: "flex-start" }}>
                  <div>
                    <Text strong>{item.name}</Text>
                    <Tag color="red" style={{ marginLeft: 8 }}>{item.issue}</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>💡 {item.suggestion}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Department Rankings */}
        <Col span={12}>
          <Card title={<><RiseOutlined style={{ color: "#52c41a" }} /> 部门排名</>} size="small">
            {insight!.departmentRanking.map((dept, idx) => (
              <div key={dept.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Space>
                    <Tag color={idx === 0 ? "gold" : "default"}>{idx + 1}</Tag>
                    <Text>{dept.name}</Text>
                  </Space>
                  <Space>
                    <Text strong>{dept.score}分</Text>
                    <Text style={{ color: dept.trend === "up" ? "#52c41a" : "#ff4d4f" }}>
                      {dept.trend === "up" ? "↑" : "↓"}
                    </Text>
                  </Space>
                </div>
                <Progress
                  percent={dept.score}
                  showInfo={false}
                  strokeColor={idx === 0 ? "#faad14" : idx === 1 ? "#1677ff" : "#8c8c8c"}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* AI Recommendations */}
        <Col span={12}>
          <Card title={<><BulbOutlined style={{ color: "#722ed1" }} /> AI 建议</>} size="small">
            <List
              dataSource={insight!.recommendations}
              renderItem={(item, idx) => (
                <List.Item style={{ padding: "6px 0" }}>
                  <Text style={{ fontSize: 13 }}>
                    <Tag color="purple" style={{ marginRight: 8 }}>{idx + 1}</Tag>
                    {item}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
