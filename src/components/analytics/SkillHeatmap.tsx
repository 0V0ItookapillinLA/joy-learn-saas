import { Card, Tooltip, Typography, Tag } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface SkillScore {
  org: string;
  skills: { [key: string]: number };
}

const skillNames = ["沟通表达", "产品知识", "需求挖掘", "异议处理", "客户维护"];

const skillData: SkillScore[] = [
  { org: "华东销售部", skills: { "沟通表达": 85, "产品知识": 72, "需求挖掘": 78, "异议处理": 65, "客户维护": 80 } },
  { org: "华北销售部", skills: { "沟通表达": 68, "产品知识": 45, "需求挖掘": 52, "异议处理": 48, "客户维护": 55 } },
  { org: "研发一组", skills: { "沟通表达": 72, "产品知识": 88, "需求挖掘": 65, "异议处理": 58, "客户维护": 62 } },
  { org: "研发二组", skills: { "沟通表达": 55, "产品知识": 82, "需求挖掘": 48, "异议处理": 42, "客户维护": 45 } },
  { org: "客服一组", skills: { "沟通表达": 82, "产品知识": 68, "需求挖掘": 55, "异议处理": 78, "客户维护": 85 } },
  { org: "客服三组", skills: { "沟通表达": 75, "产品知识": 58, "需求挖掘": 45, "异议处理": 72, "客户维护": 68 } },
];

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#52c41a";
  if (score >= 60) return "#1677ff";
  if (score >= 40) return "#faad14";
  return "#ff4d4f";
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return "#f6ffed";
  if (score >= 60) return "#e6f4ff";
  if (score >= 40) return "#fffbe6";
  return "#fff2f0";
};

interface SkillHeatmapProps {
  onCellClick?: (org: string, skill: string, score: number) => void;
}

export function SkillHeatmap({ onCellClick }: SkillHeatmapProps) {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>能力热力图</span>
          <Tooltip title="直观展示各部门在不同能力维度的短板，点击色块可下钻查看详情">
            <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
          </Tooltip>
        </div>
      }
      size="small"
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #f0f0f0", background: "#fafafa", fontWeight: 500 }}>
                组织
              </th>
              {skillNames.map((skill) => (
                <th
                  key={skill}
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    borderBottom: "1px solid #f0f0f0",
                    background: "#fafafa",
                    fontWeight: 500,
                    minWidth: 80,
                  }}
                >
                  {skill}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skillData.map((row) => (
              <tr key={row.org}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: 500 }}>
                  {row.org}
                </td>
                {skillNames.map((skill) => {
                  const score = row.skills[skill];
                  return (
                    <td
                      key={skill}
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        borderBottom: "1px solid #f0f0f0",
                        cursor: "pointer",
                      }}
                      onClick={() => onCellClick?.(row.org, skill, score)}
                    >
                      <Tooltip title={`${row.org} - ${skill}: ${score}分`}>
                        <div
                          style={{
                            background: getScoreBgColor(score),
                            color: getScoreColor(score),
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          {score}
                        </div>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 2 }} />
          <Text type="secondary" style={{ fontSize: 11 }}>≥80 优秀</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: "#e6f4ff", border: "1px solid #91caff", borderRadius: 2 }} />
          <Text type="secondary" style={{ fontSize: 11 }}>60-79 良好</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 2 }} />
          <Text type="secondary" style={{ fontSize: 11 }}>40-59 待提升</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: "#fff2f0", border: "1px solid #ffa39e", borderRadius: 2 }} />
          <Text type="secondary" style={{ fontSize: 11 }}>&lt;40 警告</Text>
        </div>
      </div>
    </Card>
  );
}
