import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const statsCards = [
  {
    title: "培训计划",
    value: "12",
    change: "+2",
    changeLabel: "较上月",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "活跃学员",
    value: "248",
    change: "+18",
    changeLabel: "较上周",
    icon: Users,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "练习完成率",
    value: "78%",
    change: "+5%",
    changeLabel: "较上月",
    icon: MessageSquare,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "平均得分",
    value: "86.5",
    change: "+2.3",
    changeLabel: "较上月",
    icon: TrendingUp,
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

const recentPlans = [
  {
    title: "新员工入职培训",
    status: "进行中",
    progress: 65,
    dueDate: "2024-02-28",
    participants: 32,
  },
  {
    title: "销售技能提升计划",
    status: "进行中",
    progress: 42,
    dueDate: "2024-03-15",
    participants: 18,
  },
  {
    title: "客户服务专项培训",
    status: "待开始",
    progress: 0,
    dueDate: "2024-03-01",
    participants: 24,
  },
];

const quickActions = [
  { title: "创建培训计划", icon: Plus, href: "/training/plans/new" },
  { title: "添加学员", icon: Users, href: "/trainees/invitations" },
  { title: "配置AI角色", icon: MessageSquare, href: "/characters" },
  { title: "查看报告", icon: TrendingUp, href: "/analytics/training" },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="工作台" description="欢迎回来，查看您的培训概览">
      {/* Welcome Section */}
      <div className="mb-8">
        <Card className="border-none bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold">
                👋 早上好，{user?.user_metadata?.full_name || "管理员"}
              </h2>
              <p className="mt-1 text-primary-foreground/80">
                今天有 3 个培训任务待处理，继续加油！
              </p>
            </div>
            <Button variant="secondary" className="hidden md:flex">
              <Calendar className="mr-2 h-4 w-4" />
              查看日程
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="text-success">{stat.change}</span> {stat.changeLabel}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Training Plans */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>进行中的培训</CardTitle>
                <CardDescription>您当前正在进行的培训计划</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPlans.map((plan, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{plan.title}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            plan.status === "进行中"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {plan.participants} 人
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          截止 {plan.dueDate}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress value={plan.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Achievements */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-warning" />
                本月成就
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">目标达成</p>
                    <p className="text-xs text-muted-foreground">完成 5 个培训计划</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">学员成长</p>
                    <p className="text-xs text-muted-foreground">50 名学员完成培训</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
