import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Select, Tabs, Card, Typography, Upload, Space, App } from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined, HolderOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { TrainingPlan } from "./TrainingPlanTable";
import { usePracticeSessions } from "@/hooks/usePracticeSessions";
import { useLessonContents } from "@/hooks/useLessonContents";
import { useExams } from "@/hooks/useExams";

const { TextArea } = Input;
const { Text } = Typography;

interface Chapter {
  id: string;
  title: string;
  items: ChapterItem[];
}

interface ChapterItem {
  id: string;
  type: "lesson" | "practice" | "exam";
  itemId?: string;
  title?: string;
}

interface TrainingPlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: TrainingPlan | null;
  onSave: (data: Partial<TrainingPlan>) => void;
}

export function TrainingPlanSheet({
  open,
  onOpenChange,
  plan,
  onSave,
}: TrainingPlanSheetProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { data: practiceSessions = [] } = usePracticeSessions();
  const { data: lessonContents = [] } = useLessonContents();
  const { data: exams = [] } = useExams();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("basic");
  const [chapters, setChapters] = useState<Chapter[]>([{ id: "1", title: "章节1", items: [{ id: "1-1", type: "lesson" }] }]);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!plan;

  useEffect(() => {
    if (plan) {
      form.setFieldsValue({
        title: plan.title || "",
        description: plan.description || "",
        department: "",
      });
      if (plan.training_chapters && plan.training_chapters.length > 0) {
        const loadedChapters: Chapter[] = plan.training_chapters
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            items: parseChapterItems(chapter),
          }));
        setChapters(loadedChapters);
      }
    } else {
      form.resetFields();
      setChapters([{ id: "1", title: "章节1", items: [{ id: "1-1", type: "lesson" }] }]);
    }
  }, [plan, open, form]);

  const parseChapterItems = (chapter: { id: string; description: string | null; content_items?: string | null }): ChapterItem[] => {
    const chapterId = chapter.id;
    if (chapter.content_items) {
      try {
        const items = typeof chapter.content_items === "string" ? JSON.parse(chapter.content_items) : chapter.content_items;
        if (Array.isArray(items) && items.length > 0) {
          return items.map((item: any, index: number) => ({
            id: item.id || `${chapterId}-${index + 1}`,
            type: item.type === "assessment" ? "exam" : item.type || "lesson",
            title: item.title,
            itemId: item.itemId,
          }));
        }
      } catch (e) {
        console.error("Failed to parse content_items:", e);
      }
    }
    return [{ id: `${chapterId}-1`, type: "lesson" }];
  };

  const addChapter = () => {
    const newId = String(chapters.length + 1);
    setChapters([...chapters, { id: newId, title: `章节${chapters.length + 1}`, items: [{ id: `${newId}-1`, type: "lesson" }] }]);
  };

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((c) => c.id !== chapterId));
  };

  const addChapterItem = (chapterId: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, items: [...chapter.items, { id: `${chapterId}-${chapter.items.length + 1}`, type: "lesson" }] }
          : chapter
      )
    );
  };

  const removeChapterItem = (chapterId: string, itemId: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, items: chapter.items.filter((item) => item.id !== itemId) } : chapter
      )
    );
  };

  const updateChapterItemType = (chapterId: string, itemId: string, type: "lesson" | "practice" | "exam") => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, items: chapter.items.map((item) => (item.id === itemId ? { ...item, type, itemId: undefined, title: undefined } : item)) }
          : chapter
      )
    );
  };

  const updateChapterItemSelection = (chapterId: string, itemId: string, selectedItemId: string, selectedTitle: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, items: chapter.items.map((item) => (item.id === itemId ? { ...item, itemId: selectedItemId, title: selectedTitle } : item)) }
          : chapter
      )
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        message.error("请先登录");
        return;
      }

      const { data: orgId, error: initError } = await supabase.rpc("initialize_user_with_organization", {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: "我的组织",
      });

      if (initError) {
        message.error("初始化用户组织失败");
        return;
      }

      if (isEdit && plan) {
        const { error: planError } = await supabase
          .from("training_plans")
          .update({ title: values.title, description: values.description, updated_at: new Date().toISOString() })
          .eq("id", plan.id);
        if (planError) throw planError;
        message.success("培训计划已更新");
      } else {
        const { data: trainingPlan, error: planError } = await supabase
          .from("training_plans")
          .insert({ title: values.title, description: values.description, organization_id: orgId, created_by: user.id, status: "draft" })
          .select()
          .single();
        if (planError) throw planError;

        if (trainingPlan && chapters.length > 0) {
          const chaptersToInsert = chapters.map((chapter, index) => ({
            training_plan_id: trainingPlan.id,
            title: chapter.title,
            sort_order: index,
            chapter_type: "mixed",
          }));
          const { error: chaptersError } = await supabase.from("training_chapters").insert(chaptersToInsert);
          if (chaptersError) throw chaptersError;
        }
        message.success("培训计划已创建");
      }

      queryClient.invalidateQueries({ queryKey: ["training-plans"] });
      onSave({ title: values.title, description: values.description });
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      message.error("保存失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsSaving(false);
    }
  };

  const tabItems = [
    {
      key: "basic",
      label: "基本信息",
      children: (
        <Form form={form} layout="vertical">
          <Form.Item label="培训名称" name="title" rules={[{ required: true, message: "请输入培训名称" }]}>
            <Input placeholder="请输入培训名称" />
          </Form.Item>
          <Form.Item label="所属部门" name="department">
            <Select placeholder="请选择部门">
              <Select.Option value="sales">销售部</Select.Option>
              <Select.Option value="marketing">市场部</Select.Option>
              <Select.Option value="hr">人力资源部</Select.Option>
              <Select.Option value="tech">技术部</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="培训描述" name="description">
            <TextArea placeholder="请输入培训描述" rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "content",
      label: "培训内容",
      children: (
        <div>
          <Card size="small" title="Banner配置" style={{ marginBottom: 16 }}>
            <Upload.Dragger>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击上传Banner图片 或 拖拽文件到此处</p>
              <p className="ant-upload-hint">支持JPG、PNG格式，建议尺寸343px*150px</p>
            </Upload.Dragger>
          </Card>

          <Card size="small" title="章节管理">
            {chapters.map((chapter, chapterIndex) => (
              <Card
                key={chapter.id}
                size="small"
                title={<Input value={chapter.title} onChange={(e) => setChapters(chapters.map((c) => (c.id === chapter.id ? { ...c, title: e.target.value } : c)))} bordered={false} />}
                extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeChapter(chapter.id)} />}
                style={{ marginBottom: 8 }}
              >
                {chapter.items.map((item, itemIndex) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <HolderOutlined style={{ color: "#999" }} />
                    <Select value={item.type} onChange={(value) => updateChapterItemType(chapter.id, item.id, value)} style={{ width: 100 }}>
                      <Select.Option value="lesson">课程</Select.Option>
                      <Select.Option value="practice">练习</Select.Option>
                      <Select.Option value="exam">考评</Select.Option>
                    </Select>
                    <Select
                      value={item.itemId}
                      onChange={(value, option: any) => updateChapterItemSelection(chapter.id, item.id, value, option?.label || "")}
                      style={{ flex: 1 }}
                      placeholder="选择内容"
                    >
                      {item.type === "lesson" &&
                        lessonContents.map((c) => (
                          <Select.Option key={c.id} value={c.id} label={c.title}>
                            {c.title}
                          </Select.Option>
                        ))}
                      {item.type === "practice" &&
                        practiceSessions.map((p) => (
                          <Select.Option key={p.id} value={p.id} label={p.title}>
                            {p.title}
                          </Select.Option>
                        ))}
                      {item.type === "exam" &&
                        exams.map((e) => (
                          <Select.Option key={e.id} value={e.id} label={e.title}>
                            {e.title}
                          </Select.Option>
                        ))}
                    </Select>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeChapterItem(chapter.id, item.id)} />
                  </div>
                ))}
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => addChapterItem(chapter.id)} block>
                  添加内容
                </Button>
              </Card>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addChapter} block>
              添加章节
            </Button>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={isEdit ? "编辑计划" : "新建计划"}
      placement="right"
      width={640}
      open={open}
      onClose={() => onOpenChange(false)}
      zIndex={1000}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="primary" onClick={handleSave} loading={isSaving}>
            保存
          </Button>
        </div>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Drawer>
  );
}
