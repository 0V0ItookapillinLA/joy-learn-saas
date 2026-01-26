import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Star,
} from "lucide-react";

// Mock skill radar data
const skillData = [
  { skill: "产品知识", current: 85, target: 90 },
  { skill: "沟通表达", current: 78, target: 85 },
  { skill: "问题解决", current: 82, target: 88 },
  { skill: "客户服务", current: 90, target: 92 },
  { skill: "团队协作", current: 75, target: 80 },
  { skill: "压力应对", current: 70, target: 82 },
];

// Mock growth trend data
const growthTrend = [
  { month: "9月", score: 65 },
  { month: "10月", score: 72 },
  { month: "11月", score: 78 },
  { month: "12月", score: 82 },
  { month: "1月", score: 85 },
];

// Mock milestones
const milestones = [
  {
    date: "2024-01-15",
    title: "完成新员工培训",
    description: "顺利通过入职培训考核",
    type: "achievement",
    score: 92,
  },
  {
    date: "2024-01-10",
    title: "客服技能提升",
    description: "客户服务能力得分提升至90分",
    type: "skill_up",
    skill: "客户服务",
  },
  {
    date: "2023-12-28",
    title: "完成销售话术练习",
    description: "完成15次产品推荐场景练习",
    type: "practice",
    count: 15,
  },
  {
    date: "2023-12-15",
    title: "加入培训计划",
    description: "开始「销售精英培养计划」",
    type: "join",
  },
];

// Mock recommended courses
const recommendations = [
  {
    title: "压力管理与情绪调节",
    reason: "基于当前能力短板推荐",
    match: 95,
  },
  {
    title: "高效沟通技巧进阶",
    reason: "提升沟通表达能力",
    match: 88,
  },
  {
    title: "团队协作与冲突处理",
    reason: "提升团队协作能力",
    match: 82,
  },
];

export default function GrowthMap() {
  return (
    <DashboardLayout title="学员成长地图" description="追踪学员能力成长与学习路径">
      <div className="space-y-6">
        {/* Trainee Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                张三
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">张三</h2>
              <p className="text-sm text-muted-foreground">销售部 · 销售专员</p>
            </div>
          </div>
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择学员" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">张三</SelectItem>
              <SelectItem value="lisi">李四</SelectItem>
              <SelectItem value="wangwu">王五</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">85</div>
                  <p className="text-sm text-muted-foreground">综合能力分</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">+20</div>
                  <p className="text-sm text-muted-foreground">近3月成长</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Award className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-sm text-muted-foreground">获得成就</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <BookOpen className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-sm text-muted-foreground">进行中培训</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skills Radar */}
          <Card>
            <CardHeader>
              <CardTitle>能力雷达图</CardTitle>
              <CardDescription>当前能力与目标对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                      name="当前"
                      dataKey="current"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="目标"
                      dataKey="target"
                      stroke="hsl(var(--muted-foreground))"
                      fill="transparent"
                      strokeDasharray="5 5"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>当前能力</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border-2 border-dashed border-muted-foreground" />
                  <span>目标能力</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Trend */}
          <Card>
            <CardHeader>
              <CardTitle>成长趋势</CardTitle>
              <CardDescription>近5个月综合能力得分变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[50, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Growth Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>成长历程</CardTitle>
              <CardDescription>关键节点与里程碑</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          milestone.type === "achievement"
                            ? "bg-warning/10"
                            : milestone.type === "skill_up"
                            ? "bg-success/10"
                            : "bg-primary/10"
                        }`}
                      >
                        {milestone.type === "achievement" ? (
                          <Award className="h-4 w-4 text-warning" />
                        ) : milestone.type === "skill_up" ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{milestone.title}</h4>
                        {milestone.score && (
                          <Badge variant="secondary">{milestone.score}分</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {milestone.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>学习推荐</CardTitle>
              <CardDescription>基于能力短板的个性化推荐</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4 fill-warning" />
                        <span className="text-sm font-medium">{rec.match}%</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Details */}
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium">能力详情</h4>
                <div className="space-y-3">
                  {skillData.map((skill) => (
                    <div key={skill.skill} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.skill}</span>
                        <span className="text-muted-foreground">
                          {skill.current}/{skill.target}
                        </span>
                      </div>
                      <Progress
                        value={(skill.current / skill.target) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
