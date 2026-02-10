import { Typography, Card, Row, Col, Tag } from "antd";
import { TrophyOutlined, RiseOutlined } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const { Text, Title } = Typography;

// Mock data for department comparison
const departmentData = [
  { name: "销售部", completionRate: 85, avgScore: 78, participationRate: 92 },
  { name: "客服部", completionRate: 72, avgScore: 82, participationRate: 88 },
  { name: "市场部", completionRate: 68, avgScore: 75, participationRate: 76 },
  { name: "技术部", completionRate: 55, avgScore: 70, participationRate: 60 },
  { name: "人事部", completionRate: 90, avgScore: 85, participationRate: 95 },
];

const champion = departmentData.reduce((best, d) =>
  d.completionRate > best.completionRate ? d : best
);

export function DepartmentPK() {
  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)",
          border: "1px solid #ffd591",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <TrophyOutlined style={{ fontSize: 48, color: "#faad14" }} />
          <div>
            <Text type="secondary">本月冠军部门</Text>
            <Title level={3} style={{ margin: 0, color: "#d48806" }}>
              {champion.name}
            </Title>
            <div style={{ marginTop: 4 }}>
              <Tag color="gold">完成率 {champion.completionRate}%</Tag>
              <Tag color="blue">平均分 {champion.avgScore}</Tag>
              <Tag color="green">参与率 {champion.participationRate}%</Tag>
            </div>
          </div>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="部门对比">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departmentData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" name="完成率 %" fill="#1677ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgScore" name="平均分" fill="#52c41a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="participationRate" name="参与率 %" fill="#faad14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {departmentData
          .sort((a, b) => b.completionRate - a.completionRate)
          .map((dept, index) => (
            <Col key={dept.name} xs={24} sm={12} md={8}>
              <Card size="small">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Text strong style={{ fontSize: 24, color: index === 0 ? "#faad14" : "#8c8c8c", minWidth: 30 }}>
                    #{index + 1}
                  </Text>
                  <div style={{ flex: 1 }}>
                    <Text strong>{dept.name}</Text>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      <Tag color="blue" style={{ margin: 0 }}>完成 {dept.completionRate}%</Tag>
                      <Tag color="green" style={{ margin: 0 }}>均分 {dept.avgScore}</Tag>
                      <Tag color="orange" style={{ margin: 0 }}>参与 {dept.participationRate}%</Tag>
                    </div>
                  </div>
                  {index === 0 && <TrophyOutlined style={{ color: "#faad14", fontSize: 20 }} />}
                </div>
              </Card>
            </Col>
          ))}
      </Row>
    </div>
  );
}
