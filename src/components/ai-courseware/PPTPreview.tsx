import { useState } from "react";
import { Card, Typography, Button, Tag, Space, Select, Avatar, Divider, Row, Col, message } from "antd";
import { PlayCircleOutlined, UserOutlined, SoundOutlined, CheckOutlined } from "@ant-design/icons";
import { useAICharacters } from "@/hooks/useAICharacters";

const { Text, Title, Paragraph } = Typography;

interface SlideData {
  chapterIndex: number;
  chapterTitle: string;
  slideIndex: number;
  title: string;
  bullets: string[];
  script: string;
}

interface PPTPreviewProps {
  slides: SlideData[];
  onConfirm: (characterId: string | null, voiceStyle: string) => void;
  onBack: () => void;
}

const voiceOptions = [
  { label: "沉稳男声", value: "沉稳男声" },
  { label: "稳重男声", value: "稳重男声" },
  { label: "清亮女声", value: "清亮女声" },
  { label: "活泼女声", value: "活泼女声" },
  { label: "磁性男声", value: "磁性男声" },
  { label: "温柔女声", value: "温柔女声" },
];

export function PPTPreview({ slides, onConfirm, onBack }: PPTPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("清亮女声");
  const [generating, setGenerating] = useState(false);

  const { data: characters = [] } = useAICharacters();
  const activeCharacters = characters.filter(c => c.is_active);

  const slide = slides[currentSlide];
  if (!slide) return null;

  const handleGenerate = () => {
    if (!selectedCharacter) {
      message.warning("请选择一个讲师形象");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onConfirm(selectedCharacter, selectedVoice);
    }, 2000);
  };

  const selectedChar = activeCharacters.find(c => c.id === selectedCharacter);

  return (
    <div>
      <Row gutter={24}>
        {/* Left: PPT Slide Preview + Script */}
        <Col span={14}>
          {/* PPT Slide */}
          <Card
            style={{ marginBottom: 16, background: "#fff", aspectRatio: "16/9", position: "relative", overflow: "hidden" }}
            styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}
          >
            <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {/* Chapter badge */}
              <Tag color="blue" style={{ alignSelf: "flex-start", marginBottom: 16, fontSize: 12 }}>
                第{slide.chapterIndex + 1}章 · {slide.chapterTitle}
              </Tag>

              <Title level={3} style={{ margin: "0 0 24px", color: "#1a1a2e" }}>
                {slide.title}
              </Title>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {slide.bullets.map((bullet, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: "#e6f4ff",
                      color: "#1677ff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 600, flexShrink: 0
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <Text style={{ fontSize: 15, lineHeight: 1.6 }}>{bullet}</Text>
                  </div>
                ))}
              </div>

              {/* Character avatar in bottom-right */}
              {selectedChar && (
                <div style={{
                  position: "absolute", bottom: 16, right: 16,
                  width: 80, height: 80, borderRadius: 8, overflow: "hidden",
                  border: "2px solid #e6e6e6", background: "#f5f5f5"
                }}>
                  <Avatar
                    src={selectedChar.avatar_url || undefined}
                    size={76}
                    shape="square"
                    icon={<UserOutlined />}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              )}
            </div>

            {/* Slide navigation */}
            <div style={{
              padding: "8px 16px", background: "#f5f5f5", borderTop: "1px solid #e8e8e8",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <Button size="small" disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)}>上一页</Button>
              <Text type="secondary" style={{ fontSize: 12 }}>{currentSlide + 1} / {slides.length}</Text>
              <Button size="small" disabled={currentSlide === slides.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)}>下一页</Button>
            </div>
          </Card>

          {/* Script for this slide */}
          <Card title="本页讲稿" size="small" style={{ marginBottom: 16 }}>
            <Paragraph style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 0 }}>
              {slide.script || "暂无讲稿内容"}
            </Paragraph>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <SoundOutlined style={{ color: "#1677ff" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>预计时长：{Math.ceil((slide.script?.length || 100) / 250)}分钟</Text>
            </div>
          </Card>

          {/* Slide thumbnails */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {slides.map((s, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  minWidth: 100, padding: "8px", borderRadius: 6, cursor: "pointer",
                  border: i === currentSlide ? "2px solid #1677ff" : "1px solid #e8e8e8",
                  background: i === currentSlide ? "#e6f4ff" : "#fafafa",
                }}
              >
                <Text style={{ fontSize: 11, display: "block" }} ellipsis>
                  {s.title}
                </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  第{s.chapterIndex + 1}章 · P{s.slideIndex + 1}
                </Text>
              </div>
            ))}
          </div>
        </Col>

        {/* Right: Character Selection + Voice */}
        <Col span={10}>
          {/* Character Selection */}
          <Card title="选择讲师形象" size="small" style={{ marginBottom: 16 }}>
            {activeCharacters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Text type="secondary">暂无角色，请先在角色配置中创建</Text>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {activeCharacters.map(char => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    style={{
                      width: 100, textAlign: "center", padding: "12px 8px",
                      borderRadius: 8, cursor: "pointer",
                      border: selectedCharacter === char.id ? "2px solid #1677ff" : "1px solid #e8e8e8",
                      background: selectedCharacter === char.id ? "#e6f4ff" : "#fafafa",
                      position: "relative",
                    }}
                  >
                    {selectedCharacter === char.id && (
                      <CheckOutlined style={{
                        position: "absolute", top: 4, right: 4,
                        color: "#1677ff", fontSize: 12,
                      }} />
                    )}
                    <Avatar
                      src={char.avatar_url || undefined}
                      size={56}
                      icon={<UserOutlined />}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={{ fontSize: 12, display: "block" }} ellipsis>{char.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {char.voice_style || "默认"}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Voice Selection */}
          <Card title="选择配音风格" size="small" style={{ marginBottom: 16 }}>
            <Select
              value={selectedVoice}
              onChange={setSelectedVoice}
              style={{ width: "100%" }}
              options={voiceOptions}
            />
            <div style={{ marginTop: 12 }}>
              <Button icon={<PlayCircleOutlined />} size="small" disabled>
                试听效果
              </Button>
            </div>
          </Card>

          <Divider />

          {/* Generate Button */}
          <div style={{ textAlign: "center" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleGenerate}
                loading={generating}
                block
                disabled={!selectedCharacter}
              >
                {generating ? "AI录制中..." : "AI 录制全部"}
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                AI 将根据讲稿内容，使用选定的角色形象和声音自动录制视频课程
              </Text>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
}
