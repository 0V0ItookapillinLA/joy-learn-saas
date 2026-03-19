import { useState, useEffect } from "react";
import { Input, Button, Typography, Card, Select, Avatar, Space, message, Divider } from "antd";
import { UserOutlined, ThunderboltOutlined, BookOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAICharacters } from "@/hooks/useAICharacters";
import { KnowledgeTreeSelect } from "@/components/knowledge-base/KnowledgeTreeSelect";
import { GenerationAnimation } from "./GenerationAnimation";
import { CourseEditor } from "./CourseEditor";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  editingId: string | null;
  onCreated: () => void;
}

type Phase = "input" | "generating" | "editing";

interface GeneratedCharacter {
  name: string;
  role: "教师" | "助教" | "学生";
  description: string;
  color: string;
}

export function CourseCreator({ editingId, onCreated }: Props) {
  const [phase, setPhase] = useState<Phase>("input");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [knowledgeIds, setKnowledgeIds] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [coursewareId, setCoursewareId] = useState<string | null>(null);
  const [outline, setOutline] = useState<any[]>([]);
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const [classroomCharacters, setClassroomCharacters] = useState<GeneratedCharacter[]>([]);
  const [generationStep, setGenerationStep] = useState(0);

  const { user } = useAuth();
  const { data: characters = [] } = useAICharacters();
  const activeCharacters = characters.filter(c => c.is_active);

  // Load existing courseware for editing
  useEffect(() => {
    if (editingId) {
      loadCourseware(editingId);
    } else {
      resetForm();
    }
  }, [editingId]);

  const resetForm = () => {
    setPhase("input");
    setTitle("");
    setDescription("");
    setKnowledgeIds([]);
    setSelectedCharacter(null);
    setCoursewareId(null);
    setOutline([]);
    setScripts({});
    setClassroomCharacters([]);
    setGenerationStep(0);
  };

  const loadCourseware = async (id: string) => {
    const { data } = await supabase.from("ai_courseware" as any).select("*").eq("id", id).single();
    if (data) {
      const cw = data as any;
      setTitle(cw.title);
      setDescription(cw.description || "");
      setCoursewareId(cw.id);
      setOutline(Array.isArray(cw.outline) ? cw.outline : []);
      setScripts(typeof cw.scripts === "object" && cw.scripts ? cw.scripts : {});
      setSelectedCharacter(cw.character_id);
      setPhase("editing");
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) { message.warning("请输入课程标题"); return; }
    if (knowledgeIds.length === 0) { message.warning("请选择知识库资料"); return; }

    setGenerating(true);
    setPhase("generating");
    setGenerationStep(0);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user!.id)
        .single();
      if (!profile?.organization_id) throw new Error("未找到组织信息");

      // Step 0: Generate classroom characters (simulated)
      setGenerationStep(0);
      const selectedChar = activeCharacters.find(c => c.id === selectedCharacter);
      const generatedChars: GeneratedCharacter[] = [
        {
          name: selectedChar?.name || "AI讲师",
          role: "教师",
          description: selectedChar?.personality || "专业的课程讲师",
          color: "#1677ff",
        },
        {
          name: "小智助教",
          role: "助教",
          description: "负责课堂互动与知识点补充，善于总结和归纳",
          color: "#52c41a",
        },
        {
          name: "学员小李",
          role: "学生",
          description: "积极好学的学员，喜欢提问和思考",
          color: "#faad14",
        },
        {
          name: "学员小王",
          role: "学生",
          description: "注重实践的学员，关注知识的实际应用",
          color: "#eb2f96",
        },
      ];
      setClassroomCharacters(generatedChars);

      await new Promise(r => setTimeout(r, 2500));

      // Step 1: Generate outline
      setGenerationStep(1);

      // Fetch knowledge documents info
      const docIds = knowledgeIds.filter(v => v.startsWith("doc:")).map(v => v.replace("doc:", ""));
      const kbIds = knowledgeIds.filter(v => v.startsWith("kb:")).map(v => v.replace("kb:", ""));

      let documents: any[] = [];
      if (docIds.length > 0) {
        const { data: docs } = await supabase
          .from("knowledge_documents")
          .select("id, title, ai_summary, ai_key_points")
          .in("id", docIds);
        if (docs) documents = docs;
      }
      if (kbIds.length > 0) {
        const { data: kbDocs } = await supabase
          .from("knowledge_documents")
          .select("id, title, ai_summary, ai_key_points")
          .in("knowledge_base_id", kbIds)
          .eq("status", "ready");
        if (kbDocs) documents = [...documents, ...kbDocs];
      }

      // Create courseware record
      let cwId = coursewareId;
      if (!cwId) {
        const { data: newCw, error: insertErr } = await supabase
          .from("ai_courseware" as any)
          .insert({
            title,
            description: description || null,
            source_documents: knowledgeIds,
            status: "generating",
            organization_id: profile.organization_id,
            created_by: user!.id,
            character_id: selectedCharacter,
          } as any)
          .select()
          .single();
        if (insertErr) throw insertErr;
        cwId = (newCw as any).id;
        setCoursewareId(cwId);
      }

      // Call AI generation
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "ai-generate-courseware",
        {
          body: {
            coursewareId: cwId,
            documents: documents.map(d => ({
              title: d.title,
              summary: d.ai_summary,
              keyPoints: d.ai_key_points,
            })),
            title,
            extraPrompt: description,
          },
        }
      );
      if (fnError) throw fnError;

      const result = fnData as any;
      setOutline(result.outline || []);
      setScripts(result.scripts || {});

      // Step 2: Generate page content
      setGenerationStep(2);
      await new Promise(r => setTimeout(r, 2000));

      // Step 3: Generate teaching actions
      setGenerationStep(3);
      await new Promise(r => setTimeout(r, 2000));

      // Done - move to editing
      setPhase("editing");
      message.success("课程生成成功！");
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "生成失败");
      setPhase("input");
    } finally {
      setGenerating(false);
    }
  };

  if (phase === "generating") {
    return (
      <GenerationAnimation
        step={generationStep}
        characters={classroomCharacters}
        onContinue={() => setGenerationStep(prev => prev + 1)}
      />
    );
  }

  if (phase === "editing") {
    return (
      <CourseEditor
        coursewareId={coursewareId}
        outline={outline}
        scripts={scripts}
        characters={classroomCharacters}
        onOutlineChange={setOutline}
        onScriptsChange={setScripts}
        onBack={() => setPhase("input")}
        onSave={onCreated}
      />
    );
  }

  // Input phase
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          <ThunderboltOutlined style={{ marginRight: 8, color: "#1677ff" }} />
          AI 智能制课
        </Title>
        <Text type="secondary">输入课程信息，AI 自动生成互动课堂</Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>课程标题 *</Text>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：金牌销售的第一课：心态与定位"
              size="large"
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>课程描述</Text>
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="描述课程的目标、受众、重点内容等，帮助 AI 更好地理解您的需求..."
              rows={4}
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              <BookOutlined style={{ marginRight: 4 }} />
              选择知识库 *
            </Text>
            <KnowledgeTreeSelect
              value={knowledgeIds}
              onChange={setKnowledgeIds}
              placeholder="选择知识库或具体文档"
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              选择教师角色
            </Text>
            {activeCharacters.length === 0 ? (
              <Text type="secondary">暂无可用角色，请先在角色配置中创建</Text>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {activeCharacters.map(char => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacter(selectedCharacter === char.id ? null : char.id)}
                    style={{
                      width: 110,
                      textAlign: "center",
                      padding: "16px 8px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border: selectedCharacter === char.id ? "2px solid #1677ff" : "1px solid #e8e8e8",
                      background: selectedCharacter === char.id ? "#e6f4ff" : "#fafafa",
                      transition: "all 0.2s",
                    }}
                  >
                    <Avatar
                      src={char.avatar_url || undefined}
                      size={56}
                      icon={<UserOutlined />}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={{ fontSize: 13, display: "block" }} ellipsis>{char.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{char.voice_style || "默认"}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Space>
      </Card>

      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={handleGenerate}
          loading={generating}
          style={{ minWidth: 200, height: 48, fontSize: 16 }}
        >
          开始生成课程
        </Button>
      </div>
    </div>
  );
}
