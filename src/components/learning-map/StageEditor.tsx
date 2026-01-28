import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  GripVertical,
  BookOpen,
  MessageSquare,
  FileCheck,
  ChevronRight,
  X,
  Target,
  CheckCircle2,
  Tag,
  ListTodo,
  FileText,
} from "lucide-react";
import type { Stage, BehaviorTagBinding, TaskTagBinding, ContentItem } from "@/pages/learning-map/LearningMapLibrary";

interface StageEditorProps {
  stages: Stage[];
  selectedStage: Stage | null;
  onSelectStage: (stage: Stage | null) => void;
  onStagesChange: (stages: Stage[]) => void;
  isReadOnly: boolean;
}

const levelOptions = ["L1", "L2", "L3", "L4"] as const;

export function StageEditor({
  stages,
  selectedStage,
  onSelectStage,
  onStagesChange,
  isReadOnly,
}: StageEditorProps) {
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const handleStageClick = (stage: Stage) => {
    onSelectStage(stage);
    setEditingStage({ ...stage });
  };

  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: `L${stages.length} 新阶段`,
      level: `L${stages.length}`,
      objective: "",
      entryCondition: stages.length > 0 ? `完成${stages[stages.length - 1].name}` : "入职培训完成",
      completionCriteria: "",
      behaviorTags: [],
      taskTags: [],
      learnItems: [],
      practiceItems: [],
      assessItems: [],
      evidenceRequirements: [],
    };
    onStagesChange([...stages, newStage]);
  };

  const handleSaveStage = () => {
    if (!editingStage) return;
    const updatedStages = stages.map((s) =>
      s.id === editingStage.id ? editingStage : s
    );
    onStagesChange(updatedStages);
    onSelectStage(editingStage);
  };

  const handleRemoveStage = (stageId: string) => {
    onStagesChange(stages.filter((s) => s.id !== stageId));
    if (selectedStage?.id === stageId) {
      onSelectStage(null);
      setEditingStage(null);
    }
  };

  const handleBehaviorTagLevelChange = (tagId: string, level: "L1" | "L2" | "L3" | "L4") => {
    if (!editingStage) return;
    setEditingStage({
      ...editingStage,
      behaviorTags: editingStage.behaviorTags.map((t) =>
        t.id === tagId ? { ...t, targetLevel: level } : t
      ),
    });
  };

  const handleRemoveBehaviorTag = (tagId: string) => {
    if (!editingStage) return;
    setEditingStage({
      ...editingStage,
      behaviorTags: editingStage.behaviorTags.filter((t) => t.id !== tagId),
    });
  };

  const handleRemoveTaskTag = (tagId: string) => {
    if (!editingStage) return;
    setEditingStage({
      ...editingStage,
      taskTags: editingStage.taskTags.filter((t) => t.id !== tagId),
    });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-4 w-4" />;
      case "practice":
        return <MessageSquare className="h-4 w-4" />;
      case "exam":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          暂无学习阶段
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          添加学习阶段来构建完整的学习路径，每个阶段可包含学习、练习、评测内容
        </p>
        {!isReadOnly && (
          <Button onClick={handleAddStage}>
            <Plus className="h-4 w-4 mr-1" />
            添加阶段
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[600px]">
      {/* Stage Timeline */}
      <div className="w-80 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">学习阶段</h3>
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={handleAddStage}>
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          )}
        </div>

        <ScrollArea className="h-[550px] pr-4">
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <Card
                key={stage.id}
                className={`cursor-pointer transition-all ${
                  selectedStage?.id === stage.id
                    ? "ring-2 ring-primary"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleStageClick(stage)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {!isReadOnly && (
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      )}
                      <Badge variant="outline" className="font-mono">
                        {stage.level}
                      </Badge>
                      <CardTitle className="text-sm font-medium">
                        {stage.name}
                      </CardTitle>
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 -mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStage(stage.id);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {stage.objective || "暂无阶段目标"}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span>{stage.learnItems.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-green-500" />
                      <span>{stage.practiceItems.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCheck className="h-3 w-3 text-amber-500" />
                      <span>{stage.assessItems.length}</span>
                    </div>
                  </div>
                  {stage.behaviorTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stage.behaviorTags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tag.name} → {tag.targetLevel}
                        </Badge>
                      ))}
                      {stage.behaviorTags.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          +{stage.behaviorTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Stage Detail Panel */}
      <div className="flex-1 min-w-0">
        {selectedStage && editingStage ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  阶段配置
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>阶段名称</Label>
                    <Input
                      value={editingStage.name}
                      onChange={(e) =>
                        setEditingStage({ ...editingStage, name: e.target.value })
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>阶段等级</Label>
                    <Select
                      value={editingStage.level}
                      onValueChange={(v) =>
                        setEditingStage({ ...editingStage, level: v })
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L0">L0 入门</SelectItem>
                        <SelectItem value="L1">L1 进阶</SelectItem>
                        <SelectItem value="L2">L2 胜任</SelectItem>
                        <SelectItem value="L3">L3 专家</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>阶段目标</Label>
                  <Textarea
                    value={editingStage.objective}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        objective: e.target.value,
                      })
                    }
                    placeholder="一句话描述该阶段的学习目标"
                    rows={2}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>入阶段条件</Label>
                    <Input
                      value={editingStage.entryCondition}
                      onChange={(e) =>
                        setEditingStage({
                          ...editingStage,
                          entryCondition: e.target.value,
                        })
                      }
                      placeholder="例如：完成上一阶段"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>完成标准</Label>
                    <Input
                      value={editingStage.completionCriteria}
                      onChange={(e) =>
                        setEditingStage({
                          ...editingStage,
                          completionCriteria: e.target.value,
                        })
                      }
                      placeholder="例如：完成率100%，评测分≥80"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Behavior Tags */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  绑定能力（行为标签）
                  {editingStage.behaviorTags.length === 0 && (
                    <Badge variant="destructive" className="text-[10px] ml-2">
                      至少绑定1个
                    </Badge>
                  )}
                </h3>
                <div className="space-y-2">
                  {editingStage.behaviorTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <Badge variant="outline">{tag.name}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={tag.targetLevel}
                        onValueChange={(v) =>
                          handleBehaviorTagLevelChange(
                            tag.id,
                            v as "L1" | "L2" | "L3" | "L4"
                          )
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground flex-1">
                        目标等级
                      </span>
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveBehaviorTag(tag.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      添加行为标签
                    </Button>
                  )}
                </div>
              </div>

              {/* Task Tags */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  绑定任务（专业任务标签）
                </h3>
                <div className="flex flex-wrap gap-2">
                  {editingStage.taskTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      {!isReadOnly && (
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveTaskTag(tag.id)}
                        />
                      )}
                    </Badge>
                  ))}
                  {!isReadOnly && (
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      添加
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Content Items */}
              <div className="grid grid-cols-3 gap-4">
                {/* Learn Items */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    学习内容
                  </h4>
                  <div className="space-y-2">
                    {editingStage.learnItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 border rounded-md text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {getContentIcon(item.type)}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{item.duration}分钟</span>
                          <Badge
                            variant={item.required ? "default" : "secondary"}
                            className="text-[10px] px-1"
                          >
                            {item.required ? "必修" : "选修"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {editingStage.learnItems.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">
                        暂无学习内容
                      </p>
                    )}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        添加课程
                      </Button>
                    )}
                  </div>
                </div>

                {/* Practice Items */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    练习内容
                  </h4>
                  <div className="space-y-2">
                    {editingStage.practiceItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 border rounded-md text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {getContentIcon(item.type)}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{item.duration}分钟</span>
                          <Badge
                            variant={item.required ? "default" : "secondary"}
                            className="text-[10px] px-1"
                          >
                            {item.required ? "必修" : "选修"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {editingStage.practiceItems.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">
                        暂无练习内容
                      </p>
                    )}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        添加陪练
                      </Button>
                    )}
                  </div>
                </div>

                {/* Assess Items */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-amber-500" />
                    评测内容
                  </h4>
                  <div className="space-y-2">
                    {editingStage.assessItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 border rounded-md text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {getContentIcon(item.type)}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{item.duration}分钟</span>
                          <Badge
                            variant={item.required ? "default" : "secondary"}
                            className="text-[10px] px-1"
                          >
                            {item.required ? "必修" : "选修"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {editingStage.assessItems.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">
                        暂无评测内容
                      </p>
                    )}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        添加评测
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Evidence Requirements */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  输出证据要求
                </h3>
                <div className="space-y-2">
                  {editingStage.evidenceRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-md text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{req}</span>
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {editingStage.evidenceRequirements.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                      暂无证据要求
                    </p>
                  )}
                  {!isReadOnly && (
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      添加证据要求
                    </Button>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {!isReadOnly && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveStage}>保存阶段配置</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <ChevronRight className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">选择左侧阶段查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
