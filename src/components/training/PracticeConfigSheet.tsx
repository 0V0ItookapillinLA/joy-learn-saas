import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, MessageSquare, Users, Target, Award } from "lucide-react";

interface AssessmentItem {
  id: string;
  name: string;
  weight: number;
}

interface PracticeConfig {
  title: string;
  scenarioDescription: string;
  aiRoleId: string;
  aiRoleInfo: string;
  traineeRole: string;
  dialogueGoal: string;
  passScore: number;
  passAttempts: number;
  assessmentItems: AssessmentItem[];
}

interface PracticeConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: PracticeConfig) => void;
  initialData?: Partial<PracticeConfig>;
}

const mockAIRoles = [
  { id: "1", name: "ER陪练-员工" },
  { id: "2", name: "愤怒的客户" },
  { id: "3", name: "咨询客户" },
  { id: "4", name: "企业采购" },
];

const defaultAssessmentItems: AssessmentItem[] = [
  { id: "1", name: "非权力影响", weight: 40 },
  { id: "2", name: "沟通技巧", weight: 30 },
  { id: "3", name: "专业知识", weight: 20 },
  { id: "4", name: "问题解决", weight: 10 },
];

export function PracticeConfigSheet({
  open,
  onOpenChange,
  onSave,
  initialData,
}: PracticeConfigSheetProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<PracticeConfig>({
    title: "",
    scenarioDescription: "",
    aiRoleId: "",
    aiRoleInfo: "",
    traineeRole: "",
    dialogueGoal: "",
    passScore: 60,
    passAttempts: 3,
    assessmentItems: defaultAssessmentItems,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          scenarioDescription: initialData.scenarioDescription || "",
          aiRoleId: initialData.aiRoleId || "",
          aiRoleInfo: initialData.aiRoleInfo || "",
          traineeRole: initialData.traineeRole || "",
          dialogueGoal: initialData.dialogueGoal || "",
          passScore: initialData.passScore ?? 60,
          passAttempts: initialData.passAttempts ?? 3,
          assessmentItems: initialData.assessmentItems && initialData.assessmentItems.length > 0 
            ? initialData.assessmentItems 
            : defaultAssessmentItems,
        });
      } else {
        setFormData({
          title: "",
          scenarioDescription: "",
          aiRoleId: "",
          aiRoleInfo: "",
          traineeRole: "",
          dialogueGoal: "",
          passScore: 60,
          passAttempts: 3,
          assessmentItems: defaultAssessmentItems,
        });
      }
      setActiveTab("basic");
    }
  }, [initialData, open]);

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
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            练习配置
          </SheetTitle>
          <SheetDescription>
            配置练习计划的角色设定、目标和打分维度
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 px-6">
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-4 gap-2"
            >
              <Target className="h-4 w-4" />
              基本信息
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-4 gap-2"
            >
              <Users className="h-4 w-4" />
              角色设定
            </TabsTrigger>
            <TabsTrigger 
              value="scoring" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-4 gap-2"
            >
              <Award className="h-4 w-4" />
              打分维度
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="basic" className="mt-0 space-y-6">
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
                <Label>场景描述</Label>
                <div className="relative">
                  <Textarea
                    value={formData.scenarioDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, scenarioDescription: e.target.value.slice(0, 500) })
                    }
                    placeholder="描述练习场景的背景、上下文和目标..."
                    rows={4}
                    maxLength={500}
                  />
                  <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                    {formData.scenarioDescription.length} / 500
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>对话目标</Label>
                <p className="text-sm text-muted-foreground">设定练习的具体目标和期望达成的效果</p>
                <div className="relative">
                  <Textarea
                    value={formData.dialogueGoal}
                    onChange={(e) =>
                      setFormData({ ...formData, dialogueGoal: e.target.value.slice(0, 300) })
                    }
                    placeholder="例如：学会倾听客户诉求，提供解决方案，维护客户关系..."
                    rows={3}
                    maxLength={300}
                  />
                  <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                    {formData.dialogueGoal.length} / 300
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="mt-0 space-y-6">
              {/* AI角色设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">AI角色</h4>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span className="text-destructive">*</span>
                    选择AI角色
                  </Label>
                  <Select
                    value={formData.aiRoleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, aiRoleId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择AI扮演的角色" />
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
                  <Label>角色详细信息</Label>
                  <div className="relative">
                    <Textarea
                      value={formData.aiRoleInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, aiRoleInfo: e.target.value.slice(0, 300) })
                      }
                      placeholder="描述AI角色的性格特点、背景信息、行为模式..."
                      rows={3}
                      maxLength={300}
                    />
                    <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                      {formData.aiRoleInfo.length} / 300
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 学员角色设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <h4 className="font-medium">学员角色</h4>
                </div>

                <div className="space-y-2">
                  <Label>学员扮演的角色</Label>
                  <div className="relative">
                    <Textarea
                      value={formData.traineeRole}
                      onChange={(e) =>
                        setFormData({ ...formData, traineeRole: e.target.value.slice(0, 200) })
                      }
                      placeholder="描述学员在场景中扮演的角色及其职责..."
                      rows={3}
                      maxLength={200}
                    />
                    <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                      {formData.traineeRole.length} / 200
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scoring" className="mt-0 space-y-6">
              {/* 通过规则 */}
              <div className="space-y-4">
                <h4 className="font-medium">通过规则</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span className="text-destructive">*</span>
                      通过分数
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
                        placeholder="请输入"
                        className="flex-1"
                        min={0}
                        max={100}
                      />
                      <span className="text-muted-foreground">分</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span className="text-destructive">*</span>
                      最大练习次数
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
                        placeholder="请输入"
                        className="flex-1"
                        min={1}
                      />
                      <span className="text-muted-foreground">次</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 考察维度表格 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">考察维度</h4>
                  <Badge 
                    variant="outline" 
                    className={totalWeight === 100 ? "text-green-600 border-green-300" : "text-destructive border-destructive/30"}
                  >
                    权重合计: {totalWeight}%
                  </Badge>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium text-sm">考察维度</th>
                        <th className="text-left p-3 font-medium text-sm">考察项</th>
                        <th className="text-left p-3 font-medium text-sm">权重</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.assessmentItems.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          {index === 0 && (
                            <td className="p-3 align-top" rowSpan={formData.assessmentItems.length}>
                              <div className="flex items-center gap-2">
                                <span>行为能力</span>
                                <Badge 
                                  variant="outline" 
                                  className={totalWeight === 100 ? "text-green-600 border-green-300" : "text-destructive border-destructive/30"}
                                >
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
                              className="h-9"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
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
                                placeholder="0"
                                className="w-20 h-9"
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
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeAssessmentItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAssessmentItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加考察项
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存配置
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
