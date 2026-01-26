import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MessageSquare, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreatePracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PracticeMode = "free_dialogue" | "scripted";

const mockAIRoles = [
  { id: "1", name: "愤怒的客户" },
  { id: "2", name: "咨询客户" },
  { id: "3", name: "企业采购" },
  { id: "4", name: "VIP客户" },
  { id: "5", name: "潜在客户" },
];

export function CreatePracticeDialog({ open, onOpenChange }: CreatePracticeDialogProps) {
  const [mode, setMode] = useState<PracticeMode>("free_dialogue");
  const [formData, setFormData] = useState({
    title: "",
    scenarioDescription: "",
    userRole: "",
    aiRoleDescription: "",
    aiRoleId: "",
    dialogueGoal: "",
    scriptContent: "",
  });

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error("请输入练习标题");
      return;
    }
    toast.success("练习计划创建成功");
    onOpenChange(false);
    // Reset form
    setFormData({
      title: "",
      scenarioDescription: "",
      userRole: "",
      aiRoleDescription: "",
      aiRoleId: "",
      dialogueGoal: "",
      scriptContent: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建练习计划</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Practice Mode Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                mode === "free_dialogue" && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setMode("free_dialogue")}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">自由对话</span>
                      {mode === "free_dialogue" && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      本期支持，可点击进行下一步
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-not-allowed opacity-60",
                mode === "scripted" && "border-primary ring-2 ring-primary/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">固定剧本</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      敬请期待
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Script Creation Section */}
          <div className="space-y-4">
            <h3 className="font-medium">创建副本</h3>

            {/* Scenario and Role Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="text-lg">📝</span>
                    <span className="font-medium">练习场景描述</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>请详细描述练习场景，包括：</p>
                    <p className="text-primary">具体的业务场景（如客户投诉处理、产品介绍、销售谈判等）</p>
                    <p className="text-primary">场景的背景和上下文</p>
                    <p className="text-primary">可能遇到的情况和挑战</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent bg-accent/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-accent-foreground mb-2">
                    <span className="text-lg">👥</span>
                    <span className="font-medium">人物角色设定</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>请明确参与角色，包括：</p>
                    <p className="text-accent-foreground">学员扮演的角色及其职责</p>
                    <p className="text-accent-foreground">AI扮演的角色及其特点</p>
                  </div>
                </CardContent>
              </Card>
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

            {/* Script Content */}
            <div className="space-y-2">
              <Label>创建剧本</Label>
              <p className="text-sm text-muted-foreground">
                请在此处详细描述您的练习需求，包括场景、角色和目标。您可以参考上方的引导内容，或者直接开始输入
              </p>
              <Textarea
                value={formData.scriptContent}
                onChange={(e) =>
                  setFormData({ ...formData, scriptContent: e.target.value })
                }
                placeholder="请输入"
                rows={6}
              />
            </div>

            {/* Practice Title */}
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

            {/* Dialogue Goal */}
            <div className="space-y-2">
              <Label>对话目标（训练点）</Label>
              <Textarea
                value={formData.dialogueGoal}
                onChange={(e) =>
                  setFormData({ ...formData, dialogueGoal: e.target.value })
                }
                placeholder="请输入对话目标和训练重点"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              创建练习计划
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
