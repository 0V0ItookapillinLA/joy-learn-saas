import { Card, Typography, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface FunnelStage {
  name: string;
  value: number;
  color: string;
  description: string;
}

const funnelData: FunnelStage[] = [
  { name: "应训人数", value: 5000, color: "#1677ff", description: "需要完成培训的总人数" },
  { name: "已激活", value: 4250, color: "#36cfc9", description: "已开始学习的人数" },
  { name: "练习中", value: 3200, color: "#52c41a", description: "正在进行AI陪练的人数" },
  { name: "已完课", value: 2400, color: "#faad14", description: "完成所有课程内容的人数" },
  { name: "已认证", value: 2000, color: "#722ed1", description: "通过最终考核认证的人数" },
];

export function TrainingFunnel() {
  const maxValue = funnelData[0].value;

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>训练转化漏斗</span>
          <Tooltip title="展示从应训到认证的完整转化路径，识别流程堵点">
            <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
          </Tooltip>
        </div>
      }
      size="small"
    >
      <div style={{ padding: "16px 0" }}>
        {funnelData.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100;
          const dropRate = index > 0
            ? ((funnelData[index - 1].value - stage.value) / funnelData[index - 1].value * 100).toFixed(1)
            : null;

          return (
            <div key={stage.name} style={{ marginBottom: index < funnelData.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Tooltip title={stage.description}>
                  <Text style={{ fontSize: 13 }}>{stage.name}</Text>
                </Tooltip>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Text strong style={{ fontSize: 13 }}>{stage.value.toLocaleString()}</Text>
                  {dropRate && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      流失 {dropRate}%
                    </Text>
                  )}
                </div>
              </div>
              <div
                style={{
                  height: 24,
                  background: "#f5f5f5",
                  borderRadius: 4,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${widthPercent}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}dd 100%)`,
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>
                    {((stage.value / maxValue) * 100).toFixed(0)}%
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 洞察：从"练习中"到"已完课"流失率较高(25%)，建议关注学员练习质量和课程难度匹配
        </Text>
      </div>
    </Card>
  );
}
