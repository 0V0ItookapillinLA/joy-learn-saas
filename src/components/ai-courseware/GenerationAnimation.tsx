import { Typography, Avatar, Button, Progress } from "antd";
import { UserOutlined, BookOutlined, FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface GeneratedCharacter {
  name: string;
  role: "教师" | "助教" | "学生";
  description: string;
  color: string;
}

interface Props {
  step: number;
  characters: GeneratedCharacter[];
  onContinue: () => void;
}

const steps = [
  { title: "生成课堂角色", subtitle: "正在根据课程内容生成角色...", icon: <UserOutlined /> },
  { title: "生成课程大纲", subtitle: "正在构建学习路径...", icon: <BookOutlined /> },
  { title: "生成页面内容", subtitle: "正在创建幻灯片、测验和互动内容...", icon: <FileTextOutlined /> },
  { title: "生成教学动作", subtitle: "正在编排讲解、聚焦和互动流程...", icon: <PlayCircleOutlined /> },
];

const roleColors: Record<string, string> = {
  "教师": "#1677ff",
  "助教": "#52c41a",
  "学生": "#faad14",
};

const roleBorderColors: Record<string, string> = {
  "教师": "#91caff",
  "助教": "#b7eb8f",
  "学生": "#ffe58f",
};

export function GenerationAnimation({ step, characters, onContinue }: Props) {
  const currentStep = steps[step] || steps[0];
  const showCharacters = step === 0 && characters.length > 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      padding: "40px 20px",
    }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 32 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= step ? "#1677ff" : "#e8e8e8",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Animation card */}
      <div style={{
        width: "100%",
        maxWidth: 700,
        background: "#fff",
        borderRadius: 16,
        padding: "48px 40px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}>
        {showCharacters ? (
          <>
            <Title level={3} style={{ marginBottom: 8 }}>✨ 你的课堂角色</Title>
            <div style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 32,
              marginBottom: 32,
              flexWrap: "wrap",
            }}>
              {characters.map((char, i) => (
                <div
                  key={i}
                  style={{
                    width: 160,
                    padding: "20px 16px",
                    borderRadius: 12,
                    border: `2px solid ${roleBorderColors[char.role] || "#e8e8e8"}`,
                    background: "#fff",
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    size={56}
                    icon={<UserOutlined />}
                    style={{ background: char.color, marginBottom: 12 }}
                  />
                  <div style={{ fontWeight: 600, color: roleColors[char.role], marginBottom: 4, fontSize: 14 }}>
                    {char.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 10,
                    display: "inline-block",
                    background: `${char.color}15`,
                    color: char.color,
                    marginBottom: 8,
                  }}>
                    {char.role}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", lineHeight: 1.5 }}>
                    {char.description}
                  </Text>
                </div>
              ))}
            </div>
            <Button type="primary" size="large" onClick={onContinue} style={{ minWidth: 120 }}>
              继续
            </Button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 36,
                color: "#fff",
              }}>
                {currentStep.icon}
              </div>
            </div>
            <Title level={3} style={{ marginBottom: 8 }}>{currentStep.title}</Title>
            <Text type="secondary" style={{ fontSize: 15 }}>{currentStep.subtitle}</Text>
            <div style={{ marginTop: 32 }}>
              <Progress percent={30 + step * 20} showInfo={false} strokeColor="#667eea" />
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>✨</span>
        <Text type="secondary">AI 智能体工作中...</Text>
      </div>
    </div>
  );
}
