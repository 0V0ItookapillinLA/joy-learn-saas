import { Card, Tooltip, Typography, Select } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

const { Text } = Typography;

const trendData = [
  { date: "W1", "华东销售部": 45, "华北销售部": 38, "研发一组": 52, "客服一组": 48 },
  { date: "W2", "华东销售部": 52, "华北销售部": 40, "研发一组": 58, "客服一组": 52 },
  { date: "W3", "华东销售部": 58, "华北销售部": 42, "研发一组": 65, "客服一组": 55 },
  { date: "W4", "华东销售部": 65, "华北销售部": 45, "研发一组": 72, "客服一组": 60 },
  { date: "W5", "华东销售部": 72, "华北销售部": 43, "研发一组": 78, "客服一组": 65 },
  { date: "W6", "华东销售部": 78, "华北销售部": 45, "研发一组": 82, "客服一组": 68 },
];

const orgColors: { [key: string]: string } = {
  "华东销售部": "#1677ff",
  "华北销售部": "#ff4d4f",
  "研发一组": "#52c41a",
  "客服一组": "#722ed1",
};

const allOrgs = Object.keys(orgColors);

export function PassRateTrend() {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(allOrgs);

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>考评合格率趋势</span>
          <Tooltip title="监控培训效果是否随时间提升，或出现遗忘曲线导致的下滑">
            <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
          </Tooltip>
        </div>
      }
      size="small"
      extra={
        <Select
          mode="multiple"
          value={selectedOrgs}
          onChange={setSelectedOrgs}
          options={allOrgs.map((org) => ({ label: org, value: org }))}
          style={{ minWidth: 200 }}
          placeholder="选择组织"
          maxTagCount={2}
        />
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#8c8c8c" }}
            axisLine={{ stroke: "#f0f0f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8c8c8c" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <RechartsTooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
            contentStyle={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
          {selectedOrgs.map((org) => (
            <Line
              key={org}
              type="monotone"
              dataKey={org}
              stroke={orgColors[org]}
              strokeWidth={2}
              dot={{ fill: orgColors[org], strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 12, padding: "12px 16px", background: "#fff1f0", borderRadius: 6, border: "1px solid #ffa39e" }}>
        <Text style={{ fontSize: 12, color: "#cf1322" }}>
          ⚠️ 关注：华北销售部合格率增长停滞（6周仅提升7%），建议检查课程匹配度或学员积极性
        </Text>
      </div>
    </Card>
  );
}
