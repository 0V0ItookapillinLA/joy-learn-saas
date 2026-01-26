import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MessageSquare,
  Bot,
  Clock,
  Target,
  Users,
  Play,
  Settings,
} from "lucide-react";

// Mock practice sessions
const mockPractices = [
  {
    id: "1",
    title: "客户投诉处理场景",
    description: "模拟处理客户投诉的对话场景",
    mode: "free_dialogue",
    aiRole: "愤怒的客户",
    traineeRole: "客服专员",
    maxAttempts: 3,
    timeLimit: 15,
    completedCount: 45,
    avgScore: 82,
  },
  {
    id: "2",
    title: "产品推荐场景",
    description: "向客户推荐适合的产品方案",
    mode: "free_dialogue",
    aiRole: "咨询客户",
    traineeRole: "销售顾问",
    maxAttempts: 5,
    timeLimit: 20,
    completedCount: 32,
    avgScore: 78,
  },
  {
    id: "3",
    title: "价格谈判场景",
    description: "与客户进行价格谈判的模拟对话",
    mode: "scripted",
    aiRole: "企业采购",
    traineeRole: "商务经理",
    maxAttempts: 3,
    timeLimit: 25,
    completedCount: 28,
    avgScore: 85,
  },
];

export default function PracticeManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <DashboardLayout title="练习管理" description="配置AI对话练习场景">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索练习场景..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建练习场景
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建练习场景</DialogTitle>
                <DialogDescription>
                  配置AI对话练习的场景设置和评分标准
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">场景名称</Label>
                  <Input id="title" placeholder="例如：客户投诉处理" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">场景描述</Label>
                  <Textarea
                    id="description"
                    placeholder="描述这个练习场景的背景和目标..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mode">练习模式</Label>
                    <Select defaultValue="free_dialogue">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free_dialogue">自由对话</SelectItem>
                        <SelectItem value="scripted">固定剧本</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ai-character">AI角色</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择AI角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">普通客户</SelectItem>
                        <SelectItem value="angry-customer">愤怒的客户</SelectItem>
                        <SelectItem value="vip-customer">VIP客户</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="trainee-role">学员角色</Label>
                    <Input id="trainee-role" placeholder="例如：客服专员" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time-limit">时间限制（分钟）</Label>
                    <Input id="time-limit" type="number" defaultValue={15} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scenario">场景设定</Label>
                  <Textarea
                    id="scenario"
                    placeholder="详细描述对话场景的背景设定..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  创建场景
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">15</div>
              <p className="text-sm text-muted-foreground">练习场景</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">1,234</div>
              <p className="text-sm text-muted-foreground">总练习次数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">81.5</div>
              <p className="text-sm text-muted-foreground">平均得分</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">12分</div>
              <p className="text-sm text-muted-foreground">平均时长</p>
            </CardContent>
          </Card>
        </div>

        {/* Practice Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockPractices.map((practice) => (
            <Card key={practice.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant={practice.mode === "free_dialogue" ? "default" : "secondary"}>
                    {practice.mode === "free_dialogue" ? "自由对话" : "固定剧本"}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-lg">{practice.title}</CardTitle>
                <CardDescription>{practice.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">AI:</span>
                      <span>{practice.aiRole}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">学员:</span>
                      <span>{practice.traineeRole}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {practice.timeLimit}分钟
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {practice.maxAttempts}次机会
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">完成:</span>{" "}
                      <span className="font-medium">{practice.completedCount}次</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">均分:</span>{" "}
                      <span className="font-medium text-success">{practice.avgScore}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    配置
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    预览
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
