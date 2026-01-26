import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, ClipboardCheck, Upload } from "lucide-react";
import type { ContentItem } from "./GeneratedPlanEditor";

interface ContentConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem | null;
  onSave: (item: ContentItem) => void;
}

const mockAIRoles = [
  { id: "1", name: "愤怒的客户" },
  { id: "2", name: "咨询客户" },
  { id: "3", name: "企业采购" },
  { id: "4", name: "VIP客户" },
];

const mockKnowledgeBase = [
  { id: "1", name: "销售技巧培训手册.pdf" },
  { id: "2", name: "产品介绍视频合集" },
  { id: "3", name: "客户沟通案例库" },
];

export function ContentConfigSheet({
  open,
  onOpenChange,
  item,
  onSave,
}: ContentConfigSheetProps) {
  const [formData, setFormData] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        config: item.config || {},
      });
    }
  }, [item]);

  if (!formData) return null;

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const updateConfig = (key: string, value: unknown) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            config: { ...prev.config, [key]: value },
          }
        : null
    );
  };

  const typeLabels = {
    lesson: { label: "学习内容", icon: BookOpen, color: "text-primary" },
    practice: { label: "练习", icon: MessageSquare, color: "text-secondary-foreground" },
    assessment: { label: "考核", icon: ClipboardCheck, color: "text-accent-foreground" },
  };

  const TypeIcon = typeLabels[formData.type].icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
              <TypeIcon className={`h-4 w-4 ${typeLabels[formData.type].color}`} />
            </div>
            <div>
              <SheetTitle>{formData.title}</SheetTitle>
              <SheetDescription>
                配置{typeLabels[formData.type].label}详细信息
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Common Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标题</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="输入内容描述..."
                rows={3}
              />
            </div>
          </div>

          {/* Type-specific Fields */}
          {formData.type === "lesson" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">学习内容配置</h4>

              <div className="space-y-2">
                <Label>内容类型</Label>
                <Select
                  value={formData.contentType || "video"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contentType: value as ContentItem["contentType"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">视频</SelectItem>
                    <SelectItem value="pdf">PDF文档</SelectItem>
                    <SelectItem value="article">图文内容</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>预计时长（分钟）</Label>
                <Input
                  type="number"
                  value={(formData.config?.duration as number) || 30}
                  onChange={(e) => updateConfig("duration", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>关联知识库内容</Label>
                <Select
                  value={(formData.config?.knowledgeBaseId as string) || ""}
                  onValueChange={(value) => updateConfig("knowledgeBaseId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择知识库内容" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockKnowledgeBase.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>或上传新内容</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    点击或拖拽文件到此处上传
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 MP4、PDF、PNG、JPG 格式
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.type === "practice" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">练习配置</h4>

              <div className="space-y-2">
                <Label>练习类型</Label>
                <Select
                  value={formData.contentType || "ai_dialogue"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contentType: value as ContentItem["contentType"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_dialogue">AI对练</SelectItem>
                    <SelectItem value="scenario">情景模拟</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>关联AI角色</Label>
                <Select
                  value={(formData.config?.aiRoleId as string) || ""}
                  onValueChange={(value) => updateConfig("aiRoleId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择AI角色" />
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
                <Label>场景目标</Label>
                <Textarea
                  value={(formData.config?.scenarioGoal as string) || ""}
                  onChange={(e) => updateConfig("scenarioGoal", e.target.value)}
                  placeholder="描述练习的场景目标和期望达成的效果..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>难度等级</Label>
                <Select
                  value={(formData.config?.difficulty as string) || "medium"}
                  onValueChange={(value) => updateConfig("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">初级</SelectItem>
                    <SelectItem value="medium">中级</SelectItem>
                    <SelectItem value="hard">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>通过标准（分数）</Label>
                <Input
                  type="number"
                  value={(formData.config?.passScore as number) || 60}
                  onChange={(e) => updateConfig("passScore", parseInt(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          )}

          {formData.type === "assessment" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">考核配置</h4>

              <div className="space-y-2">
                <Label>考试形式</Label>
                <Select
                  value={formData.contentType || "quiz"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contentType: value as ContentItem["contentType"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">理论问卷</SelectItem>
                    <SelectItem value="scenario">情景模拟</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>题目数量</Label>
                <Input
                  type="number"
                  value={(formData.config?.questionCount as number) || 10}
                  onChange={(e) => updateConfig("questionCount", parseInt(e.target.value))}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label>合格分数</Label>
                <Input
                  type="number"
                  value={(formData.config?.passScore as number) || 60}
                  onChange={(e) => updateConfig("passScore", parseInt(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label>考试时长（分钟）</Label>
                <Input
                  type="number"
                  value={(formData.config?.timeLimit as number) || 30}
                  onChange={(e) => updateConfig("timeLimit", parseInt(e.target.value))}
                  min={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>允许重考</Label>
                  <p className="text-xs text-muted-foreground">
                    学员不合格时是否允许重新考试
                  </p>
                </div>
                <Switch
                  checked={(formData.config?.allowRetry as boolean) ?? true}
                  onCheckedChange={(checked) => updateConfig("allowRetry", checked)}
                />
              </div>

              {formData.config?.allowRetry && (
                <div className="space-y-2">
                  <Label>最大重考次数</Label>
                  <Input
                    type="number"
                    value={(formData.config?.maxRetries as number) || 3}
                    onChange={(e) => updateConfig("maxRetries", parseInt(e.target.value))}
                    min={1}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存配置</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
