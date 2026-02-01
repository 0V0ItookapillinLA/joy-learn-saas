import { Drawer, List, Typography, Tag, Avatar, Button, Card, Progress, Timeline } from "antd";
import { UserOutlined, ClockCircleOutlined, RightOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface RiskStudent {
  id: string;
  name: string;
  department: string;
  practiceCount: number;
  latestScore: number;
  daysSinceActive: number;
  riskPoints: string[];
  recentPractices: { date: string; score: number; title: string }[];
}

const riskStudentsDetail: RiskStudent[] = [
  { 
    id: "1", 
    name: "张三", 
    department: "华北销售部",
    practiceCount: 15, 
    latestScore: 45, 
    daysSinceActive: 3,
    riskPoints: ["多次练习未达标", "关键技能点薄弱"],
    recentPractices: [
      { date: "01-28", score: 45, title: "客户异议处理" },
      { date: "01-25", score: 42, title: "需求挖掘" },
      { date: "01-22", score: 48, title: "产品介绍" },
    ]
  },
  { 
    id: "2", 
    name: "李四", 
    department: "研发二组",
    practiceCount: 12, 
    latestScore: 52, 
    daysSinceActive: 5,
    riskPoints: ["进步缓慢", "练习频次低"],
    recentPractices: [
      { date: "01-26", score: 52, title: "技术方案讲解" },
      { date: "01-20", score: 50, title: "需求评审" },
    ]
  },
  { 
    id: "3", 
    name: "王五", 
    department: "客服三组",
    practiceCount: 18, 
    latestScore: 48, 
    daysSinceActive: 2,
    riskPoints: ["情绪控制不佳", "专业知识薄弱"],
    recentPractices: [
      { date: "01-30", score: 48, title: "投诉处理" },
      { date: "01-28", score: 45, title: "退款协商" },
      { date: "01-25", score: 50, title: "咨询解答" },
    ]
  },
  { 
    id: "4", 
    name: "赵六", 
    department: "华东物流部",
    practiceCount: 20, 
    latestScore: 55, 
    daysSinceActive: 7,
    riskPoints: ["长时间未登录", "成绩波动大"],
    recentPractices: [
      { date: "01-24", score: 55, title: "配送异常处理" },
      { date: "01-20", score: 40, title: "客户沟通" },
    ]
  },
];

interface RiskStudentsDrawerProps {
  open: boolean;
  onClose: () => void;
  onStudentClick?: (studentId: string) => void;
}

export function RiskStudentsDrawer({ open, onClose, onStudentClick }: RiskStudentsDrawerProps) {
  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#ff4d4f" }} />
          <span>滞后人员名单</span>
          <Tag color="red">{riskStudentsDetail.length}</Tag>
        </div>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
      zIndex={1000}
    >
      <List
        dataSource={riskStudentsDetail}
        renderItem={(student) => (
          <Card 
            size="small" 
            style={{ marginBottom: 12, cursor: "pointer" }}
            onClick={() => {
              onStudentClick?.(student.id);
              onClose();
            }}
            hoverable
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Avatar size={40} icon={<UserOutlined />} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>{student.name}</Text>
                    <Tag style={{ marginLeft: 8 }}>{student.department}</Tag>
                  </div>
                  <RightOutlined style={{ color: "#bfbfbf" }} />
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>练习次数</Text>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#1677ff" }}>{student.practiceCount}</div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>最新得分</Text>
                    <div style={{ fontSize: 16, fontWeight: 600, color: student.latestScore < 60 ? "#ff4d4f" : "#1677ff" }}>
                      {student.latestScore}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>未活跃天数</Text>
                    <div style={{ fontSize: 16, fontWeight: 600, color: student.daysSinceActive > 5 ? "#ff4d4f" : "#8c8c8c" }}>
                      {student.daysSinceActive}天
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>问题标签：</Text>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {student.riskPoints.map((point, index) => (
                      <Tag key={index} color="orange" style={{ fontSize: 11 }}>{point}</Tag>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "8px 12px", background: "#fafafa", borderRadius: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>近期练习：</Text>
                  <div style={{ display: "flex", gap: 8 }}>
                    {student.recentPractices.slice(0, 3).map((practice, index) => (
                      <Tag key={index} style={{ fontSize: 11 }}>
                        {practice.date} {practice.title} {practice.score}分
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      />
    </Drawer>
  );
}
