import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface TrainingChapter {
  id: string;
  title: string;
  description: string | null;
  chapter_type: string | null;
  sort_order: number | null;
  duration_minutes: number | null;
  content_items?: string | null;
}

export interface TrainingPlan {
  id: string;
  title: string;
  planId: string;
  description: string;
  trainees: { name: string; avatar?: string }[];
  invitedCount: number;
  participantCount: number;
  status: "active" | "inactive";
  training_chapters?: TrainingChapter[];
}

interface TrainingPlanTableProps {
  plans: TrainingPlan[];
  onEdit: (plan: TrainingPlan) => void;
  onInvite: (plan: TrainingPlan) => void;
  onCopyLink: (plan: TrainingPlan) => void;
  onToggleStatus: (plan: TrainingPlan) => void;
}

export function TrainingPlanTable({
  plans,
  onEdit,
  onInvite,
  onCopyLink,
  onToggleStatus,
}: TrainingPlanTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(plans.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPlans = plans.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[160px]">计划名称</TableHead>
            <TableHead className="w-[200px]">计划ID</TableHead>
            <TableHead>培训计划描述</TableHead>
            <TableHead className="w-[120px]">学员</TableHead>
            <TableHead className="w-[100px] text-center">邀请人数</TableHead>
            <TableHead className="w-[100px] text-center">参与人数</TableHead>
            <TableHead className="w-[80px] text-center">状态</TableHead>
            <TableHead className="w-[200px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPlans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.title}</TableCell>
              <TableCell>
                <span className="text-primary font-mono text-sm">
                  {plan.planId}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {plan.description}
              </TableCell>
              <TableCell>
                <div className="flex -space-x-2">
                  {plan.trainees.slice(0, 3).map((trainee, index) => (
                    <Avatar
                      key={index}
                      className="h-8 w-8 border-2 border-background"
                    >
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {trainee.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {plan.trainees.length > 3 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs text-muted-foreground">
                      +{plan.trainees.length - 3}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">{plan.invitedCount}</TableCell>
              <TableCell className="text-center">
                {plan.participantCount}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={plan.status === "active" ? "default" : "secondary"}
                  className={
                    plan.status === "active"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : ""
                  }
                >
                  {plan.status === "active" ? "开启" : "停用"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => onInvite(plan)}
                  >
                    邀请
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => onCopyLink(plan)}
                  >
                    邀请链接
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => onEdit(plan)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => onToggleStatus(plan)}
                  >
                    {plan.status === "active" ? "停用" : "开启"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <p className="text-sm text-muted-foreground">
          共 {plans.length} 条记录，当前显示 {startIndex + 1}-
          {Math.min(endIndex, plans.length)} 条
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
