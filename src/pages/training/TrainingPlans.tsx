import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Input, Select, Button, Statistic, Row, Col, Spin } from "antd";
import { PlusOutlined, ReloadOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  TrainingPlanTable,
  type TrainingPlan,
} from "@/components/training/TrainingPlanTable";
import { TrainingPlanSheet } from "@/components/training/TrainingPlanSheet";
import { message } from "antd";
import { useTrainingPlans, useTogglePlanStatus } from "@/hooks/useTrainingPlans";

// Map database status to display status
function mapStatus(dbStatus: string | null): "active" | "inactive" {
  if (dbStatus === 'in_progress' || dbStatus === 'pending' || dbStatus === 'draft') {
    return 'active';
  }
  return 'inactive';
}

// Transform database data to table format
function transformToTableFormat(plans: ReturnType<typeof useTrainingPlans>['data']): TrainingPlan[] {
  if (!plans) return [];
  
  return plans.map((plan) => ({
    id: plan.id,
    title: plan.title,
    planId: `LTP${plan.id.slice(0, 20).replace(/-/g, '').toUpperCase()}`,
    description: plan.description || '',
    trainees: [],
    invitedCount: 0,
    participantCount: 0,
    status: mapStatus(plan.status),
    dbStatus: plan.status,
    chapterCount: plan.training_chapters?.length || 0,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
    training_chapters: plan.training_chapters?.map(ch => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      chapter_type: ch.chapter_type,
      sort_order: ch.sort_order,
      duration_minutes: ch.duration_minutes,
      content_items: (ch as any).content_items,
    })),
  }));
}

export default function TrainingPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

  const { data: plansData, isLoading, error } = useTrainingPlans();
  const toggleStatusMutation = useTogglePlanStatus();

  const allPlans = transformToTableFormat(plansData);

  // Filter plans based on search and status
  const filteredPlans = allPlans.filter((plan) => {
    const matchesSearch = !searchQuery || 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.planId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
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
    message.info(`邀请学员参加：${plan.title}`);
  };

  const handleCopyLink = (plan: TrainingPlan) => {
    navigator.clipboard.writeText(
      `https://training.example.com/join/${plan.planId}`
    );
    message.success("邀请链接已复制到剪贴板");
  };

  const handleToggleStatus = (plan: TrainingPlan & { dbStatus?: string | null }) => {
    toggleStatusMutation.mutate({
      id: plan.id,
      currentStatus: plan.dbStatus || 'draft',
    });
  };

  const handleSave = (data: Partial<TrainingPlan>) => {
    if (editingPlan) {
      message.success("培训计划已更新");
    } else {
      message.success("培训计划已创建");
    }
  };

  // Stats
  const totalPlans = allPlans.length;
  const activePlans = allPlans.filter((p) => p.status === "active").length;
  const totalInvited = allPlans.reduce((sum, p) => sum + p.invitedCount, 0);
  const totalParticipants = allPlans.reduce(
    (sum, p) => sum + p.participantCount,
    0
  );

  if (error) {
    return (
      <DashboardLayout title="培训计划" description="管理和查看所有培训计划">
        <div className="text-center py-12 text-red-500">
          加载失败: {error instanceof Error ? error.message : '未知错误'}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="培训计划" description="管理和查看所有培训计划">
      <div className="space-y-6">
        {/* Stats */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="全部计划" value={totalPlans} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="进行中"
                value={activePlans}
                valueStyle={{ color: "#3b82f6" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="总邀请人数" value={totalInvited} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="总参与人数" value={totalParticipants} />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                关键词搜索：
              </span>
              <Input
                placeholder="请输入关键词"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                状态：
              </span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                options={[
                  { value: "all", label: "全部状态" },
                  { value: "active", label: "开启" },
                  { value: "inactive", label: "停用" },
                ]}
              />
            </div>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建培训计划
          </Button>
        </div>

        {/* Table */}
        <Card bodyStyle={{ padding: 0 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
            </div>
          ) : (
            <TrainingPlanTable
              plans={filteredPlans}
              onEdit={handleEdit}
              onInvite={handleInvite}
              onCopyLink={handleCopyLink}
              onToggleStatus={handleToggleStatus}
            />
          )}
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
