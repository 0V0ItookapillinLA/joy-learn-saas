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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentItem {
  id: string;
  name: string;
  weight: number;
}

interface PracticeFormData {
  title: string;
  scenarioDescription: string;
  aiRoleId: string;
  aiRoleInfo: string;
  traineeRole: string;
  dialogueGoal: string;
  passScore: number;
  assessmentItems: AssessmentItem[];
}

interface PracticeEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PracticeFormData) => void;
  initialData?: Partial<PracticeFormData>;
}

const mockAIRoles = [
  { id: "1", name: "ER陪练-员工" },
  { id: "2", name: "愤怒的客户" },
  { id: "3", name: "咨询客户" },
  { id: "4", name: "企业采购" },
];

const defaultAssessmentItems: AssessmentItem[] = [
  { id: "1", name: "沟通技巧", weight: 25 },
  { id: "2", name: "问题解决能力", weight: 25 },
  { id: "3", name: "政策理解与解释能力", weight: 25 },
  { id: "4", name: "情绪管理", weight: 25 },
];

export function PracticeEditSheet({
  open,
  onOpenChange,
  onSave,
  initialData,
}: PracticeEditSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [formData, setFormData] = useState<PracticeFormData>({
    title: "",
    scenarioDescription: "",
    aiRoleId: "",
    aiRoleInfo: "",
    traineeRole: "",
    dialogueGoal: "",
    passScore: 50,
    assessmentItems: defaultAssessmentItems,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      setHasGenerated(true);
    } else {
      setFormData({
        title: "",
        scenarioDescription: "",
        aiRoleId: "",
        aiRoleInfo: "",
        traineeRole: "",
        dialogueGoal: "",
        passScore: 50,
        assessmentItems: defaultAssessmentItems,
      });
      setHasGenerated(false);
      setPromptInput("");
    }
  }, [initialData, open]);

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      toast.error("请输入练习场景描述");
      return;
    }

    setIsGenerating(true);
    try {
      // Call AI to generate practice content
      const { data, error } = await supabase.functions.invoke('generate-training-plan', {
        body: { 
          prompt: `生成一个AI对话练习场景：${promptInput.trim()}。
请返回JSON格式，包含以下字段：
- title: 练习标题
- scenarioDescription: 培训场景详细描述
- aiRoleInfo: AI扮演的角色详细信息（包括姓名、职位、性格特点等）
- traineeRole: 学员需要扮演的角色和需要注意的要点
- dialogueGoal: 对话训练目标，包含能力培养点
- assessmentItems: 考察项数组，每项包含name和weight（权重百分比，总和为100）`
        }
      });

      if (error) throw error;

      // Parse the AI response
      const plan = data.plan;
      setFormData({
        title: plan.title || promptInput.slice(0, 20) + "...",
        scenarioDescription: plan.description || `培训场景：${promptInput}`,
        aiRoleId: "1",
        aiRoleInfo: plan.targetAudience || "AI需要扮演的角色\n\n你的身份：\n• 姓名：待设置\n• 职位：待设置\n• 你在本次培训中扮演一名需要与学员进行多轮、逐步推进的沟通。",
        traineeRole: "学员角色设置\n\n• 离职时间与交接节奏的安排\n• 赔偿金、未休假期等具体问题的解释与确认\n• 竞业协议相关政策的说明与安抚",
        dialogueGoal: plan.objectives || "对话训练目标",
        passScore: 50,
        assessmentItems: plan.skillsTargeted?.slice(0, 5).map((skill: string, index: number) => ({
          id: String(index + 1),
          name: skill,
          weight: Math.floor(100 / Math.min(plan.skillsTargeted.length, 5)),
        })) || defaultAssessmentItems,
      });
      setHasGenerated(true);
      toast.success("练习内容已生成，请检查并完善");
    } catch (error) {
      console.error('Generate error:', error);
      toast.error("生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const addAssessmentItem = () => {
    setFormData((prev) => ({
      ...prev,
      assessmentItems: [
        ...prev.assessmentItems,
        { id: String(Date.now()), name: "", weight: 0 },
      ],
    }));
  };

  const removeAssessmentItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      assessmentItems: prev.assessmentItems.filter((item) => item.id !== id),
    }));
  };

  const updateAssessmentItem = (
    id: string,
    field: "name" | "weight",
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      assessmentItems: prev.assessmentItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const totalWeight = formData.assessmentItems.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  const handleSave = () => {
    if (!formData.title) {
      toast.error("请输入练习标题");
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>
            {initialData ? "编辑练习计划" : "新建练习计划"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* AI Generation Section - only show if not generated yet */}
          {!hasGenerated && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI 智能生成练习内容
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="请描述您的练习场景，例如：员工离职面谈场景，需要HR与即将离职的员工进行沟通，处理交接、赔偿等问题..."
                  rows={4}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !promptInput.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI 正在生成...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      一键生成练习内容
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Generated/Editable Content */}
          {(hasGenerated || initialData) && (
            <>
              {/* Scene Setup */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">设置场景</h3>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    练习标题
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="请输入练习标题"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    练习场景
                  </Label>
                  <Textarea
                    value={formData.scenarioDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scenarioDescription: e.target.value,
                      })
                    }
                    placeholder="培训场景：在模拟的公司内部环境中，通过角色扮演的方式，对HR或相关管理人员进行培训。"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.scenarioDescription.length} / 5000
                  </p>
                </div>
              </div>

              <Separator />

              {/* AI Role */}
              <div className="space-y-4">
                <h3 className="font-semibold">AI身份</h3>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    AI角色设置
                  </Label>
                  <Select
                    value={formData.aiRoleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, aiRoleId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择AI角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAIRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    AI角色信息
                  </Label>
                  <Textarea
                    value={formData.aiRoleInfo}
                    onChange={(e) =>
                      setFormData({ ...formData, aiRoleInfo: e.target.value })
                    }
                    placeholder="AI需要扮演的角色详细信息..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.aiRoleInfo.length} / 5000
                  </p>
                </div>
              </div>

              <Separator />

              {/* Trainee Role */}
              <div className="space-y-4">
                <h3 className="font-semibold">学员身份</h3>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    学员角色设置
                  </Label>
                  <Textarea
                    value={formData.traineeRole}
                    onChange={(e) =>
                      setFormData({ ...formData, traineeRole: e.target.value })
                    }
                    placeholder="学员需要扮演的角色和注意事项..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.traineeRole.length} / 5000
                  </p>
                </div>
              </div>

              <Separator />

              {/* Dialogue Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <h3 className="font-semibold">对话设置</h3>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    对话目标
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    根据剧本拆解，各模块/环节目标
                  </p>
                  <Textarea
                    value={formData.dialogueGoal}
                    onChange={(e) =>
                      setFormData({ ...formData, dialogueGoal: e.target.value })
                    }
                    placeholder="对话训练目标..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.dialogueGoal.length} / 5000
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>完成规则</Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">
                        角色通过分数
                      </Label>
                      <Input
                        type="number"
                        value={formData.passScore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passScore: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-muted-foreground">分</span>
                    </div>
                  </div>
                </div>

                {/* Assessment Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>考察项</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">权重</span>
                      <Badge
                        variant={totalWeight === 100 ? "default" : "destructive"}
                      >
                        {totalWeight}%
                      </Badge>
                    </div>
                  </div>

                  <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      {formData.assessmentItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3"
                        >
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              updateAssessmentItem(item.id, "name", e.target.value)
                            }
                            placeholder="考察项名称"
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">
                            占比
                          </span>
                          <Input
                            type="number"
                            value={item.weight}
                            onChange={(e) =>
                              updateAssessmentItem(
                                item.id,
                                "weight",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16"
                            min={0}
                            max={100}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAssessmentItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addAssessmentItem}
                        className="text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加考察项
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!hasGenerated && !initialData}>
            保存
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
