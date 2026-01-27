import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Loader2 } from "lucide-react";
import { CharacterEditSheet } from "@/components/characters/CharacterEditSheet";
import { useAICharacters, useCreateAICharacter, useUpdateAICharacter, useDeleteAICharacter } from "@/hooks/useAICharacters";
import type { Database } from "@/integrations/supabase/types";

type AICharacterRow = Database['public']['Tables']['ai_characters']['Row'];

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
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AICharacterRow | null>(null);

  const { data: characters = [], isLoading } = useAICharacters();
  const createMutation = useCreateAICharacter();
  const updateMutation = useUpdateAICharacter();
  const deleteMutation = useDeleteAICharacter();

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCharacter(null);
    setEditSheetOpen(true);
  };

  const handleEdit = (character: AICharacterRow) => {
    setEditingCharacter(character);
    setEditSheetOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    personality: string;
    voiceStyle: string;
    systemPrompt: string;
    avatarUrl: string;
  }) => {
    if (editingCharacter) {
      await updateMutation.mutateAsync({
        id: editingCharacter.id,
        name: data.name,
        personality: data.personality,
        voice_style: data.voiceStyle,
        system_prompt: data.systemPrompt,
        avatar_url: data.avatarUrl,
      });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        personality: data.personality,
        voice_style: data.voiceStyle,
        system_prompt: data.systemPrompt,
        avatar_url: data.avatarUrl,
        is_active: true,
      });
    }
    setEditSheetOpen(false);
  };

  const handleDelete = (character: AICharacterRow) => {
    deleteMutation.mutate(character.id);
  };

  const handleToggleActive = async (character: AICharacterRow) => {
    await updateMutation.mutateAsync({
      id: character.id,
      is_active: !character.is_active,
    });
  };

  // Stats
  const totalCharacters = characters.length;
  const activeCharacters = characters.filter((c) => c.is_active).length;

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
              <div className="text-2xl font-bold">0</div>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCharacters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>暂无AI角色</p>
                <p className="text-sm">点击"新建AI角色"创建第一个角色</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>角色名称</TableHead>
                    <TableHead>性格特点</TableHead>
                    <TableHead>语音风格</TableHead>
                    <TableHead className="text-center">状态</TableHead>
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
                            <AvatarImage src={character.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {character.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{character.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {character.personality || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{character.voice_style || "未设置"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={character.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleToggleActive(character)}
                        >
                          {character.is_active ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {character.updated_at ? new Date(character.updated_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
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
            )}
          </CardContent>
        </Card>
      </div>

      <CharacterEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        character={editingCharacter}
        voiceStyles={voiceStyles}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}
