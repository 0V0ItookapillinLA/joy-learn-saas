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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, MessageSquare, FileText, Loader2, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentItem {
  id: string;
  name: string;
  weight: number;
}

interface PracticeFormData {
  title: string;
  department: string;
  description: string;
  scenarioDescription: string;
  aiRoleId: string;
  aiRoleInfo: string;
  traineeRole: string;
  dialogueGoal: string;
  passScore: number;
  passAttempts: number;
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

const mockDepartments = [
  { id: "1", name: "销售部" },
  { id: "2", name: "客服部" },
  { id: "3", name: "人力资源部" },
  { id: "4", name: "市场部" },
];

const defaultAssessmentItems: AssessmentItem[] = [
  { id: "1", name: "非权力影响", weight: 40 },
  { id: "2", name: "非权力影响", weight: 0 },
  { id: "3", name: "勇于进取", weight: 0 },
  { id: "4", name: "跨界思考", weight: 0 },
];

export function PracticeEditSheet({
  open,
  onOpenChange,
  onSave,
  initialData,
}: PracticeEditSheetProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [practiceMode, setPracticeMode] = useState<"free" | "fixed">("free");
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  
  const [formData, setFormData] = useState<PracticeFormData>({
    title: "",
    department: "",
    description: "",
    scenarioDescription: "",
    aiRoleId: "",
    aiRoleInfo: "",
    traineeRole: "",
    dialogueGoal: "",
    passScore: 50,
    passAttempts: 3,
    assessmentItems: defaultAssessmentItems,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      setStep(2);
    } else {
      setFormData({
        title: "",
        department: "",
        description: "",
        scenarioDescription: "",
        aiRoleId: "",
        aiRoleInfo: "",
        traineeRole: "",
        dialogueGoal: "",
        passScore: 50,
        passAttempts: 3,
        assessmentItems: defaultAssessmentItems,
      });
      setStep(1);
      setPromptInput("");
      setActiveTab("basic");
    }
  }, [initialData, open]);

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      toast.error("请输入练习场景描述");
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Calling generate-practice-script with prompt:', promptInput.trim());
      
      const { data, error } = await supabase.functions.invoke('generate-practice-script', {
        body: { 
          prompt: promptInput.trim(),
          practiceMode: practiceMode
        }
      });

      console.log('Edge function response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || '生成失败');
      }

      const script = data.script;
      console.log('Generated script:', script);
      
