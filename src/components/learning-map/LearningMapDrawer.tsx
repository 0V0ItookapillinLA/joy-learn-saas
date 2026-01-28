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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save,
  Send,
  Ban,
  GitBranch,
  History,
  Download,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  BookOpen,
  MessageSquare,
  FileCheck,
  Plus,
  GripVertical,
  ChevronRight,
  X,
} from "lucide-react";
import type { LearningMap, Stage } from "@/pages/learning-map/LearningMapLibrary";
import { StageEditor } from "./StageEditor";

interface Position {
  id: string;
  name: string;
}

interface LearningMapDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  map: LearningMap | null;
  mode: "view" | "edit" | "create";
  positions: Position[];
  onSave: (data: Partial<LearningMap>) => void;
  onPublish: (map: LearningMap) => void;
  onDisable: (map: LearningMap) => void;
  onCreateVersion: (map: LearningMap) => void;
}

const defaultStages: Stage[] = [
  {
    id: "stage-1",
    name: "L0 入门",
    level: "L0",
    objective: "掌握基础知识和流程",
    entryCondition: "入职培训完成",
    completionCriteria: "完成率100%，评测分≥80",
    behaviorTags: [
      { id: "bt-1", name: "清晰表达产品价值", targetLevel: "L1" },
      { id: "bt-2", name: "基础客户沟通", targetLevel: "L1" },
    ],
    taskTags: [
      { id: "tt-1", name: "客户首次拜访" },
      { id: "tt-2", name: "产品介绍" },
    ],
    learnItems: [
      { id: "l1", name: "产品知识入门", type: "course", duration: 60, required: true },
      { id: "l2", name: "销售流程概述", type: "course", duration: 30, required: true },
    ],
    practiceItems: [
      { id: "p1", name: "客户首次沟通场景", type: "practice", duration: 15, required: true },
    ],
    assessItems: [
      { id: "a1", name: "产品知识测评", type: "exam", duration: 30, required: true },
    ],
    evidenceRequirements: ["需上传学习笔记", "需完成产品知识测评"],
  },
  {
    id: "stage-2",
    name: "L1 进阶",
    level: "L1",
    objective: "独立完成标准销售流程",
    entryCondition: "完成L0阶段",
    completionCriteria: "完成率100%，评测分≥85，关键行为标签达到L2",
    behaviorTags: [
      { id: "bt-1", name: "清晰表达产品价值", targetLevel: "L2" },
      { id: "bt-3", name: "需求挖掘", targetLevel: "L2" },
    ],
    taskTags: [
      { id: "tt-3", name: "需求分析" },
      { id: "tt-4", name: "方案制作" },
    ],
    learnItems: [
      { id: "l3", name: "客户需求分析方法", type: "course", duration: 90, required: true },
    ],
    practiceItems: [
      { id: "p2", name: "需求挖掘对话场景", type: "practice", duration: 20, required: true },
    ],
    assessItems: [
      { id: "a2", name: "销售技能综合测评", type: "exam", duration: 45, required: true },
    ],
    evidenceRequirements: ["需上传客户需求分析报告", "需经理点评"],
  },
  {
    id: "stage-3",
    name: "L2 胜任",
    level: "L2",
    objective: "能够处理复杂销售场景",
    entryCondition: "完成L1阶段，通过综合评测",
    completionCriteria: "完成率100%，评测分≥90，关键行为标签达到L3",
    behaviorTags: [
      { id: "bt-1", name: "清晰表达产品价值", targetLevel: "L3" },
      { id: "bt-4", name: "异议处理", targetLevel: "L3" },
    ],
    taskTags: [
      { id: "tt-5", name: "复杂谈判" },
      { id: "tt-6", name: "大客户管理" },
    ],
    learnItems: [
      { id: "l4", name: "高级谈判技巧", type: "course", duration: 120, required: true },
    ],
    practiceItems: [
      { id: "p3", name: "价格异议处理场景", type: "practice", duration: 25, required: true },
    ],
    assessItems: [
      { id: "a3", name: "实战案例分析", type: "exam", duration: 60, required: true },
    ],
    evidenceRequirements: ["需上传复盘报告", "需截取对话证据", "需经理点评"],
  },
  {
    id: "stage-4",
    name: "L3 专家",
    level: "L3",
    objective: "能够指导他人，处理疑难问题",
    entryCondition: "完成L2阶段，经理确认",
    completionCriteria: "完成率100%，评测分≥95，关键行为标签达到L4",
    behaviorTags: [
      { id: "bt-1", name: "清晰表达产品价值", targetLevel: "L4" },
      { id: "bt-5", name: "团队辅导", targetLevel: "L4" },
    ],
    taskTags: [
      { id: "tt-7", name: "新人带教" },
      { id: "tt-8", name: "疑难问题处理" },
    ],
    learnItems: [
      { id: "l5", name: "销售教练技术", type: "course", duration: 90, required: true },
    ],
    practiceItems: [
      { id: "p4", name: "辅导反馈场景", type: "practice", duration: 30, required: false },
    ],
    assessItems: [
      { id: "a4", name: "带教能力评估", type: "exam", duration: 45, required: true },
    ],
    evidenceRequirements: ["需上传带教记录", "需被辅导人反馈"],
  },
];

