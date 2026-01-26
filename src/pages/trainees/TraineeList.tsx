import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Eye,
  Mail,
  TrendingUp,
  Download,
} from "lucide-react";

// Mock trainees data
const mockTrainees = [
  {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    avatar: null,
    department: "销售部",
    status: "active",
    enrolledPlans: 3,
    completedPlans: 1,
    avgScore: 85,
    lastActive: "2024-01-25",
  },
  {
    id: "2",
    name: "李四",
    email: "lisi@example.com",
    avatar: null,
    department: "客服部",
    status: "active",
    enrolledPlans: 2,
    completedPlans: 2,
    avgScore: 92,
    lastActive: "2024-01-24",
  },
  {
    id: "3",
    name: "王五",
    email: "wangwu@example.com",
    avatar: null,
    department: "市场部",
    status: "inactive",
    enrolledPlans: 1,
    completedPlans: 0,
    avgScore: 0,
    lastActive: "2024-01-10",
  },
  {
    id: "4",
    name: "赵六",
    email: "zhaoliu@example.com",
    avatar: null,
    department: "技术部",
    status: "active",
    enrolledPlans: 4,
    completedPlans: 3,
    avgScore: 88,
    lastActive: "2024-01-25",
  },
  {
    id: "5",
    name: "钱七",
    email: "qianqi@example.com",
    avatar: null,
    department: "销售部",
    status: "pending",
    enrolledPlans: 0,
    completedPlans: 0,
    avgScore: 0,
    lastActive: null,
  },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "活跃", variant: "default" },
  inactive: { label: "不活跃", variant: "secondary" },
  pending: { label: "待激活", variant: "outline" },
};

export default function TraineeList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrainees = mockTrainees.filter(
    (trainee) =>
      trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="学员列表" description="查看和管理所有学员">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索学员姓名、邮箱或部门..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              邀请学员
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">248</div>
              <p className="text-sm text-muted-foreground">总学员数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">186</div>
              <p className="text-sm text-muted-foreground">活跃学员</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">42</div>
              <p className="text-sm text-muted-foreground">待激活</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">85.2</div>
              <p className="text-sm text-muted-foreground">平均得分</p>
            </CardContent>
          </Card>
        </div>

        {/* Trainees Table */}
        <Card>
          <CardHeader>
            <CardTitle>学员列表</CardTitle>
            <CardDescription>
              共 {filteredTrainees.length} 名学员
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学员</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>参与培训</TableHead>
                  <TableHead>平均得分</TableHead>
                  <TableHead>最近活跃</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={trainee.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {trainee.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{trainee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {trainee.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{trainee.department}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[trainee.status].variant}>
                        {statusMap[trainee.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{trainee.completedPlans}</span>
                        <span className="text-muted-foreground">
                          /{trainee.enrolledPlans} 完成
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {trainee.avgScore > 0 ? (
                        <span
                          className={`font-medium ${
                            trainee.avgScore >= 80 ? "text-success" : "text-warning"
                          }`}
                        >
                          {trainee.avgScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trainee.lastActive ? (
                        <span className="text-sm text-muted-foreground">
                          {trainee.lastActive}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">从未登录</span>
                      )}
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
                            <TrendingUp className="mr-2 h-4 w-4" />
                            成长地图
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            发送提醒
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
