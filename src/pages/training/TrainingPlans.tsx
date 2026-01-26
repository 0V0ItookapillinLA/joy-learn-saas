import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Copy,
  Users,
  Calendar,
} from "lucide-react";

// Mock data for training plans
const mockPlans = [
  {
    id: "1",
    title: "新员工入职培训",
    description: "帮助新员工快速融入公司文化和工作流程",
    status: "in_progress",
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    participants: 32,
    chapters: 8,
    completionRate: 65,
  },
  {
    id: "2",
    title: "销售技能提升计划",
    description: "提升销售团队的客户沟通和谈判技巧",
    status: "in_progress",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    participants: 18,
    chapters: 6,
    completionRate: 42,
  },
  {
    id: "3",
    title: "客户服务专项培训",
    description: "提高客服团队的服务质量和响应效率",
    status: "pending",
    startDate: "2024-03-01",
    endDate: "2024-04-30",
    participants: 24,
    chapters: 5,
    completionRate: 0,
  },
  {
    id: "4",
    title: "产品知识培训2024",
    description: "全面了解公司产品线和技术特点",
    status: "draft",
    startDate: null,
    endDate: null,
    participants: 0,
    chapters: 10,
    completionRate: 0,
  },
  {
    id: "5",
    title: "领导力发展计划",
    description: "培养中层管理者的领导能力",
    status: "completed",
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    participants: 12,
    chapters: 12,
    completionRate: 100,
  },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "草稿", variant: "secondary" },
  pending: { label: "待发布", variant: "outline" },
  in_progress: { label: "进行中", variant: "default" },
  completed: { label: "已完成", variant: "secondary" },
  archived: { label: "已归档", variant: "outline" },
};

export default function TrainingPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlans, setFilteredPlans] = useState(mockPlans);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredPlans(mockPlans);
    } else {
      setFilteredPlans(
        mockPlans.filter(
          (plan) =>
            plan.title.toLowerCase().includes(query.toLowerCase()) ||
            plan.description.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  return (
    <DashboardLayout title="培训计划" description="创建和管理您的培训计划">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索培训计划..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            创建培训计划
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">全部计划</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">5</div>
              <p className="text-sm text-muted-foreground">进行中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">4</div>
              <p className="text-sm text-muted-foreground">已完成</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">3</div>
              <p className="text-sm text-muted-foreground">草稿</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle>培训计划列表</CardTitle>
            <CardDescription>
              共 {filteredPlans.length} 个培训计划
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>培训名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间周期</TableHead>
                  <TableHead>学员数</TableHead>
                  <TableHead>章节数</TableHead>
                  <TableHead>完成率</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{plan.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {plan.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[plan.status].variant}>
                        {statusMap[plan.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.startDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {plan.startDate} ~ {plan.endDate}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">未设置</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {plan.participants}
                      </div>
                    </TableCell>
                    <TableCell>{plan.chapters}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${plan.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {plan.completionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
