import { useState } from "react";
import { Menu, Input, Typography, Empty } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

interface Chapter {
  id: string;
  title: string;
  duration: number;
  keyPoints: string[];
}

interface Props {
  outline: Chapter[];
  scripts: Record<string, string>;
  onChange: (scripts: Record<string, string>) => void;
}

export function ScriptEditor({ outline, scripts, onChange }: Props) {
  const [activeChapter, setActiveChapter] = useState(outline[0]?.id || "");

  if (outline.length === 0) {
    return <Empty description="请先生成大纲" />;
  }

  const menuItems = outline.map((ch, i) => ({
    key: ch.id,
    label: `第${i + 1}章: ${ch.title}`,
  }));

  const handleScriptChange = (value: string) => {
    onChange({ ...scripts, [activeChapter]: value });
  };

  const currentChapter = outline.find((ch) => ch.id === activeChapter);

  return (
    <div style={{ display: "flex", gap: 16, height: 500 }}>
      <div style={{ width: 220, borderRight: "1px solid #f0f0f0", overflow: "auto" }}>
        <Menu
          mode="inline"
          selectedKeys={[activeChapter]}
          onClick={(e) => setActiveChapter(e.key)}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {currentChapter && (
          <>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 16 }}>{currentChapter.title}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>{currentChapter.duration} 分钟</Text>
            </div>
            {currentChapter.keyPoints?.length > 0 && (
              <div style={{ marginBottom: 12, padding: 8, background: "#f6f8fa", borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>知识要点：</Text>
                {currentChapter.keyPoints.map((kp, i) => (
                  <Text key={i} style={{ display: "block", fontSize: 12 }}>• {kp}</Text>
                ))}
              </div>
            )}
            <TextArea
              value={scripts[activeChapter] || ""}
              onChange={(e) => handleScriptChange(e.target.value)}
              placeholder="在此编辑讲稿内容..."
              style={{ flex: 1, resize: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
