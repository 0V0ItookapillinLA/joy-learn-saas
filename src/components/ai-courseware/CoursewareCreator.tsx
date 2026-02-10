import { useState, useEffect } from "react";
import { Drawer, Steps, Button, Space, message } from "antd";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KnowledgeSelector } from "./KnowledgeSelector";
import { OutlineEditor } from "./OutlineEditor";
import { ScriptEditor } from "./ScriptEditor";
import { PPTPreview } from "./PPTPreview";

interface Courseware {
  id: string;
  title: string;
  description: string | null;
  source_documents: any;
  outline: any;
  scripts: any;
  status: string;
  character_id: string | null;
  video_urls: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

interface Props {
  open: boolean;
  courseware: Courseware | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SlideData {
  chapterIndex: number;
  chapterTitle: string;
  slideIndex: number;
  title: string;
  bullets: string[];
  script: string;
}

function generateSlidesFromOutline(outline: any[], scripts: Record<string, string>): SlideData[] {
  const slides: SlideData[] = [];
  (outline || []).forEach((chapter: any, ci: number) => {
    const script = scripts[chapter.title] || scripts[`chapter_${ci}`] || "";
    const sentences = script.split(/[。！？\n]+/).filter(Boolean);
    
    // Generate 2-4 slides per chapter
    const slideCount = Math.min(4, Math.max(2, Math.ceil(sentences.length / 3)));
    for (let si = 0; si < slideCount; si++) {
      const startIdx = Math.floor(si * sentences.length / slideCount);
      const endIdx = Math.floor((si + 1) * sentences.length / slideCount);
      const slideSentences = sentences.slice(startIdx, endIdx);
      
      slides.push({
        chapterIndex: ci,
        chapterTitle: chapter.title,
        slideIndex: si,
        title: si === 0 ? chapter.title : `${chapter.title} (${si + 1})`,
        bullets: slideSentences.length > 0 
          ? slideSentences.slice(0, 4)
          : [`${chapter.title} 的核心内容`, "详细讲解与案例分析", "实践要点总结"],
        script: slideSentences.join("。") + (slideSentences.length > 0 ? "。" : ""),
      });
    }
  });
  return slides;
}

export function CoursewareCreator({ open, courseware, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [extraPrompt, setExtraPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [outline, setOutline] = useState<any[]>([]);
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [coursewareId, setCoursewareId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (courseware) {
      setTitle(courseware.title);
      setSelectedDocs(Array.isArray(courseware.source_documents) ? courseware.source_documents : []);
      setOutline(Array.isArray(courseware.outline) ? courseware.outline : []);
      setScripts(typeof courseware.scripts === "object" && courseware.scripts ? courseware.scripts : {});
      setCoursewareId(courseware.id);
      setStep(courseware.outline && (courseware.outline as any[]).length > 0 ? 2 : 0);
    } else {
      setTitle("");
      setSelectedDocs([]);
      setExtraPrompt("");
      setOutline([]);
      setScripts({});
      setCoursewareId(null);
      setStep(0);
    }
  }, [courseware, open]);

  const handleGenerate = async () => {
    if (selectedDocs.length === 0) {
      message.warning("请至少选择一篇知识库文档");
      return;
    }
    if (!title.trim()) {
      message.warning("请输入课件标题");
      return;
    }

    setGenerating(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user!.id)
        .single();

      if (!profile?.organization_id) throw new Error("未找到组织信息");

      let cwId = coursewareId;
      if (!cwId) {
        const { data: newCw, error: insertErr } = await supabase
          .from("ai_courseware" as any)
          .insert({
            title,
            description: extraPrompt || null,
            source_documents: selectedDocs.map((d) => d.id),
            status: "generating",
            organization_id: profile.organization_id,
            created_by: user!.id,
          } as any)
          .select()
          .single();
        if (insertErr) throw insertErr;
        cwId = (newCw as any).id;
        setCoursewareId(cwId);
      } else {
        await supabase
          .from("ai_courseware" as any)
          .update({ title, source_documents: selectedDocs.map((d) => d.id), status: "generating" } as any)
          .eq("id", cwId);
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "ai-generate-courseware",
        {
          body: {
            coursewareId: cwId,
            documents: selectedDocs.map((d) => ({
              title: d.title,
              summary: d.ai_summary,
              keyPoints: d.ai_key_points,
            })),
            title,
            extraPrompt,
          },
        }
      );

      if (fnError) throw fnError;

      const result = fnData as any;
      setOutline(result.outline || []);
      setScripts(result.scripts || {});
      setStep(1);
      message.success("大纲生成成功！");
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!coursewareId) return;
    try {
      await supabase
        .from("ai_courseware" as any)
        .update({ outline, scripts, status: "ready" } as any)
        .eq("id", coursewareId);
      message.success("课件保存成功");
      onSuccess();
    } catch (err: any) {
      message.error(err.message || "保存失败");
    }
  };

  const handlePPTConfirm = async (characterId: string | null, voiceStyle: string) => {
    if (!coursewareId) return;
    try {
      // Simulate recording: update status to "recorded" and generate placeholder video URLs
      const videoUrls = outline.map((_: any, i: number) => ({
        chapterId: `ch_${i + 1}`,
        url: `simulated://chapter-${i + 1}.mp4`,
      }));

      await supabase
        .from("ai_courseware" as any)
        .update({
          character_id: characterId,
          status: "recorded",
          outline,
          scripts,
          video_urls: videoUrls,
        } as any)
        .eq("id", coursewareId);
      message.success("课件录制完成！可在列表中点击「预览」查看");
      onSuccess();
    } catch (err: any) {
      message.error(err.message || "保存失败");
    }
  };

  const slides = generateSlidesFromOutline(outline, scripts);

  const steps = [
    { title: "选择知识" },
    { title: "编辑大纲" },
    { title: "编辑讲稿" },
    { title: "PPT确认与录制" },
  ];

  return (
    <Drawer
      title={courseware ? `编辑课件: ${courseware.title}` : "新建课件"}
      open={open}
      onClose={onClose}
      width={step === 3 ? 1100 : 900}
      zIndex={1000}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={onClose}>取消</Button>
          <Space>
            {step > 0 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
            {step === 0 && (
              <Button type="primary" loading={generating} onClick={handleGenerate}>
                生成大纲
              </Button>
            )}
            {step === 1 && (
              <Button type="primary" onClick={() => setStep(2)}>
                下一步
              </Button>
            )}
            {step === 2 && (
              <Space>
                <Button onClick={handleSave}>仅保存讲稿</Button>
                <Button type="primary" onClick={() => setStep(3)}>
                  进入PPT预览
                </Button>
              </Space>
            )}
          </Space>
        </div>
      }
    >
      <Steps current={step} items={steps} style={{ marginBottom: 24 }} />

      {step === 0 && (
        <KnowledgeSelector
          selectedDocs={selectedDocs}
          onSelect={setSelectedDocs}
          title={title}
          onTitleChange={setTitle}
          extraPrompt={extraPrompt}
          onExtraPromptChange={setExtraPrompt}
        />
      )}

      {step === 1 && (
        <OutlineEditor outline={outline} onChange={setOutline} />
      )}

      {step === 2 && (
        <ScriptEditor outline={outline} scripts={scripts} onChange={setScripts} />
      )}

      {step === 3 && (
        <PPTPreview
          slides={slides}
          onConfirm={handlePPTConfirm}
          onBack={() => setStep(2)}
        />
      )}
    </Drawer>
  );
}
