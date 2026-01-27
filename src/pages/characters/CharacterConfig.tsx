import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { CharacterEditSheet } from "@/components/characters/CharacterEditSheet";

export interface AICharacter {
  id: string;
  name: string;
  avatarUrl: string;
  personality: string;
  voiceStyle: string;
  systemPrompt: string;
  isActive: boolean;
  usageCount: number;
  updatedAt: string;
}

const mockCharacters: AICharacter[] = [
  {
    id: "1",
    name: "AI面试官陪练员",
    avatarUrl: "",
    personality: "专业、严谨、有耐心",
    voiceStyle: "沉稳男声",
    systemPrompt: "你是一位专业的面试官，负责模拟面试场景...",
    isActive: true,
    usageCount: 256,
    updatedAt: "2025-01-25",
  },
  {
    id: "2",
    name: "客服投诉处理专家",
    avatarUrl: "",
    personality: "情绪化、挑剔、但可以被安抚",
    voiceStyle: "清亮女声",
    systemPrompt: "你是一位对服务不满意的客户...",
    isActive: true,
    usageCount: 189,
    updatedAt: "2025-01-24",
  },
  {
    id: "3",
    name: "企业采购经理",
    avatarUrl: "",
    personality: "理性、注重性价比、决策谨慎",
    voiceStyle: "稳重男声",
    systemPrompt: "你是一位企业采购经理，负责评估供应商...",
    isActive: true,
    usageCount: 145,
    updatedAt: "2025-01-23",
  },
  {
    id: "4",
    name: "新产品体验官",
    avatarUrl: "",
    personality: "好奇、爱提问、有一定专业背景",
    voiceStyle: "活泼女声",
    systemPrompt: "你是一位对新产品感兴趣的潜在客户...",
    isActive: false,
    usageCount: 78,
    updatedAt: "2025-01-20",
  },
];

const voiceStyles = [
  "沉稳男声",
  "稳重男声",
  "清亮女声",
  "活泼女声",
  "磁性男声",
  "温柔女声",
];

export default function CharacterConfig() {
  const [searchQuery, setSearchQuery] = useState("");
  const [characters] = useState(mockCharacters);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AICharacter | null>(null);

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCharacter(null);
    setEditSheetOpen(true);
  };

  const handleEdit = (character: AICharacter) => {
    setEditingCharacter(character);
    setEditSheetOpen(true);
  };

  const handlePreview = (character: AICharacter) => {
    toast.info(`预览角色：${character.name}`);
  };

  const handleDelete = (character: AICharacter) => {
    toast.success(`已删除角色：${character.name}`);
  };

  // Stats
  const totalCharacters = characters.length;
  const activeCharacters = characters.filter((c) => c.isActive).length;
  const totalUsage = characters.reduce((sum, c) => sum + c.usageCount, 0);

  return (
    <DashboardLayout title="角色配置" description="管理AI对话角色">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalCharacters}</div>
              <p className="text-sm text-muted-foreground">全部角色</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{activeCharacters}</div>
              <p className="text-sm text-muted-foreground">已启用</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalUsage}</div>
              <p className="text-sm text-muted-foreground">总使用次数</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索角色名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建AI角色
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>性格特点</TableHead>
                  <TableHead>语音风格</TableHead>
                  <TableHead className="text-center">状态</TableHead>
                  <TableHead className="text-center">使用次数</TableHead>
                  <TableHead className="text-center">更新时间</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharacters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={character.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {character.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{character.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {character.personality}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{character.voiceStyle}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={character.isActive ? "default" : "secondary"}
                      >
                        {character.isActive ? "启用" : "停用"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{character.usageCount}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {character.updatedAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-primary"
                          onClick={() => handlePreview(character)}
                        >
                          预览
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-primary"
                          onClick={() => handleEdit(character)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-destructive"
                          onClick={() => handleDelete(character)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CharacterEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        character={editingCharacter}
        voiceStyles={voiceStyles}
      />
    </DashboardLayout>
  );
}