const audienceOptions = ["新员工", "在岗", "晋升"];

export function LearningMapDrawer({
  open,
  onOpenChange,
  map,
  mode,
  positions,
  onSave,
  onPublish,
  onDisable,
  onCreateVersion,
}: LearningMapDrawerProps) {
  const [formData, setFormData] = useState<Partial<LearningMap>>({
    name: "",
    position: "",
    positionId: "",
    description: "",
    targetAudience: [],
    stages: defaultStages,
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (map) {
      setFormData({
        name: map.name,
        position: map.position,
        positionId: map.positionId,
        description: map.description || "",
        targetAudience: map.targetAudience,
        stages: map.stages || defaultStages,
      });
    } else {
      setFormData({
        name: "",
        position: "",
        positionId: "",
        description: "",
        targetAudience: [],
        stages: defaultStages,
      });
    }
    setSelectedStage(null);
    setValidationErrors([]);
  }, [map, open]);

  const isReadOnly = mode === "view" || (map?.status === "published" && mode !== "create");

  const validateMap = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name?.trim()) {
      errors.push("请填写地图名称");
    }
    if (!formData.positionId) {
      errors.push("请选择岗位");
    }
    if (!formData.stages || formData.stages.length === 0) {
      errors.push("至少需要包含1个学习阶段");
    }
    
    formData.stages?.forEach((stage, index) => {
      const hasContent = 
        stage.learnItems.length > 0 || 
        stage.practiceItems.length > 0 || 
        stage.assessItems.length > 0;
      
      if (!hasContent) {
        errors.push(`阶段"${stage.name}"至少需要配置1个学习/练习/评测内容`);
      }
      
      if (stage.behaviorTags.length === 0) {
        errors.push(`阶段"${stage.name}"至少需要绑定1个行为标签`);
      }
    });
    
    return errors;
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handlePublish = () => {
    const errors = validateMap();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    if (map) {
      onPublish(map);
      onOpenChange(false);
    }
  };

  const handlePositionChange = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId);
    setFormData({
      ...formData,
      positionId,
      position: position?.name || "",
    });
  };

  const handleAudienceToggle = (audience: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience?.includes(audience)
        ? prev.targetAudience.filter((a) => a !== audience)
        : [...(prev.targetAudience || []), audience],
    }));
  };

  const getStatusBadge = () => {
    if (!map) return null;
    switch (map.status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-0">
            已发布
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">草稿</Badge>;
      case "disabled":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            已停用
          </Badge>
        );
    }
  };

  const renderActions = () => {
    if (mode === "create") {
      return (
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            保存草稿
          </Button>
        </>
      );
    }

    if (map?.status === "draft") {
      return (
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="outline" onClick={() => map && onDisable(map)}>
            <Ban className="h-4 w-4 mr-1" />
            停用
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            保存
          </Button>
          <Button onClick={handlePublish}>
            <Send className="h-4 w-4 mr-1" />
            发布
          </Button>
        </>
      );
    }

    if (map?.status === "published") {
      return (
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button variant="outline">
            <History className="h-4 w-4 mr-1" />
            版本记录
          </Button>
          <Button variant="outline" onClick={() => map && onDisable(map)}>
            <Ban className="h-4 w-4 mr-1" />
            停用
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button onClick={() => map && onCreateVersion(map)}>
            <GitBranch className="h-4 w-4 mr-1" />
            创建新版本
          </Button>
        </>
      );
    }

    if (map?.status === "disabled") {
      return (
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button variant="outline">
            <History className="h-4 w-4 mr-1" />
            版本记录
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-lg">
                {mode === "create"
                  ? "新建学习地图"
                  : mode === "edit"
                  ? "编辑学习地图"
                  : "查看学习地图"}
              </SheetTitle>
              {getStatusBadge()}
              {map && (
                <span className="text-sm text-muted-foreground">
                  {map.version}
                </span>
              )}
            </div>
          </div>
          {map && (
            <p className="text-sm text-muted-foreground mt-1">
              最近更新：{map.updatedBy} · {map.updatedAt}
            </p>
          )}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="px-6 pt-2 justify-start bg-transparent border-b border-border rounded-none h-auto pb-0">
            <TabsTrigger
              value="basic"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3"
            >
              基本信息
            </TabsTrigger>
            <TabsTrigger
              value="stages"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3"
            >
              学习阶段
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3"
            >
              数据回流
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="basic" className="p-6 m-0">
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive mb-2">
                        发布前请完成以下校验
                      </p>
                      <ul className="text-sm text-destructive space-y-1">
                        {validationErrors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      地图名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="输入地图名称"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">
                      岗位 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.positionId}
                      onValueChange={handlePositionChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择岗位" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>适用人群</Label>
                  <div className="flex items-center gap-4">
                    {audienceOptions.map((audience) => (
                      <div key={audience} className="flex items-center gap-2">
                        <Checkbox
                          id={`audience-${audience}`}
                          checked={formData.targetAudience?.includes(audience)}
                          onCheckedChange={() => handleAudienceToggle(audience)}
                          disabled={isReadOnly}
                        />
                        <Label
                          htmlFor={`audience-${audience}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {audience}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">说明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="描述该学习地图的目标和适用场景"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-3">地图概览</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-primary">
                          {formData.stages?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          学习阶段
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-primary">
                          {formData.stages?.reduce(
                            (acc, s) => acc + s.behaviorTags.length,
                            0
                          ) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          行为标签
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-primary">
                          {formData.stages?.reduce(
                            (acc, s) => acc + s.taskTags.length,
                            0
                          ) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          任务标签
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-primary">
                          {formData.stages?.reduce(
                            (acc, s) =>
                              acc +
                              s.learnItems.length +
                              s.practiceItems.length +
                              s.assessItems.length,
                            0
                          ) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          内容项
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stages" className="p-6 m-0">
              <StageEditor
                stages={formData.stages || []}
                selectedStage={selectedStage}
                onSelectStage={setSelectedStage}
                onStagesChange={(stages) =>
                  setFormData({ ...formData, stages })
                }
                isReadOnly={isReadOnly}
              />
            </TabsContent>

            <TabsContent value="data" className="p-6 m-0">
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        覆盖人数
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">128</div>
                      <p className="text-xs text-muted-foreground">
                        已分配学员
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        完成率
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        72%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        92人已完成
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        平均用时
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">14.5</div>
                      <p className="text-xs text-muted-foreground">天</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        能力提升
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        +1.8
                      </div>
                      <p className="text-xs text-muted-foreground">
                        平均等级提升
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      高频卡点 TOP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">L1 进阶</Badge>
                          <span className="text-sm">需求挖掘对话场景</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          23人卡点
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">L2 胜任</Badge>
                          <span className="text-sm">价格异议处理场景</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          18人卡点
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">L1 进阶</Badge>
                          <span className="text-sm">销售技能综合测评</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          15人卡点
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      陪练效果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          85%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          场景通过率
                        </p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-amber-600">
                          12
                        </div>
                        <p className="text-xs text-muted-foreground">
                          常见负向信号
                        </p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-primary">
                          78%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          证据命中率
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 flex-shrink-0">
          {renderActions()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
