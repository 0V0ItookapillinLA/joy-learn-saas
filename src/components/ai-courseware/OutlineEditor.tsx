import { Input, List, InputNumber, Button, Space, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Chapter {
  id: string;
  title: string;
  duration: number;
  keyPoints: string[];
}

interface Props {
  outline: Chapter[];
  onChange: (outline: Chapter[]) => void;
}

export function OutlineEditor({ outline, onChange }: Props) {
  const updateChapter = (index: number, updates: Partial<Chapter>) => {
    const next = [...outline];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeChapter = (index: number) => {
    onChange(outline.filter((_, i) => i !== index));
  };

  const addChapter = () => {
    onChange([
      ...outline,
      {
        id: `ch_${Date.now()}`,
        title: `第${outline.length + 1}章`,
        duration: 10,
        keyPoints: [],
      },
    ]);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Text strong>课件大纲（{outline.length} 章）</Text>
        <Button icon={<PlusOutlined />} size="small" onClick={addChapter}>
          添加章节
        </Button>
      </div>

      <List
        dataSource={outline}
        renderItem={(chapter: Chapter, index: number) => (
          <List.Item
            style={{ display: "block", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text type="secondary" style={{ minWidth: 40 }}>
                  第{index + 1}章
                </Text>
                <Input
                  value={chapter.title}
                  onChange={(e) => updateChapter(index, { title: e.target.value })}
                  placeholder="章节标题"
                  style={{ flex: 1 }}
                />
                <InputNumber
                  value={chapter.duration}
                  onChange={(v) => updateChapter(index, { duration: v || 10 })}
                  min={1}
                  max={120}
                  addonAfter="分钟"
                  style={{ width: 140 }}
                />
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeChapter(index)}
                />
              </div>
              {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                <div style={{ marginLeft: 48 }}>
                  {chapter.keyPoints.map((kp, ki) => (
                    <Text key={ki} type="secondary" style={{ display: "block", fontSize: 12 }}>
                      • {kp}
                    </Text>
                  ))}
                </div>
              )}
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
}
