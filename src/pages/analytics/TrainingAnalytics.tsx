import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Bell,
  CheckCircle,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";

// 核心指标数据
const coreMetrics = [
  {
    value: "245",
    label: "总学员数",
    change: "+12↑",
  },
  {
    value: "87%",
    label: "活跃率",
    change: "↑5%",
  },
  {
    value: "68%",
    label: "整体进度",
    change: "↑18%",
  },
  {
    value: "75",
    label: "综合评分",
    change: "+3分",
  },
];

// 四阶段进度数据
const stageProgress = [
  {
    stage: "学",
    label: "学习资源完成",
    progress: 82,
    color: "bg-blue-500",
    details: "4.5h 平均学习时长 | 85% 资源完成率",
  },
  {
    stage: "练",
    label: "人机对练完成",
    progress: 63,
    color: "bg-green-500",
    details: "12次 平均对练次数 | 78分 平均得分",
  },
  {
    stage: "考",
    label: "考试参与率",
    progress: 58,
    color: "bg-orange-500",
    details: "78分 平均考试成绩 | 72% 及格率",
  },
  {
    stage: "评",
    label: "成果评价完成",
    progress: 71,
    color: "bg-purple-500",
    details: "⭐3.8 综合能力评分 | 68% 评价完成率",
  },
];

// 活跃度趋势数据
const activityTrendData = [
  { date: "1/1", newStudents: 12, activeStudents: 98 },
  { date: "1/5", newStudents: 8, activeStudents: 115 },
  { date: "1/10", newStudents: 15, activeStudents: 132 },
  { date: "1/15", newStudents: 22, activeStudents: 158 },
  { date: "1/20", newStudents: 18, activeStudents: 145 },
  { date: "1/25", newStudents: 25, activeStudents: 178 },
];

// 各环节完成率数据
const completionRateData = [
  { name: "学", rate: 82, fill: "#3B82F6" },
  { name: "练", rate: 63, fill: "#22C55E" },
  { name: "考", rate: 58, fill: "#F97316" },
  { name: "评", rate: 71, fill: "#8B5CF6" },
];

// 能力评分分布数据
const abilityRadarData = [
  { ability: "通讯表达", score: 78, fullMark: 100 },
  { ability: "知识理解", score: 85, fullMark: 100 },
  { ability: "应用能力", score: 72, fullMark: 100 },
  { ability: "问题解决", score: 68, fullMark: 100 },
  { ability: "团队协作", score: 82, fullMark: 100 },
];

// 学习地图阶段分布
const levelDistribution = [
  { level: "Lv1", label: "初级阶段", count: 98, percentage: 40, color: "bg-blue-500" },
  { level: "Lv2", label: "中级阶段", count: 87, percentage: 35, color: "bg-green-500" },
  { level: "Lv3", label: "高级阶段", count: 60, percentage: 25, color: "bg-orange-500" },
];

// 学员档案数据
const studentRecords = [
  { name: "张三", studyProgress: 85, practiceProgress: 72, examScore: 82, evaluationScore: 85, grade: "优秀", gradeColor: "bg-green-500", lastActive: "2天前", level: "Lv2" },
  { name: "李四", studyProgress: 62, practiceProgress: 48, examScore: 65, evaluationScore: 68, grade: "及格", gradeColor: "bg-yellow-500", lastActive: "7天前", level: "Lv1" },
  { name: "王五", studyProgress: 45, practiceProgress: 22, examScore: 58, evaluationScore: 62, grade: "不及格", gradeColor: "bg-red-500", lastActive: "15天前", level: "Lv1" },
  { name: "赵六", studyProgress: 90, practiceProgress: 85, examScore: 91, evaluationScore: 88, grade: "优秀", gradeColor: "bg-green-500", lastActive: "1天前", level: "Lv3" },
  { name: "钱七", studyProgress: 78, practiceProgress: 65, examScore: 75, evaluationScore: 72, grade: "良好", gradeColor: "bg-blue-500", lastActive: "3天前", level: "Lv2" },
  { name: "孙八", studyProgress: 55, practiceProgress: 40, examScore: 60, evaluationScore: 58, grade: "及格", gradeColor: "bg-yellow-500", lastActive: "10天前", level: "Lv1" },
  { name: "周九", studyProgress: 88, practiceProgress: 80, examScore: 85, evaluationScore: 82, grade: "优秀", gradeColor: "bg-green-500", lastActive: "1天前", level: "Lv2" },
  { name: "吴十", studyProgress: 70, practiceProgress: 55, examScore: 68, evaluationScore: 70, grade: "良好", gradeColor: "bg-blue-500", lastActive: "5天前", level: "Lv1" },
];

