import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Plus,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock organization structure
const mockDepartments = [
  {
    id: "1",
    name: "销售部",
    memberCount: 45,
    children: [
      { id: "1-1", name: "华北区销售", memberCount: 15 },
      { id: "1-2", name: "华东区销售", memberCount: 18 },
      { id: "1-3", name: "华南区销售", memberCount: 12 },
    ],
  },
  {
    id: "2",
    name: "客服部",
    memberCount: 32,
    children: [
      { id: "2-1", name: "在线客服组", memberCount: 20 },
      { id: "2-2", name: "电话客服组", memberCount: 12 },
    ],
  },
  {
    id: "3",
    name: "市场部",
    memberCount: 18,
    children: [],
  },
  {
    id: "4",
    name: "技术部",
    memberCount: 56,
    children: [
      { id: "4-1", name: "研发组", memberCount: 35 },
      { id: "4-2", name: "测试组", memberCount: 12 },
      { id: "4-3", name: "运维组", memberCount: 9 },
    ],
  },
  {
    id: "5",
    name: "人事部",
    memberCount: 8,
    children: [],
  },
];

interface DepartmentNodeProps {
  department: {
    id: string;
    name: string;
    memberCount: number;
    children?: { id: string; name: string; memberCount: number }[];
  };
  level?: number;
}

function DepartmentNode({ department, level = 0 }: DepartmentNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = department.children && department.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
        style={{ marginLeft: level * 24 }}
      >
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{department.name}</h4>
            <p className="text-sm text-muted-foreground">
              {department.memberCount} 名成员
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              添加子部门
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasChildren && expanded && (
        <div className="mt-2 space-y-2">
          {department.children!.map((child) => (
            <DepartmentNode key={child.id} department={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationSettings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <DashboardLayout title="组织架构" description="管理企业部门与团队结构">
      <div className="space-y-6">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>企业信息</CardTitle>
                <CardDescription>管理您的企业基本信息</CardDescription>
              </div>
              <Button variant="outline">编辑信息</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">企业名称</Label>
                  <p className="mt-1 font-medium">深圳市科技有限公司</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">套餐类型</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge>专业版</Badge>
                    <span className="text-sm text-muted-foreground">有效期至 2024-12-31</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">学员配额</Label>
                  <p className="mt-1">
                    <span className="font-medium">159</span>
                    <span className="text-muted-foreground"> / 200 人</span>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">存储空间</Label>
                  <p className="mt-1">
                    <span className="font-medium">2.5</span>
                    <span className="text-muted-foreground"> / 10 GB</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">部门总数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">159</div>
                  <p className="text-sm text-muted-foreground">总成员数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-sm text-muted-foreground">管理员数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Tree */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>部门结构</CardTitle>
                <CardDescription>管理企业部门层级关系</CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新建部门
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建部门</DialogTitle>
                    <DialogDescription>创建新的部门或团队</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dept-name">部门名称</Label>
                      <Input id="dept-name" placeholder="请输入部门名称" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="parent-dept">上级部门</Label>
                      <Input id="parent-dept" placeholder="选择上级部门（可选）" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dept-desc">部门描述</Label>
                      <Input id="dept-desc" placeholder="简要描述部门职责（可选）" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>创建</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockDepartments.map((dept) => (
                <DepartmentNode key={dept.id} department={dept} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
