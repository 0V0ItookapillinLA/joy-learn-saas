import { Card, Row, Col, Tooltip } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface KPIData {
  title: string;
  value: number | string;
  suffix?: string;
  trend: number;
  trendLabel: string;
  sparklineData: { value: number }[];
  tooltip?: string;
}

const kpiData: KPIData[] = [
  {
    title: "项目覆盖率",
    value: 85,
    suffix: "%",
    trend: 5,
    trendLabel: "较上月",
    sparklineData: [
      { value: 70 }, { value: 72 }, { value: 75 }, { value: 78 }, { value: 82 }, { value: 85 }
    ],
    tooltip: "应训人数中实际参与培训的比例",
  },
  {
    title: "考评合格率",
    value: 62,
    suffix: "%",
    trend: -2,
    trendLabel: "较上月",
    sparklineData: [
      { value: 68 }, { value: 65 }, { value: 64 }, { value: 63 }, { value: 62 }, { value: 62 }
    ],
    tooltip: "通过考核评估的人数占总人数比例",
  },
  {
    title: "本周活跃人数",
    value: "1,240",
    trend: 12,
    trendLabel: "较上周",
    sparklineData: [
      { value: 980 }, { value: 1050 }, { value: 1100 }, { value: 1180 }, { value: 1200 }, { value: 1240 }
    ],
    tooltip: "近7日进行过AI陪练的学员数量",
  },
  {
    title: "AI 算力消耗",
    value: "52.3K",
    suffix: " 轮",
    trend: 18,
    trendLabel: "较上月",
    sparklineData: [
      { value: 35 }, { value: 38 }, { value: 42 }, { value: 45 }, { value: 48 }, { value: 52 }
    ],
    tooltip: "AI陪练对话轮次总数",
  },
];

export function KPICards() {
  return (
    <Row gutter={16}>
      {kpiData.map((kpi) => (
        <Col span={6} key={kpi.title}>
          <Card
            size="small"
            styles={{ body: { padding: "16px 20px" } }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                  <span style={{ color: "#8c8c8c", fontSize: 14 }}>{kpi.title}</span>
                  {kpi.tooltip && (
                    <Tooltip title={kpi.tooltip}>
                      <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
                    </Tooltip>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#262626" }}>
                    {kpi.value}
                  </span>
                  {kpi.suffix && (
                    <span style={{ fontSize: 14, color: "#8c8c8c" }}>{kpi.suffix}</span>
                  )}
                </div>
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  <span style={{ color: kpi.trend >= 0 ? "#52c41a" : "#ff4d4f" }}>
                    {kpi.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {" "}{Math.abs(kpi.trend)}%
                  </span>
                  <span style={{ color: "#8c8c8c", marginLeft: 4 }}>{kpi.trendLabel}</span>
                </div>
              </div>
              <div style={{ width: 80, height: 40 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.sparklineData}>
                    <defs>
                      <linearGradient id={`gradient-${kpi.title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1677ff" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#1677ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#1677ff"
                      strokeWidth={2}
                      fill={`url(#gradient-${kpi.title})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
