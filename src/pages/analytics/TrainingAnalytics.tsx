import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Select,
  Segmented,
} from "antd";
import {
  DownloadOutlined,
  BellOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
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
  { value: 245, label: "总学员数", change: "+12↑" },
  { value: "87%", label: "活跃率", change: "↑5%" },
  { value: "68%", label: "整体进度", change: "↑18%" },
  { value: 75, label: "综合评分", change: "+3分" },
];

// 四阶段进度数据
const stageProgress = [
  { stage: "学", label: "学习资源完成", progress: 82, color: "#3B82F6", details: "4.5h 平均学习时长 | 85% 资源完成率" },
  { stage: "练", label: "人机对练完成", progress: 63, color: "#22C55E", details: "12次 平均对练次数 | 78分 平均得分" },
  { stage: "考", label: "考试参与率", progress: 58, color: "#F97316", details: "78分 平均考试成绩 | 72% 及格率" },
  { stage: "评", label: "成果评价完成", progress: 71, color: "#8B5CF6", details: "⭐3.8 综合能力评分 | 68% 评价完成率" },
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
  { level: "Lv1", label: "初级阶段", count: 98, percentage: 40 },
  { level: "Lv2", label: "中级阶段", count: 87, percentage: 35 },
  { level: "Lv3", label: "高级阶段", count: 60, percentage: 25 },
];

// 学员档案数据
interface StudentRecord {
  key: string;
  name: string;
  studyProgress: number;
  practiceProgress: number;
  examScore: number;
  evaluationScore: number;
  grade: string;
  gradeColor: string;
  lastActive: string;
  level: string;
}

const studentRecords: StudentRecord[] = [
  { key: "1", name: "张三", studyProgress: 85, practiceProgress: 72, examScore: 82, evaluationScore: 85, grade: "优秀", gradeColor: "success", lastActive: "2天前", level: "Lv2" },
  { key: "2", name: "李四", studyProgress: 62, practiceProgress: 48, examScore: 65, evaluationScore: 68, grade: "及格", gradeColor: "warning", lastActive: "7天前", level: "Lv1" },
  { key: "3", name: "王五", studyProgress: 45, practiceProgress: 22, examScore: 58, evaluationScore: 62, grade: "不及格", gradeColor: "error", lastActive: "15天前", level: "Lv1" },
  { key: "4", name: "赵六", studyProgress: 90, practiceProgress: 85, examScore: 91, evaluationScore: 88, grade: "优秀", gradeColor: "success", lastActive: "1天前", level: "Lv3" },
  { key: "5", name: "钱七", studyProgress: 78, practiceProgress: 65, examScore: 75, evaluationScore: 72, grade: "良好", gradeColor: "processing", lastActive: "3天前", level: "Lv2" },
  { key: "6", name: "孙八", studyProgress: 55, practiceProgress: 40, examScore: 60, evaluationScore: 58, grade: "及格", gradeColor: "warning", lastActive: "10天前", level: "Lv1" },
  { key: "7", name: "周九", studyProgress: 88, practiceProgress: 80, examScore: 85, evaluationScore: 82, grade: "优秀", gradeColor: "success", lastActive: "1天前", level: "Lv2" },
  { key: "8", name: "吴十", studyProgress: 70, practiceProgress: 55, examScore: 68, evaluationScore: 70, grade: "良好", gradeColor: "processing", lastActive: "5天前", level: "Lv1" },
];

const columns: ColumnsType<StudentRecord> = [
  { title: "姓名", dataIndex: "name", key: "name", fixed: "left", width: 80 },
  { title: "学习进度", dataIndex: "studyProgress", key: "studyProgress", render: (v) => `${v}%` },
  { title: "对练进度", dataIndex: "practiceProgress", key: "practiceProgress", render: (v) => `${v}%` },
  { title: "考试成绩", dataIndex: "examScore", key: "examScore" },
  { title: "评价得分", dataIndex: "evaluationScore", key: "evaluationScore" },
  {
    title: "综合评级",
    dataIndex: "grade",
    key: "grade",
    render: (grade, record) => <Tag color={record.gradeColor}>{grade}</Tag>,
  },
  { title: "最近活动", dataIndex: "lastActive", key: "lastActive", render: (v) => <span className="text-gray-500">{v}</span> },
  { title: "学习地图", dataIndex: "level", key: "level", render: (v) => <Tag>{v}</Tag> },
  {
    title: "操作",
    key: "action",
    fixed: "right",
    width: 80,
    render: () => (
      <Button type="link" size="small" icon={<EyeOutlined />}>
        查看
      </Button>
    ),
  },
];

