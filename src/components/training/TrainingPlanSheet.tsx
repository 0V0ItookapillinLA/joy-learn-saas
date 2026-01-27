import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TrainingPlan } from "./TrainingPlanTable";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [sequentialLearning, setSequentialLearning] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      title: "章节1",
      items: [{ id: "1-1", type: "lesson" }],
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!plan;
  const basicComplete = title && department && description;
  const contentComplete = chapters.length > 0;

  useEffect(() => {
    if (plan) {
      setTitle(plan.title || "");
      setDescription(plan.description || "");
    } else {
      setTitle("");
      setDescription("");
      setDepartment("");
      setChapters([
        {
          id: "1",
          title: "章节1",
          items: [{ id: "1-1", type: "lesson" }],
        },
      ]);
    }
  }, [plan, open]);

  const addChapter = () => {
    const newId = String(chapters.length + 1);
    setChapters([
      ...chapters,
      {
        id: newId,
        title: `章节${chapters.length + 1}`,
        items: [{ id: `${newId}-1`, type: "lesson" }],
      },
    ]);
  };

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((c) => c.id !== chapterId));
  };

  const addChapterItem = (chapterId: string) => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            items: [
              ...chapter.items,
              { id: `${chapterId}-${chapter.items.length + 1}`, type: "lesson" },
            ],
          };
        }
        return chapter;
      })
    );
  };

  const removeChapterItem = (chapterId: string, itemId: string) => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            items: chapter.items.filter((item) => item.id !== itemId),
          };
        }
        return chapter;
      })
    );
  };

  const updateChapterItemType = (
    chapterId: string,
    itemId: string,
    type: "lesson" | "practice" | "exam"
  ) => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            items: chapter.items.map((item) =>
              item.id === itemId ? { ...item, type } : item
            ),
          };
        }
        return chapter;
      })
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("请输入培训名称");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("请先登录后再创建培训计划");
        return;
      }
      
      // 调用初始化函数确保用户有组织
      const { data: orgId, error: initError } = await supabase.rpc('initialize_user_with_organization', {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: '我的组织'
      });
      
      if (initError) {
        console.error('Init error:', initError);
        toast.error("初始化用户组织失败");
        return;
      }

      if (isEdit && plan) {
        // Update existing plan
        const { error: planError } = await supabase
          .from('training_plans')
          .update({
            title,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', plan.id);

        if (planError) throw planError;
        toast.success("培训计划已更新");
      } else {
        // Create new plan
        const { data: trainingPlan, error: planError } = await supabase
          .from('training_plans')
          .insert({
            title,
            description,
            organization_id: orgId,
            created_by: user?.id || null,
            status: 'draft',
          })
          .select()
          .single();

        if (planError) throw planError;

        // Insert chapters
        if (trainingPlan && chapters.length > 0) {
          const chaptersToInsert = chapters.map((chapter, index) => ({
            training_plan_id: trainingPlan.id,
            title: chapter.title,
            sort_order: index,
            chapter_type: 'mixed',
          }));

          const { error: chaptersError } = await supabase
            .from('training_chapters')
            .insert(chaptersToInsert);

          if (chaptersError) throw chaptersError;
        }

        toast.success("培训计划已创建");
      }

      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });

      onSave({ title, description });
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("保存失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>{isEdit ? "编辑计划" : "新建计划"}</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="basic" className="gap-2">
              基本信息
              {!basicComplete && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                  待完善
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              培训内容
              {!contentComplete && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                  待完善
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-medium text-base">基本信息</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      <span className="text-destructive">*</span> 培训名称
                    </Label>
                    <Input
                      placeholder="请输入"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <span className="text-destructive">*</span> 所属部门
                    </Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="请输入所属部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">销售部</SelectItem>
                        <SelectItem value="marketing">市场部</SelectItem>
                        <SelectItem value="hr">人力资源部</SelectItem>
                        <SelectItem value="tech">技术部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    <span className="text-destructive">*</span> 培训描述
                  </Label>
                  <Textarea
                    placeholder="请输入"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length} / 500
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h3 className="font-medium text-base">培训内容</h3>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-sm">Banner配置</p>
                    <p className="text-xs text-muted-foreground">
                      培训Banner图片
                    </p>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm">
                      <span className="text-primary">点击上传Banner图片</span>{" "}
                      或者 拖拽文件到此处
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持JPG、PNG格式，建议尺寸343px*150px
                    </p>
                  </div>
                </div>

                {/* Chapter Management */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">章节管理</span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sequential"
                        checked={sequentialLearning}
                        onCheckedChange={(checked) =>
                          setSequentialLearning(!!checked)
                        }
                      />
                      <Label
                        htmlFor="sequential"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        依次学习（需按顺序，前序不完成后续内容无法学习）
                      </Label>
                    </div>
                  </div>

                  {chapters.map((chapter) => (
                    <Card key={chapter.id} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <span className="font-medium text-sm">
                              {chapter.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              编辑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeChapter(chapter.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {chapter.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 pl-6"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Select
                              value={item.type}
                              onValueChange={(value) =>
                                updateChapterItemType(
                                  chapter.id,
                                  item.id,
                                  value as "lesson" | "practice" | "exam"
                                )
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lesson">教学</SelectItem>
                                <SelectItem value="practice">练习</SelectItem>
                                <SelectItem value="exam">考评</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="请选择项目" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="item1">项目1</SelectItem>
                                <SelectItem value="item2">项目2</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="暂无数据" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">暂无数据</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                removeChapterItem(chapter.id, item.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary ml-6"
                          onClick={() => addChapterItem(chapter.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          添加项
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={addChapter}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新建章节
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "确定"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