export default function TrainingAnalytics() {
  return (
    <DashboardLayout title="AI培训效果监控看板" description="全方位监控培训效果与学员成长">
      {/* 顶部工具栏 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="全部班级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部班级</SelectItem>
              <SelectItem value="class1">销售一班</SelectItem>
              <SelectItem value="class2">销售二班</SelectItem>
              <SelectItem value="class3">客服班</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="30">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">最近7天</SelectItem>
              <SelectItem value="30">最近30天</SelectItem>
              <SelectItem value="90">最近90天</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            订阅
          </Button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold">核心指标</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {coreMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="text-4xl font-bold">{metric.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{metric.label}</div>
                <div className="mt-2 text-sm text-primary">{metric.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 四阶段进度 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-primary" />
            <CardTitle className="text-lg">学-练-考-评 四阶段进度</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {stageProgress.map((item) => (
            <div key={item.stage} className="flex items-center gap-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color} text-white text-sm font-medium`}>
                {item.stage}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <span className="font-semibold">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
              <div className="hidden text-sm text-muted-foreground lg:block min-w-[200px]">
                {item.details}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 趋势分析 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold">趋势分析</h2>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 学员学习活跃度趋势 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <CardTitle className="text-base">学员学习活跃度趋势</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="newStudents" 
                    stroke="#3B82F6" 
                    name="新增学员" 
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeStudents" 
                    stroke="#22C55E" 
                    name="日活学员"
                    strokeWidth={2}
                    dot={{ fill: "#22C55E", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 各环节完成率对比 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <CardTitle className="text-base">各环节完成率对比</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={completionRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value) => [`${value}%`, "完成率"]}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {completionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 能力评分与学习地图 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* 学员能力评分分布 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <CardTitle className="text-base">学员能力评分分布</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={abilityRadarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="ability" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Radar
                  name="能力评分"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 学习地图阶段分布 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <CardTitle className="text-base">学习地图阶段分布</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {levelDistribution.map((level, index) => (
              <div key={level.level} className="flex items-center gap-4">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                  {index === 0 && <CheckCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{level.label} <span className="text-muted-foreground">{level.level}</span></span>
                    <span className="text-sm text-muted-foreground">{level.count}人 ({level.percentage}%)</span>
                  </div>
                  <Progress value={level.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 学员学习档案列表 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <CardTitle className="text-base">学员学习档案列表</CardTitle>
            </div>
            <Tabs defaultValue="all">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">全部</TabsTrigger>
                <TabsTrigger value="excellent" className="text-xs">优秀</TabsTrigger>
                <TabsTrigger value="warning" className="text-xs">待关注</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>学习进度</TableHead>
                <TableHead>对练进度</TableHead>
                <TableHead>考试成绩</TableHead>
                <TableHead>评价得分</TableHead>
                <TableHead>综合评级</TableHead>
                <TableHead>最近活动</TableHead>
                <TableHead>学习地图</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentRecords.map((student) => (
                <TableRow key={student.name}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studyProgress}%</TableCell>
                  <TableCell>{student.practiceProgress}%</TableCell>
                  <TableCell>{student.examScore}</TableCell>
                  <TableCell>{student.evaluationScore}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <div className={`h-2 w-2 rounded-full ${student.gradeColor}`} />
                      {student.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      查看
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