export default function TrainingAnalytics() {
  return (
    <DashboardLayout title="AI培训效果监控看板" description="全方位监控培训效果与学员成长">
      {/* 顶部工具栏 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Select.Option value="all">全部班级</Select.Option>
            <Select.Option value="class1">销售一班</Select.Option>
            <Select.Option value="class2">销售二班</Select.Option>
            <Select.Option value="class3">客服班</Select.Option>
          </Select>
          <Select defaultValue="30" style={{ width: 140 }}>
            <Select.Option value="7">最近7天</Select.Option>
            <Select.Option value="30">最近30天</Select.Option>
            <Select.Option value="90">最近90天</Select.Option>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button icon={<BellOutlined />}>订阅</Button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-blue-500" />
          <h2 className="text-lg font-semibold">核心指标</h2>
        </div>
        <Row gutter={16}>
          {coreMetrics.map((metric) => (
            <Col span={6} key={metric.label}>
              <Card>
                <Statistic
                  title={metric.label}
                  value={metric.value}
                  suffix={<span className="text-sm text-blue-500 ml-2">{metric.change}</span>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 四阶段进度 */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-1 rounded-full bg-blue-500" />
          <h3 className="text-lg font-semibold m-0">学-练-考-评 四阶段进度</h3>
        </div>
        <div className="space-y-4">
          {stageProgress.map((item) => (
            <div key={item.stage} className="flex items-center gap-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: item.color }}
              >
                {item.stage}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <span className="font-semibold">{item.progress}%</span>
                </div>
                <Progress percent={item.progress} showInfo={false} strokeColor={item.color} />
              </div>
              <div className="hidden text-sm text-gray-500 lg:block min-w-[200px]">
                {item.details}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 趋势分析 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-blue-500" />
          <h2 className="text-lg font-semibold">趋势分析</h2>
        </div>

        <Row gutter={16}>
          {/* 学员学习活跃度趋势 */}
          <Col span={12}>
            <Card title="学员学习活跃度趋势" size="small">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newStudents" stroke="#3B82F6" name="新增学员" strokeWidth={2} />
                  <Line type="monotone" dataKey="activeStudents" stroke="#22C55E" name="日活学员" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 各环节完成率对比 */}
          <Col span={12}>
            <Card title="各环节完成率对比" size="small">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={completionRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "完成率"]} />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {completionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 能力评分与学习地图 */}
      <Row gutter={16} className="mb-6">
        {/* 学员能力评分分布 */}
        <Col span={12}>
          <Card title="学员能力评分分布" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={abilityRadarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="ability" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="能力评分" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 学习地图阶段分布 */}
        <Col span={12}>
          <Card title="学习地图阶段分布" size="small">
            <div className="space-y-4">
              {levelDistribution.map((level) => (
                <div key={level.level} className="flex items-center gap-4">
                  <Tag color="blue">{level.level}</Tag>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{level.label}</span>
                      <span className="text-sm text-gray-500">
                        {level.count}人 ({level.percentage}%)
                      </span>
                    </div>
                    <Progress percent={level.percentage} showInfo={false} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 学员学习档案列表 */}
      <Card
        title="学员学习档案列表"
        extra={
          <Segmented
            options={[
              { label: "全部", value: "all" },
              { label: "优秀", value: "excellent" },
              { label: "待关注", value: "warning" },
            ]}
            defaultValue="all"
          />
        }
      >
        <Table
          columns={columns}
          dataSource={studentRecords}
          scroll={{ x: 1000 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </DashboardLayout>
  );
}
