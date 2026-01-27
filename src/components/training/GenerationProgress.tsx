import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  Map,
  BookOpen,
  FileText,
  MessageSquare,
  ClipboardCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export interface GenerationStep {
  id: string;
  label: string;
  icon: typeof Search;
  status: "pending" | "active" | "completed";
}

interface GenerationProgressProps {
  phase: "searching" | "generating";
  progress: number;
  currentStep?: string;
}

const SEARCH_STEPS: GenerationStep[] = [
  { id: "match-role", label: "匹配目标用户岗位职级", icon: Users, status: "pending" },
  { id: "explore-map", label: "探索成长地图", icon: Map, status: "pending" },
  { id: "search-knowledge", label: "搜索相关知识", icon: BookOpen, status: "pending" },
];

const GENERATE_STEPS: GenerationStep[] = [
  { id: "create-lesson", label: "根据知识创建课程", icon: FileText, status: "pending" },
  { id: "create-practice", label: "根据知识创建情景模拟", icon: MessageSquare, status: "pending" },
  { id: "create-assessment", label: "根据知识创建考试", icon: ClipboardCheck, status: "pending" },
];

export function GenerationProgress({
  phase,
  progress,
  currentStep,
}: GenerationProgressProps) {
  const steps = phase === "searching" ? SEARCH_STEPS : GENERATE_STEPS;
  
  const getStepStatus = (stepId: string, index: number): "pending" | "active" | "completed" => {
    const stepProgress = ((index + 1) / steps.length) * 100;
    if (progress >= stepProgress) return "completed";
    if (currentStep === stepId || (progress > (index / steps.length) * 100 && progress < stepProgress)) {
      return "active";
    }
    return "pending";
  };

  return (
    <Card className="shadow-xl border-0 bg-card overflow-hidden">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {phase === "searching" ? "AI 正在分析培训需求..." : "培训计划生成中..."}
          </h3>
          <p className="text-muted-foreground">
            {phase === "searching"
              ? "正在匹配岗位能力模型和相关知识"
              : "正在根据知识库生成学练考内容"}
          </p>
        </div>

        <Progress value={progress} className="h-2 mb-8" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, index);
            const StepIcon = step.icon;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-all duration-300",
                  status === "active" && "bg-primary/5",
                  status === "completed" && "bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    status === "pending" && "bg-muted text-muted-foreground",
                    status === "active" && "bg-primary/20 text-primary",
                    status === "completed" && "bg-primary text-primary-foreground"
                  )}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : status === "active" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium transition-colors",
                    status === "pending" && "text-muted-foreground",
                    status === "active" && "text-foreground",
                    status === "completed" && "text-foreground"
                  )}
                >
                  {step.label}
                </span>
                {status === "active" && (
                  <Badge variant="secondary" className="ml-auto animate-pulse">
                    进行中
                  </Badge>
                )}
                {status === "completed" && (
                  <Badge className="ml-auto bg-primary/10 text-primary border-0">
                    完成
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
