import { Card, Tooltip, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const { Text } = Typography;

const progressData = [
  { range: "0-20%", count: 320, label: "僵尸学员" },
  { range: "21-40%", count: 180, label: "滞后" },
  { range: "41-60%", count: 450, label: "进行中" },
  { range: "61-80%", count: 680, label: "稳步推进" },
  { range: "81-99%", count: 520, label: "即将完成" },
  { range: "100%", count: 850, label: "已完成" },
];

export function ProgressDistribution() {
  const total = progressData.reduce((sum, item) => sum + item.count, 0);
  const lowProgressCount = progressData[0].count + progressData[1].count;
  const lowProgressPercent = ((lowProgressCount / total) * 100).toFixed(1);

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>学员进度分布</span>
          <Tooltip title="展示学员学习进度的分布情况，识别两极分化">
            <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
          </Tooltip>
        </div>
      }
      size="small"
      style={{ height: 340 }}
    >
      {/* Warning tip at top */}
      <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fff7e6", borderRadius: 4, border: "1px solid #ffd591" }}>
        <Text style={{ fontSize: 12, color: "#d46b08" }}>
          ⚠️ 警告：{lowProgressPercent}% 的学员（{lowProgressCount}人）进度低于40%
        </Text>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={progressData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 10, fill: "#8c8c8c" }}
            axisLine={{ stroke: "#f0f0f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#8c8c8c" }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip
            formatter={(value: number, name: string, props: any) => [
              `${value} 人 (${((value / total) * 100).toFixed(1)}%)`,
              props.payload.label
            ]}
            contentStyle={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 4,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#1677ff" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
