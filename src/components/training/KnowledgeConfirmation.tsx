import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Target,
  Map,
  BookOpen,
  Pencil,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompetencyDimension {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  selected: boolean;
}

export interface DiscoveredContext {
  targetRole: string;
  roleLevel: string;
  competencyModel: {
    name: string;
    dimensions: CompetencyDimension[];
  };
  growthMapPath: string[];
  relatedKnowledge: KnowledgeItem[];
}

interface KnowledgeConfirmationProps {
  context: DiscoveredContext;
  onConfirm: (context: DiscoveredContext) => void;
  onBack: () => void;
}

export function KnowledgeConfirmation({
  context: initialContext,
  onConfirm,
  onBack,
}: KnowledgeConfirmationProps) {
  const [context, setContext] = useState<DiscoveredContext>(initialContext);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "competency",
    "growth",
    "knowledge",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleDimension = (dimensionId: string) => {
    setContext((prev) => ({
      ...prev,
      competencyModel: {
        ...prev.competencyModel,
        dimensions: prev.competencyModel.dimensions.map((d) =>
          d.id === dimensionId ? { ...d, selected: !d.selected } : d
        ),
      },
    }));
  };

  const toggleKnowledge = (knowledgeId: string) => {
    setContext((prev) => ({
      ...prev,
      relatedKnowledge: prev.relatedKnowledge.map((k) =>
        k.id === knowledgeId ? { ...k, selected: !k.selected } : k
      ),
    }));
  };

  const selectedDimensionsCount = context.competencyModel.dimensions.filter(
    (d) => d.selected
  ).length;
  const selectedKnowledgeCount = context.relatedKnowledge.filter(
    (k) => k.selected
  ).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">确认培训内容范围</h2>
        <p className="text-muted-foreground">
          AI 已识别以下内容，请确认或调整后继续生成培训计划
        </p>
      </div>

      {/* Target Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">目标岗位</div>
              <div className="font-semibold text-lg">{context.targetRole}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">职级</div>
              <Badge variant="secondary" className="text-base">
                {context.roleLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Model */}
      <Card>
        <Collapsible
          open={expandedSections.includes("competency")}
          onOpenChange={() => toggleSection("competency")}
        >
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">岗位能力模型</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {context.competencyModel.name} · 已选择 {selectedDimensionsCount} 个能力维度
                  </p>
                </div>
              </div>
              {expandedSections.includes("competency") ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6">
              <div className="grid gap-3">
                {context.competencyModel.dimensions.map((dimension) => (
                  <div
                    key={dimension.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      dimension.selected
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                    onClick={() => toggleDimension(dimension.id)}
                  >
                    <Checkbox
                      checked={dimension.selected}
                      onCheckedChange={() => toggleDimension(dimension.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{dimension.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {dimension.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Growth Map */}
      <Card>
        <Collapsible
          open={expandedSections.includes("growth")}
          onOpenChange={() => toggleSection("growth")}
        >
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Map className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">成长地图</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    推荐学习路径 · {context.growthMapPath.length} 个阶段
                  </p>
                </div>
              </div>
              {expandedSections.includes("growth") ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {context.growthMapPath.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="py-1.5 px-3 text-sm bg-background"
                    >
                      {step}
                    </Badge>
                    {index < context.growthMapPath.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Related Knowledge */}
      <Card>
        <Collapsible
          open={expandedSections.includes("knowledge")}
          onOpenChange={() => toggleSection("knowledge")}
        >
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">关联知识</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    已选择 {selectedKnowledgeCount} / {context.relatedKnowledge.length} 个知识项
                  </p>
                </div>
              </div>
              {expandedSections.includes("knowledge") ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6">
              <div className="grid gap-2">
                {context.relatedKnowledge.map((knowledge) => (
                  <div
                    key={knowledge.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      knowledge.selected
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                    onClick={() => toggleKnowledge(knowledge.id)}
                  >
                    <Checkbox
                      checked={knowledge.selected}
                      onCheckedChange={() => toggleKnowledge(knowledge.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{knowledge.title}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {knowledge.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          ← 返回修改输入
        </Button>
        <Button onClick={() => onConfirm(context)} size="lg" className="gap-2">
          确认并生成计划
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
