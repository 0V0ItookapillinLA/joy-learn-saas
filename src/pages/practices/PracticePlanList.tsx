import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Copy, Edit, Trash2, UserPlus, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PracticeEditSheet } from "@/components/practices/PracticeEditSheet";
import { usePracticeSessions, useCreatePracticeSession, useDeletePracticeSession } from "@/hooks/usePracticeSessions";

export default function PracticePlanList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<any>(null);

  const { data: practices, isLoading } = usePracticeSessions();
  const createMutation = useCreatePracticeSession();
  const deleteMutation = useDeletePracticeSession();

  const filteredPractices = (practices || []).filter(
    (practice) =>
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (practice.ai_role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingPractice(null);
    setSheetOpen(true);
  };

  const handleEdit = (practice: any) => {
    setEditingPractice({
      id: practice.id,
      title: practice.title,
      scenarioDescription: practice.scenario_description || "",
      aiRoleId: "1",
      aiRoleInfo: practice.ai_role || "",
      traineeRole: practice.trainee_role || "",
      dialogueGoal: practice.description || "",
      passScore: 50,
      assessmentItems: practice.scoring_criteria?.items || [],
    });
    setSheetOpen(true);
  };

  const handleSave = async (data: any) => {
    const scoringCriteria = {
      items: data.assessmentItems,
      passScore: data.passScore,
    };

    await createMutation.mutateAsync({
      title: data.title,
      description: data.dialogueGoal,
      scenario_description: data.scenarioDescription,
      ai_role: data.aiRoleInfo,
      trainee_role: data.traineeRole,
      scoring_criteria: scoringCriteria,
      practice_mode: 'free_dialogue',
    });
  };

  const handleCopy = (practice: any) => {
    toast.success(`已复制练习：${practice.title}`);
  };

  const handleDelete = (practice: any) => {
    deleteMutation.mutate(practice.id);
  };

  const handlePreview = (practice: any) => {
    toast.info(`预览练习：${practice.title}`);
  };

  const handleInvite = (practice: any) => {
    toast.info(`邀请学员参加：${practice.title}`);
  };

  // Stats
  const totalPractices = filteredPractices.length;
  const activePractices = filteredPractices.length;

  return (
    <DashboardLayout title="练习计划" description="管理AI对话练习场景">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalPractices}</div>
              <p className="text-sm text-muted-foreground">练习场景</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{activePractices}</div>
              <p className="text-sm text-muted-foreground">已启用</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">练习人数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">使用次数</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索练习名称、AI角色..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建练习计划
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPractices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>暂无练习计划</p>
                <p className="text-sm">点击"新建练习计划"创建第一个练习</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>练习名称</TableHead>
                    <TableHead>AI角色</TableHead>
                    <TableHead>练习模式</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPractices.map((practice) => (
                    <TableRow key={practice.id}>
                      <TableCell>
                        <div className="font-medium">{practice.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {practice.scenario_description || practice.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {practice.ai_role?.slice(0, 20) || "未设置"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {practice.practice_mode === 'free_dialogue' ? '自由对话' : '固定剧本'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {practice.created_at ? new Date(practice.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleInvite(practice)}
                            title="邀请"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(practice)}
                            title="预览"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(practice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopy(practice)}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(practice)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <PracticeEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
        initialData={editingPractice}
      />
    </DashboardLayout>
  );
}