      setFormData({
        title: script.title || promptInput.slice(0, 20),
        department: "",
        description: script.description || `培训场景：${promptInput}`,
        scenarioDescription: script.scenarioDescription || `目标：学会倾听客户诉求，提供解决方案，维护客户关系，提升客户满意度`,
        aiRoleId: "1",
        aiRoleInfo: script.aiRoleInfo || "",
        traineeRole: script.traineeRole || "学员角色设置",
        dialogueGoal: script.dialogueGoal || `练习目标：基于您的需求设定 评估要点：-沟通技巧运用-专业知识掌握-问题解决能力`,
        passScore: 50,
        passAttempts: 3,
        assessmentItems: script.assessmentItems || defaultAssessmentItems,
      });
      setStep(2);
      toast.success("练习剧本已生成，请检查并完善");
    } catch (error) {
      console.error('Generate error:', error);
      if (error instanceof Error && error.message.includes('429')) {
        toast.error("请求过于频繁，请稍后再试");
      } else if (error instanceof Error && error.message.includes('402')) {
        toast.error("AI服务配额已用尽");
      } else {
        toast.error("生成失败：" + (error instanceof Error ? error.message : '请重试'));
      }
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
      toast.error("请输入练习名称");
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>
            {step === 1 ? "新建练习计划" : "创建练习详情"}
          </SheetTitle>
        </SheetHeader>

        {step === 1 ? (
          <div className="p-6 space-y-6">
            {/* Mode Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">选择练习模式</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      practiceMode === "free"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPracticeMode("free")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">自由对话</div>
                        <div className="text-sm text-muted-foreground">本期支持，可点击进行下一步</div>
                      </div>
                      {practiceMode === "free" && (
                        <CheckCircle2 className="h-5 w-5 text-primary absolute top-4 right-4" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`relative p-4 rounded-lg border-2 cursor-not-allowed opacity-60 ${
                      practiceMode === "fixed"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">固定剧本</div>
                        <div className="text-sm text-muted-foreground">敬请期待</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Script Creation */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium">创建副本</h3>
                
                {/* Tips */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 text-primary font-medium mb-2">
                      <span>📝</span>
                      练习场景描述
                    </div>
                    <div className="text-sm text-primary/80 space-y-1">
                      <p>请详细描述练习场景，包括：</p>
                      <p>具体的业务场景（如客户投诉处理、产品介绍、销售谈判等）</p>
                      <p>场景的背景和上下文</p>
                      <p>可能遇到的情况和挑战</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 font-medium mb-2">
                      <span>👤</span>
                      人物角色设定
                    </div>
                    <div className="text-sm text-orange-600/80 space-y-1">
                      <p>请明确参与角色，包括：</p>
                      <p>学员扮演的角色及其职责</p>
                      <p>AI扮演的角色及其特点</p>
                    </div>
                  </div>
                </div>

                {/* AI Role Selection */}
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

                {/* Script Input */}
                <div className="space-y-2">
                  <Label>创建剧本</Label>
                  <p className="text-sm text-muted-foreground">
                    请在此处详细描述您的练习需求，包括场景、角色和目标。您可以参考上方的引导内容，或者直接开始输入
                  </p>
                  <Textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="请输入"
                    rows={5}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating || !promptInput.trim()}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      生成剧本
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Tips Header */}
            <div className="p-4 grid grid-cols-2 gap-4 border-b bg-muted/30">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
                  <span>📝</span>
                  练习场景描述
                </div>
                <div className="text-xs text-primary/80 space-y-0.5">
                  <p>请详细描述练习场景，包括：</p>
                  <p>具体的业务场景（如客户投诉处理、产品介绍、销售谈判等）</p>
                  <p>场景的背景和上下文</p>
                  <p>可能遇到的情况和挑战</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600 font-medium text-sm mb-1">
                  <span>👤</span>
                  人物角色设定
                </div>
                <div className="text-xs text-orange-600/80 space-y-0.5">
                  <p>请明确参与角色，包括：</p>
                  <p>学员扮演的角色及其职责</p>
                  <p>AI扮演的角色及其特点</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 px-4">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-4"
                >
                  基本信息
                  <Badge variant="outline" className="ml-2 text-orange-500 border-orange-300 bg-orange-50">待完善</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="scene" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-4"
                >
                  设置场景
                  <Badge variant="outline" className="ml-2 text-orange-500 border-orange-300 bg-orange-50">待完善</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="dialogue" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-4"
                >
                  对话设置
                  <Badge variant="outline" className="ml-2 text-orange-500 border-orange-300 bg-orange-50">待完善</Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="basic" className="mt-0 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span>📋</span>
                    <h3 className="font-semibold">基本信息</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <span className="text-destructive">*</span>
                        练习名称
                      </Label>
                      <div className="relative">
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value.slice(0, 40) })
                          }
                          placeholder="请输入练习名称"
                          maxLength={40}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          {formData.title.length} / 40
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <span className="text-destructive">*</span>
                        所属部门
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          setFormData({ ...formData, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="输入框" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>练习描述</Label>
                    <div className="relative">
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value.slice(0, 500) })
                        }
                        placeholder="请输入培训"
                        rows={3}
                        maxLength={500}
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {formData.description.length} / 500
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scene" className="mt-0 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span>📍</span>
                    <h3 className="font-semibold">设置场景</h3>
                  </div>

                  <div className="space-y-2">
                    <Label>练习场景</Label>
                    <div className="relative">
                      <Textarea
                        value={formData.scenarioDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, scenarioDescription: e.target.value.slice(0, 200) })
                        }
                        placeholder="目标：学会倾听客户诉求，提供解决方案，维护客户关系，提升客户满意度"
                        rows={3}
                        maxLength={200}
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {formData.scenarioDescription.length} / 200
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">AI身份</h4>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <span className="text-destructive">*</span>
                        AI角色设置
                      </Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Plus className="h-8 w-8 mx-auto text-primary mb-2" />
                        <span className="text-primary">点击设置形象</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>人员信息</Label>
                      <div className="relative">
                        <Textarea
                          value={formData.aiRoleInfo}
                          onChange={(e) =>
                            setFormData({ ...formData, aiRoleInfo: e.target.value.slice(0, 200) })
                          }
                          placeholder="请输入"
                          rows={3}
                          maxLength={200}
                        />
                        <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                          {formData.aiRoleInfo.length} / 200
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">学员身份</h4>
                      <p className="text-sm text-muted-foreground">学院角色设置</p>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={formData.traineeRole}
                        onChange={(e) =>
                          setFormData({ ...formData, traineeRole: e.target.value.slice(0, 200) })
                        }
                        placeholder="请输入"
                        rows={3}
                        maxLength={200}
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {formData.traineeRole.length} / 200
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dialogue" className="mt-0 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span>💬</span>
                    <h3 className="font-semibold">对话设置</h3>
                  </div>

                  <div className="space-y-2">
                    <Label>对话目标</Label>
                    <p className="text-sm text-muted-foreground">根据剧本拆解，各模块/环节目标</p>
                    <div className="relative">
                      <Textarea
                        value={formData.dialogueGoal}
                        onChange={(e) =>
                          setFormData({ ...formData, dialogueGoal: e.target.value.slice(0, 200) })
                        }
                        placeholder="练习目标：基于您的需求设定 评估要点：-沟通技巧运用-专业知识掌握 -问题解决能力"
                        rows={3}
                        maxLength={200}
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {formData.dialogueGoal.length} / 200
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">完成规则</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <span className="text-destructive">*</span>
                          角色通过练习次数
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={formData.passAttempts || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                passAttempts: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="请输入（数字）"
                            className="flex-1"
                          />
                          <span className="text-muted-foreground">次</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <span className="text-destructive">*</span>
                          角色通过分数
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={formData.passScore || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                passScore: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="请输入（数字）"
                            className="flex-1"
                          />
                          <span className="text-muted-foreground">分</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium text-sm">考察维度</th>
                          <th className="text-left p-3 font-medium text-sm">考察项</th>
                          <th className="text-left p-3 font-medium text-sm">
                            权重 <span className={totalWeight === 100 ? "text-green-600" : "text-destructive"}>{totalWeight}%</span>
                          </th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.assessmentItems.map((item, index) => (
                          <tr key={item.id} className="border-t">
                            {index === 0 && (
                              <td className="p-3 align-top" rowSpan={formData.assessmentItems.length}>
                                <div className="flex items-center gap-2">
                                  行为能力
                                  <Badge variant="outline" className={totalWeight === 100 ? "text-green-600 border-green-300" : "text-destructive border-destructive/30"}>
                                    {totalWeight}%
                                  </Badge>
                                </div>
                              </td>
                            )}
                            <td className="p-3">
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  updateAssessmentItem(item.id, "name", e.target.value)
                                }
                                placeholder="考察项名称"
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm">占比</span>
                                <Input
                                  type="number"
                                  value={item.weight || ""}
                                  onChange={(e) =>
                                    updateAssessmentItem(
                                      item.id,
                                      "weight",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="请输入（数字）"
                                  className="w-24 h-8"
                                  min={0}
                                  max={100}
                                />
                                <span className="text-muted-foreground text-sm">%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAssessmentItem(item.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addAssessmentItem}
                        className="text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加考察项
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-background">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button variant="outline" onClick={handleBack}>
                上一步
              </Button>
              <Button onClick={handleSave}>
                创建计划
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
