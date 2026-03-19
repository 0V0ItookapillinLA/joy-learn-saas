import { useState } from "react";
import { Button, Card, Input, Typography, Space, Tag, message, Row, Col, Avatar, Divider, Select, Tabs } from "antd";
import {
  EditOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SoundOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Chapter {
  id: string;
  title: string;
  duration: number;
  keyPoints: string[];
}

interface GeneratedCharacter {
  name: string;
  role: "教师" | "助教" | "学生";
  description: string;
  color: string;
}

interface Props {
  coursewareId: string | null;
  outline: Chapter[];
  scripts: Record<string, string>;
  characters: GeneratedCharacter[];
  onOutlineChange: (outline: Chapter[]) => void;
  onScriptsChange: (scripts: Record<string, string>) => void;
  onBack: () => void;
  onSave: () => void;
}

interface SlideData {
  chapterIndex: number;
  chapterId: string;
  chapterTitle: string;
  slideIndex: number;
  title: string;
  bullets: string[];
  script: string;
}

function generateSlides(outline: Chapter[], scripts: Record<string, string>): SlideData[] {
  const slides: SlideData[] = [];
  (outline || []).forEach((chapter, ci) => {
    const script = scripts[chapter.id] || scripts[chapter.title] || "";
    const sentences = script.split(/[。！？\n]+/).filter(Boolean);
    const slideCount = Math.min(4, Math.max(2, Math.ceil(sentences.length / 3)));
    for (let si = 0; si < slideCount; si++) {
      const start = Math.floor(si * sentences.length / slideCount);
      const end = Math.floor((si + 1) * sentences.length / slideCount);
      const ss = sentences.slice(start, end);
      slides.push({
        chapterIndex: ci,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        slideIndex: si,
        title: si === 0 ? chapter.title : `${chapter.title} (${si + 1})`,
        bullets: ss.length > 0 ? ss.slice(0, 4) : [`${chapter.title} 的核心内容`, "详细讲解与案例分析"],
        script: ss.join("。") + (ss.length > 0 ? "。" : ""),
      });
    }
  });
  return slides;
}

export function CourseEditor({ coursewareId, outline, scripts, characters, onOutlineChange, onScriptsChange, onBack, onSave }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingScript, setEditingScript] = useState(false);
  const [activeTab, setActiveTab] = useState("slides");
  const slides = generateSlides(outline, scripts);
  const slide = slides[currentSlide];

  const handleSave = async () => {
    if (!coursewareId) return;
    try {
      await supabase
        .from("ai_courseware" as any)
        .update({ outline, scripts, status: "ready" } as any)
        .eq("id", coursewareId);
      message.success("课件保存成功");
      onSave();
    } catch (err: any) {
      message.error(err.message || "保存失败");
    }
  };

  const updateSlideScript = (value: string) => {
    if (!slide) return;
    const key = slide.chapterId || slide.chapterTitle;
    onScriptsChange({ ...scripts, [key]: value });
  };

  const currentScript = slide ? (scripts[slide.chapterId] || scripts[slide.chapterTitle] || "") : "";

  return (
    <div>
      {/* Top toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>返回</Button>
        <Space>
          <Button icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleSave}>
            保存并预览
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* Left: PPT Slide View */}
        <Col span={16}>
          {slide && (
            <Card
              style={{ marginBottom: 16, aspectRatio: "16/9", position: "relative", overflow: "hidden" }}
              styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}
            >
              <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {/* Chapter number badge */}
                <div style={{
                  position: "absolute", top: 16, right: 24,
                  fontSize: 48, fontWeight: 800, color: "rgba(0,0,0,0.04)",
                }}>
                  {String(slide.chapterIndex + 1).padStart(2, "0")}
                </div>

                <Tag color="blue" style={{ alignSelf: "flex-start", marginBottom: 16 }}>
                  第{slide.chapterIndex + 1}章
                </Tag>

                <Title level={3} style={{ margin: "0 0 24px" }}>{slide.title}</Title>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {slide.bullets.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", background: "#e6f4ff",
                        color: "#1677ff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 600, flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>{b}</Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide nav */}
              <div style={{
                padding: "8px 16px", background: "#f5f5f5", borderTop: "1px solid #e8e8e8",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <Button size="small" disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)}>上一页</Button>
                <Text type="secondary" style={{ fontSize: 12 }}>{currentSlide + 1} / {slides.length}</Text>
                <Button size="small" disabled={currentSlide === slides.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)}>下一页</Button>
              </div>
            </Card>
          )}

          {/* Script editor below slide */}
          <Card
            title={<Space><SoundOutlined /> 逐字讲稿</Space>}
            size="small"
            extra={
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => setEditingScript(!editingScript)}
              >
                {editingScript ? "完成" : "编辑"}
              </Button>
            }
          >
            {editingScript ? (
              <TextArea
                value={currentScript}
                onChange={e => updateSlideScript(e.target.value)}
                rows={6}
                style={{ fontSize: 14, lineHeight: 1.8 }}
              />
            ) : (
              <Paragraph style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 0, whiteSpace: "pre-wrap" }}>
                {currentScript || "暂无讲稿内容"}
              </Paragraph>
            )}
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                预计时长：{Math.ceil((currentScript?.length || 100) / 250)} 分钟
              </Text>
            </div>
          </Card>
        </Col>

        {/* Right: Thumbnails + Characters */}
        <Col span={8}>
          {/* Slide thumbnails */}
          <Card title="幻灯片" size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {slides.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    border: i === currentSlide ? "2px solid #1677ff" : "1px solid #e8e8e8",
                    background: i === currentSlide ? "#e6f4ff" : "#fafafa",
                  }}
                >
                  <Text style={{ fontSize: 12 }} ellipsis>{s.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 10 }}>第{s.chapterIndex + 1}章 · P{s.slideIndex + 1}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Classroom characters */}
          {characters.length > 0 && (
            <Card title="课堂角色" size="small">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {characters.map((char, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={32} icon={<UserOutlined />} style={{ background: char.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 13, fontWeight: 500 }}>{char.name}</Text>
                      <Tag style={{ marginLeft: 4, fontSize: 10 }}>{char.role}</Tag>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }} ellipsis>{char.description}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
