import { useState } from "react";
import { Typography, Tag, Button, Spin, Steps, Timeline, Alert } from "antd";
import {
  ThunderboltOutlined,
  ExperimentOutlined,
  RocketOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";

const { Text, Paragraph, Title } = Typography;

interface RadarItem {
  skill: string;
  current: number;
  standard: number;
}

interface PracticeItem {
  id: string;
  date: string;
  title: string;
  score: number;
  aiComment: string;
  highlights: string[];
  lowlights: string[];
}

interface DiagnosisResult {
  overallAssessment: string;
  gradeReason: string;
  strengthAnalysis: { skill: string; detail: string; evidence: string }[];
  weaknessAnalysis: { skill: string; detail: string; priority: string; improvementPlan: string }[];
  learningPath: { step: number; title: string; type: string; reason: string; estimatedHours: number }[];
  behaviorTags: { tag: string; sentiment: string }[];
  riskLevel: string;
  riskReason: string;
  nextMilestone: string;
}

interface AIDiagnosisSectionProps {
  studentName: string;
  radarData: RadarItem[];
  practiceHistory: PracticeItem[];
  onAssignTask?: (skills: string[]) => void;
}

const priorityColors: Record<string, string> = { high: "red", medium: "orange", low: "blue" };
const typeLabels: Record<string, string> = { knowledge: "知识学习", practice: "实战练习", scenario: "模拟场景" };
const typeColors: Record<string, string> = { knowledge: "green", practice: "blue", scenario: "purple" };
const sentimentColors: Record<string, string> = { positive: "green", negative: "red", neutral: "default" };
const riskColors: Record<string, string> = { low: "#52c41a", medium: "#faad14", high: "#ff4d4f" };
const riskLabels: Record<string, string> = { low: "低风险", medium: "中风险", high: "高风险" };

export function AIDiagnosisSection({ studentName, radarData, practiceHistory, onAssignTask }: AIDiagnosisSectionProps) {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-diagnose-student", {
        body: {
          studentName,
          radarData,
          practiceHistory: practiceHistory.map(p => ({
            title: p.title,
            date: p.date,
            score: p.score,
            aiComment: p.aiComment,
            highlights: p.highlights,
            lowlights: p.lowlights,
          })),
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "诊断失败");
      setDiagnosis(data.diagnosis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "诊断失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (!diagnosis && !loading) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <ExperimentOutlined style={{ fontSize: 48, color: "#1677ff", marginBottom: 16 }} />
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14 }}>基于学员的练习数据，AI将生成个性化能力诊断报告</Text>
        </div>
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
        <Button type="primary" size="large" icon={<ThunderboltOutlined />} onClick={handleDiagnose}>
          一键AI诊断
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">AI正在分析学员数据，生成诊断报告...</Text>
        </div>
      </div>
    );
  }

  if (!diagnosis) return null;

  const weakSkills = diagnosis.weaknessAnalysis.map(w => w.skill);

  return (
    <div>
      {/* Overall + Risk */}
      <div style={{ padding: "16px", background: "#f6ffed", borderRadius: 8, marginBottom: 16, border: "1px solid #b7eb8f" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: 14 }}>📋 总体评价</Text>
            <Paragraph style={{ margin: "8px 0 0", fontSize: 13 }}>{diagnosis.overallAssessment}</Paragraph>
          </div>
          <Tag color={riskColors[diagnosis.riskLevel]} style={{ flexShrink: 0 }}>
            {riskLabels[diagnosis.riskLevel] || diagnosis.riskLevel}
          </Tag>
        </div>
        {diagnosis.riskReason && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            <WarningOutlined style={{ marginRight: 4 }} />{diagnosis.riskReason}
          </Text>
        )}
      </div>

      {/* Behavior Tags */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 13 }}>行为标签</Text>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {diagnosis.behaviorTags.map((bt, i) => (
            <Tag key={i} color={sentimentColors[bt.sentiment]}>{bt.tag}</Tag>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 13 }}>
          <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} />优势能力
        </Text>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {diagnosis.strengthAnalysis.map((s, i) => (
            <div key={i} style={{ padding: "8px 12px", background: "#f6ffed", borderRadius: 6, fontSize: 13 }}>
              <Text strong>{s.skill}</Text>
              <Text style={{ marginLeft: 8 }}>{s.detail}</Text>
              <div><Text type="secondary" style={{ fontSize: 11 }}>依据：{s.evidence}</Text></div>
            </div>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 13 }}>
          <CloseCircleOutlined style={{ color: "#ff4d4f", marginRight: 6 }} />待提升能力
        </Text>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {diagnosis.weaknessAnalysis.map((w, i) => (
            <div key={i} style={{ padding: "8px 12px", background: "#fff2e8", borderRadius: 6, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Text strong>{w.skill}</Text>
                <Tag color={priorityColors[w.priority]} style={{ fontSize: 11 }}>
                  {w.priority === "high" ? "优先" : w.priority === "medium" ? "建议" : "可选"}
                </Tag>
              </div>
              <Text>{w.detail}</Text>
              <div><Text type="secondary" style={{ fontSize: 11 }}>💡 {w.improvementPlan}</Text></div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text strong style={{ fontSize: 13 }}>
            <RocketOutlined style={{ color: "#1677ff", marginRight: 6 }} />推荐学习路径
          </Text>
          {onAssignTask && (
            <Button type="primary" size="small" onClick={() => onAssignTask(weakSkills)}>
              一键指派
            </Button>
          )}
        </div>
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={diagnosis.learningPath.map((lp) => ({
            title: (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{lp.title}</span>
                <Tag color={typeColors[lp.type]}>{typeLabels[lp.type] || lp.type}</Tag>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  <ClockCircleOutlined style={{ marginRight: 2 }} />{lp.estimatedHours}h
                </Text>
              </div>
            ),
            description: <Text type="secondary" style={{ fontSize: 12 }}>{lp.reason}</Text>,
            icon: lp.step === 1 ? <FireOutlined style={{ color: "#ff4d4f" }} /> : undefined,
          }))}
        />
      </div>

      {/* Next Milestone */}
      <div style={{ padding: "12px 16px", background: "#e6f4ff", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <TrophyOutlined style={{ color: "#1677ff", fontSize: 16 }} />
        <div>
          <Text strong style={{ fontSize: 12 }}>下一个里程碑</Text>
          <div><Text style={{ fontSize: 13 }}>{diagnosis.nextMilestone}</Text></div>
        </div>
      </div>

      {/* Re-diagnose */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Button size="small" onClick={handleDiagnose} loading={loading}>
          重新诊断
        </Button>
      </div>
    </div>
  );
}
