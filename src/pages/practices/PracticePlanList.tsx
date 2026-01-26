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
import { Plus, Search, MoreHorizontal, Copy, Edit, Trash2, UserPlus, Eye } from "lucide-react";
import { toast } from "sonner";
import { CreatePracticeDialog } from "@/components/practices/CreatePracticeDialog";

export interface PracticePlan {
  id: string;
  title: string;
  aiRole: string;
  skillItems: string[];
  practiceCount: number;
  usageCount: number;
  status: "active" | "inactive";
  updatedAt: string;
}

const mockPractices: PracticePlan[] = [
  {
    id: "1",
    title: "客户投诉处理场景",
    aiRole: "愤怒的客户",
    skillItems: ["沟通技巧", "情绪管理"],
    practiceCount: 45,
    usageCount: 128,
    status: "active",
    updatedAt: "2025-01-25",
  },
  {
    id: "2",
    title: "产品推荐场景",
    aiRole: "咨询客户",
    skillItems: ["产品知识", "销售技巧"],
    practiceCount: 32,
    usageCount: 96,
    status: "active",
    updatedAt: "2025-01-24",
  },
  {
    id: "3",
    title: "价格谈判场景",
    aiRole: "企业采购",
    skillItems: ["谈判技巧", "商务沟通"],
    practiceCount: 28,
    usageCount: 75,
    status: "active",
    updatedAt: "2025-01-23",
  },
  {
    id: "4",
    title: "售后服务场景",
    aiRole: "VIP客户",
    skillItems: ["服务意识", "问题解决"],
    practiceCount: 56,
    usageCount: 142,
    status: "active",
    updatedAt: "2025-01-22",
  },
  {
    id: "5",
    title: "新产品介绍场景",
    aiRole: "潜在客户",
    skillItems: ["产品演示", "需求挖掘"],
    practiceCount: 18,
    usageCount: 45,
    status: "inactive",
    updatedAt: "2025-01-20",
  },
];

export default function PracticePlanList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [practices] = useState(mockPractices);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredPractices = practices.filter(
    (practice) =>
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.aiRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (practice: PracticePlan) => {
    toast.info(`邀请学员参加：${practice.title}`);
  };

  const handleEdit = (practice: PracticePlan) => {
    toast.info(`编辑练习：${practice.title}`);
  };

  const handleCopy = (practice: PracticePlan) => {
    toast.success(`已复制练习：${practice.title}`);
  };

  const handleDelete = (practice: PracticePlan) => {
    toast.success(`已删除练习：${practice.title}`);
  };

  const handlePreview = (practice: PracticePlan) => {
    toast.info(`预览练习：${practice.title}`);
  };

  // Stats
  const totalPractices = practices.length;
  const activePractices = practices.filter((p) => p.status === "active").length;
  const totalPracticeCount = practices.reduce((sum, p) => sum + p.practiceCount, 0);
  const totalUsageCount = practices.reduce((sum, p) => sum + p.usageCount, 0);

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
              <div className="text-2xl font-bold">{totalPracticeCount}</div>
              <p className="text-sm text-muted-foreground">练习人数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalUsageCount}</div>
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
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建练习计划
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>练习名称</TableHead>
                  <TableHead>AI角色</TableHead>
                  <TableHead>适用能力项</TableHead>
                  <TableHead className="text-center">练习人数</TableHead>
                  <TableHead className="text-center">使用次数</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPractices.map((practice) => (
                  <TableRow key={practice.id}>
                    <TableCell>
                      <div className="font-medium">{practice.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{practice.aiRole}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {practice.skillItems.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{practice.practiceCount}</TableCell>
                    <TableCell className="text-center">{practice.usageCount}</TableCell>
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
          </CardContent>
        </Card>
      </div>

      <CreatePracticeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </DashboardLayout>
  );
}
