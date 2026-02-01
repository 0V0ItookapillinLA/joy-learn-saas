import { Card, Tooltip, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const { Text } = Typography;

interface OrgData {
  name: string;
  completionRate: number;
  submissionRate: number;
  traineeCount: number;
}

const orgData: OrgData[] = [
  { name: "华东销售部", completionRate: 78, submissionRate: 92, traineeCount: 68 },
  { name: "华北销售部", completionRate: 45, submissionRate: 38, traineeCount: 45 },
  { name: "研发一组", completionRate: 82, submissionRate: 75, traineeCount: 28 },
  { name: "研发二组", completionRate: 35, submissionRate: 85, traineeCount: 32 },
  { name: "客服一组", completionRate: 68, submissionRate: 72, traineeCount: 42 },
  { name: "客服三组", completionRate: 55, submissionRate: 48, traineeCount: 28 },
  { name: "市场部", completionRate: 72, submissionRate: 68, traineeCount: 35 },
];

interface OrgComparisonProps {
  onOrgClick?: (orgName: string) => void;
}

export function OrgComparison({ onOrgClick }: OrgComparisonProps) {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>组织效能对比</span>
          <Tooltip title="柱状图表示完成率（结果），折线图表示提交率（态度）">
            <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
          </Tooltip>
        </div>
      }
      size="small"
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={orgData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#8c8c8c" }}
            axisLine={{ stroke: "#f0f0f0" }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8c8c8c" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <RechartsTooltip
            formatter={(value: number, name: string) => [
              `${value}%`,
              name === "completionRate" ? "完成率" : "提交率"
            ]}
            contentStyle={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Legend
            formatter={(value) => value === "completionRate" ? "模块完成率" : "练习提交率"}
          />
          <Bar
            dataKey="completionRate"
            fill="#1677ff"
            radius={[4, 4, 0, 0]}
            name="completionRate"
          />
          <Line
            type="monotone"
            dataKey="submissionRate"
            stroke="#52c41a"
            strokeWidth={2}
            dot={{ fill: "#52c41a", strokeWidth: 2 }}
            name="submissionRate"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 12, padding: "12px 16px", background: "#f6ffed", borderRadius: 6, border: "1px solid #b7eb8f" }}>
        <Text style={{ fontSize: 12, color: "#389e0d" }}>
          💡 洞察：研发二组"态度好但结果差"（提交率85%但完成率仅35%），可能需要降低课程难度或提供更多辅导
        </Text>
      </div>
    </Card>
  );
}
