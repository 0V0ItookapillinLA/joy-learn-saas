import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RotateCcw, Search } from "lucide-react";
import {
  TrainingPlanTable,
  type TrainingPlan,
} from "@/components/training/TrainingPlanTable";
import { TrainingPlanSheet } from "@/components/training/TrainingPlanSheet";
import { toast } from "sonner";

// Mock data
const mockPlans: TrainingPlan[] = [
  {
    id: "1",
    title: "ER-不胜任场景培训",
    planId: "LTP20143315077023498241",
    description: "培训ER处理不胜任场景",
    trainees: [{ name: "杨某" }],
    invitedCount: 1,
    participantCount: 1,
    status: "active",
  },
  {
    id: "2",
    title: "用于003期新销售AI陪练-第一天",
    planId: "LTP20131199512533162881",
    description: "用于003期新销售培训第一日练习...",
    trainees: [
      { name: "李格" },
      { name: "江宇" },
      { name: "张伟" },
      { name: "王芳" },
    ],
    invitedCount: 122,
    participantCount: 118,
    status: "active",
  },
  {
    id: "3",
    title: "用于003期新销售AI陪练-第二天",
    planId: "LTP20131235792425902081",
    description: "用于003期新销售培训第二天产品...",
    trainees: [{ name: "戴凌" }, { name: "杨江" }],
    invitedCount: 121,
    participantCount: 56,
    status: "active",
  },
  {
    id: "4",
    title: "汽车销售新员工培训计划",
    planId: "LTP20088341005877739521",
    description: "汽车销售新员工培训",
    trainees: [{ name: "白某" }],
    invitedCount: 1,
    participantCount: 1,
    status: "active",
  },
  {
    id: "5",
    title: "培训测试",
    planId: "LTP19980262385806950431",
    description: "测试",
    trainees: [
      { name: "t城" },
      { name: "j杨" },
      { name: "王某" },
      { name: "李某" },
    ],
    invitedCount: 7,
    participantCount: 7,
    status: "active",
  },
  {
    id: "6",
    title: "京东健康医用美护采销谈判",
    planId: "LTP20041119279139676161",
    description: "采销谈判测试",
    trainees: [{ name: "白晨" }, { name: "高某" }],
    invitedCount: 3,
    participantCount: 2,
    status: "active",
  },
  {
    id: "7",
    title: "物流",
    planId: "LTP19982273457485578241",
    description: "测试",
    trainees: [{ name: "妍某" }],
    invitedCount: 1,
    participantCount: 1,
    status: "inactive",
  },
  {
    id: "8",
    title: "【测试-培训测试】",
    planId: "LTP19985819484199731201",
    description: "测试",
    trainees: [{ name: "t妍" }, { name: "蜂妍" }],
    invitedCount: 4,
    participantCount: 4,
    status: "active",
  },
  {
    id: "9",
    title: "全量销售售卖多产品",
    planId: "LTP20014892410142269441",
    description: "用于全量销售售卖多产品练习使用",
    trainees: [
      { name: "王昊" },
      { name: "马亮" },
      { name: "张某" },
      { name: "李某" },
    ],
    invitedCount: 193,
    participantCount: 111,
    status: "active",
  },
  {
    id: "10",
    title: "低效销售提效陪练",
    planId: "LTP20016587073000202241",
    description: "该培训用于省区低效销售提效使用",
    trainees: [{ name: "毛马" }, { name: "郑N" }],
    invitedCount: 130,
    participantCount: 85,
    status: "active",
  },
];

export default function TrainingPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredPlans, setFilteredPlans] = useState(mockPlans);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

  const handleSearch = () => {
    let results = mockPlans;

    if (searchQuery) {
      results = results.filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.planId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      results = results.filter((plan) => plan.status === statusFilter);
    }

    setFilteredPlans(results);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setFilteredPlans(mockPlans);
  };

  const handleEdit = (plan: TrainingPlan) => {
    setEditingPlan(plan);
    setSheetOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setSheetOpen(true);
  };

  const handleInvite = (plan: TrainingPlan) => {
    toast.info(`邀请学员参加：${plan.title}`);
  };

  const handleCopyLink = (plan: TrainingPlan) => {
    navigator.clipboard.writeText(
      `https://training.example.com/join/${plan.planId}`
    );
    toast.success("邀请链接已复制到剪贴板");
  };

  const handleToggleStatus = (plan: TrainingPlan) => {
    const newStatus = plan.status === "active" ? "inactive" : "active";
    toast.success(
      `已${newStatus === "active" ? "开启" : "停用"}：${plan.title}`
    );
  };

  const handleSave = (data: Partial<TrainingPlan>) => {
    if (editingPlan) {
      toast.success("培训计划已更新");
    } else {
      toast.success("培训计划已创建");
    }
  };

  // Stats
  const totalPlans = mockPlans.length;
  const activePlans = mockPlans.filter((p) => p.status === "active").length;
  const totalInvited = mockPlans.reduce((sum, p) => sum + p.invitedCount, 0);
  const totalParticipants = mockPlans.reduce(
    (sum, p) => sum + p.participantCount,
    0
  );

  return (
    <DashboardLayout title="培训计划" description="管理和查看所有培训计划">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalPlans}</div>
              <p className="text-sm text-muted-foreground">全部计划</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {activePlans}
              </div>
              <p className="text-sm text-muted-foreground">进行中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalInvited}</div>
              <p className="text-sm text-muted-foreground">总邀请人数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <p className="text-sm text-muted-foreground">总参与人数</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                关键词搜索：
              </span>
              <Input
                placeholder="请输入关键词"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                状态：
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">开启</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              重置
            </Button>
            <Button size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-1" />
              查询
            </Button>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            新建培训计划
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <TrainingPlanTable
              plans={filteredPlans}
              onEdit={handleEdit}
              onInvite={handleInvite}
              onCopyLink={handleCopyLink}
              onToggleStatus={handleToggleStatus}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Sheet */}
      <TrainingPlanSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        plan={editingPlan}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
