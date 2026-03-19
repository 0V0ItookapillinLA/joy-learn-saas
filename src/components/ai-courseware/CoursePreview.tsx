import { useState, useEffect } from "react";
import { Typography, Button, Tag, Input, Avatar, Space } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, SendOutlined, UserOutlined, SoundOutlined } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

interface Courseware {
  id: string;
  title: string;
  outline: any;
  scripts: any;
  character_id: string | null;
  [key: string]: any;
}

interface ChatMessage {
  role: string;
  name: string;
  content: string;
  color: string;
}

export function CoursePreview({ courseware }: { courseware: Courseware }) {
  const outline = Array.isArray(courseware.outline) ? courseware.outline : [];
  const scripts = typeof courseware.scripts === "object" && courseware.scripts ? courseware.scripts : {};
  const [currentChapter, setCurrentChapter] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentChapter < outline.length - 1) {
            setCurrentChapter(c => c + 1);
            return 0;
          }
          setPlaying(false);
          return 100;
        }
        return p + 0.5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [playing, currentChapter, outline.length]);

  if (outline.length === 0) return <div style={{ textAlign: "center", padding: 40 }}><Text type="secondary">暂无课件内容</Text></div>;

  const chapter = outline[currentChapter] || outline[0];
  const script = scripts[chapter?.id] || scripts[chapter?.title] || "";

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: "user", name: "我", content: chatInput, color: "#1677ff" };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate AI responses
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { role: "teacher", name: "AI讲师", content: `关于"${chatInput}"，这是一个很好的问题。让我来详细解答...`, color: "#1677ff" },
      ]);
    }, 1000);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", name: "小智助教", content: "补充一下，这个知识点在实际场景中经常用到。", color: "#52c41a" },
      ]);
    }, 2000);
  };

  return (
    <div>
      {/* Video/PPT area */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: "16/9",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        borderRadius: 12, overflow: "hidden", marginBottom: 16,
      }}>
        <div style={{ padding: "40px 100px 40px 40px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{
            position: "absolute", top: 16, right: 24,
            fontSize: 48, fontWeight: 800, color: "rgba(255,255,255,0.08)",
          }}>
            {String(currentChapter + 1).padStart(2, "0")}
          </div>
          <Title level={3} style={{ color: "#fff", margin: "0 0 16px 0" }}>
            {chapter?.title}
          </Title>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.8, maxHeight: 200, overflow: "hidden" }}>
            {script ? script.slice(0, 300) + (script.length > 300 ? "..." : "") : "讲稿内容加载中..."}
          </div>
        </div>

        {/* Subtitle bar */}
        <div style={{
          position: "absolute", bottom: 40, left: 0, right: 0,
          padding: "8px 20px", background: "rgba(0,0,0,0.6)", textAlign: "center",
        }}>
          <Text style={{ color: "#fff", fontSize: 13 }}>
            {script ? script.slice(0, 80) + "..." : ""}
          </Text>
        </div>

        {/* Avatar */}
        <div style={{
          position: "absolute", bottom: 60, right: 20,
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "3px solid rgba(255,255,255,0.4)",
          animation: playing ? "pulse 2s ease-in-out infinite" : "none",
        }}>
          <span style={{ fontSize: 28 }}>🎙️</span>
        </div>

        {/* Play overlay */}
        {!playing && (
          <div
            onClick={() => { setPlaying(true); if (progress >= 100) { setProgress(0); setCurrentChapter(0); } }}
            style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.3)", cursor: "pointer",
            }}
          >
            <PlayCircleOutlined style={{ fontSize: 64, color: "#fff", opacity: 0.9 }} />
          </div>
        )}

        {/* Progress */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#667eea", transition: "width 50ms linear" }} />
        </div>
      </div>

      {/* Controls + chapters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Button size="small" onClick={() => setPlaying(!playing)}>
          {playing ? "暂停" : "播放"}
        </Button>
        <Text type="secondary" style={{ fontSize: 12 }}>
          第 {currentChapter + 1}/{outline.length} 章 · {chapter?.title}
        </Text>
      </div>

      {/* Chapter list */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {outline.map((ch: any, i: number) => (
          <div
            key={i}
            onClick={() => { setCurrentChapter(i); setProgress(0); }}
            style={{
              minWidth: 120, padding: "8px 12px", borderRadius: 8, cursor: "pointer",
              background: i === currentChapter ? "#e6f4ff" : "#fafafa",
              border: i === currentChapter ? "1px solid #91caff" : "1px solid #e8e8e8",
            }}
          >
            <Text style={{ fontSize: 12 }} strong={i === currentChapter}>第{i + 1}章: {ch.title}</Text>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "8px 16px", background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
          <Text strong style={{ fontSize: 13 }}>💬 课堂讨论</Text>
        </div>
        <div style={{ maxHeight: 200, overflowY: "auto", padding: 16 }}>
          {chatMessages.length === 0 && (
            <Text type="secondary" style={{ fontSize: 13 }}>在下方输入您的问题，教师和同学将帮您讨论解答</Text>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Avatar size={28} icon={<UserOutlined />} style={{ background: msg.color, flexShrink: 0 }} />
              <div>
                <Text strong style={{ fontSize: 12, color: msg.color }}>{msg.name}</Text>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, padding: "8px 16px", borderTop: "1px solid #e8e8e8" }}>
          <Input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onPressEnter={handleSendChat}
            placeholder="输入您的问题..."
            style={{ flex: 1 }}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSendChat} />
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
    </div>
  );
}
