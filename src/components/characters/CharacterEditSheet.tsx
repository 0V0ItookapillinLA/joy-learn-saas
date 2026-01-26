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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Check } from "lucide-react";
import type { AICharacter } from "@/pages/characters/CharacterConfig";

interface CharacterEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: AICharacter | null;
  voiceStyles: string[];
}

const mockAvatars = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

const mockAgents = [
  { id: "1", name: "MAX", description: "我是Max" },
  { id: "2", name: "小助手", description: "智能客服助手" },
];

export function CharacterEditSheet({
  open,
  onOpenChange,
  character,
  voiceStyles,
}: CharacterEditSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    personality: "",
    voiceStyle: "",
    systemPrompt: "",
    avatarUrl: "",
    selectedAgentId: "",
  });

  const [selectedAvatar, setSelectedAvatar] = useState(0);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        personality: character.personality,
        voiceStyle: character.voiceStyle,
        systemPrompt: character.systemPrompt,
        avatarUrl: character.avatarUrl,
        selectedAgentId: "",
      });
    } else {
      setFormData({
        name: "",
        personality: "",
        voiceStyle: "",
        systemPrompt: "",
        avatarUrl: "",
        selectedAgentId: "",
      });
    }
  }, [character]);

  const handleSave = () => {
    if (!formData.name) {
      toast.error("请输入角色名称");
      return;
    }
    toast.success(character ? "角色已更新" : "角色已创建");
    onOpenChange(false);
  };

  const isEditing = !!character;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={formData.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {formData.name?.slice(0, 2) || "AI"}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{isEditing ? formData.name : "新建AI角色"}</SheetTitle>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  数据保存于 2025-01-25 17:40:45
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="config" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">配置</TabsTrigger>
            <TabsTrigger value="preview">预览与调试</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6 mt-4">
            {/* Agent Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">员工技能</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>▼</span>
                  <span>智能体</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {mockAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.description}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  请添加智能体
                </Button>
              </div>
            </div>

            {/* Digital Avatar */}
            <div className="space-y-3">
              <Label className="text-base font-medium">数字形象</Label>
              <div className="grid grid-cols-6 gap-3">
                {mockAvatars.map((avatar, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                      selectedAvatar === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-primary/30"
                    )}
                    onClick={() => setSelectedAvatar(index)}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar === index && (
                      <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                我的形象（添加时请上传5s左右的mp4格式视频，人物稳定居中避免大幅运动）
              </p>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                点击添加数字形象
              </Button>
            </div>

            {/* Voice Style */}
            <div className="space-y-3">
              <Label className="text-base font-medium">语言风格</Label>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">风格</div>
                <div className="flex flex-wrap gap-2">
                  {voiceStyles.map((style) => (
                    <Badge
                      key={style}
                      variant={formData.voiceStyle === style ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-4 py-2",
                        formData.voiceStyle === style && "bg-primary text-primary-foreground"
                      )}
                      onClick={() =>
                        setFormData({ ...formData, voiceStyle: style })
                      }
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Friendly Reminder */}
            <div className="space-y-3">
              <Label className="text-base font-medium">友情提示</Label>
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4 text-sm space-y-2">
                  <p>1. 请引导用户，禁止输入违法信息、个人信息及其他敏感数据。</p>
                  <p>2. 对于大模型输出内容，如需展示给C端，请经过脱敏审核后，再行展示。</p>
                  <p className="text-destructive font-medium">
                    特别提醒：输入如包含公司核心算法代码、内部高层领导等讲话、大促活动安排、财务和战略信息等高级别商业秘密，严禁使用外部大模型（京东集团言屋大模型）。可参考《京东集团商业秘密管理办法》
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={formData.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {formData.name?.slice(0, 2) || "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">{formData.name || "AI角色"}</h3>
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                    外布需找如何帮帮你？在运用变找边门AI搜索来获取相关大信息！
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                    <span>✓ 12.9s</span>
                    <span>|</span>
                    <span>266 tokens</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="请输入内容"
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost">
                      😊
                    </Button>
                    <Button size="icon">
                      ▶
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
