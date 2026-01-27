import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KnowledgeSearchModal, type KnowledgeItem as SearchKnowledgeItem } from "./KnowledgeSearchModal";

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

// Growth map level interface
interface GrowthLevel {
  id: string;
  level: string;
  name: string;
  dimensions: string[];
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

// Generate P1-P10 growth levels with competency dimensions
const generateGrowthLevels = (baseDimensions: CompetencyDimension[]): GrowthLevel[] => {
  const levelNames = [
    { level: "P1", name: "新人入门", defaultDimensions: ["基础认知", "学习能力"] },
    { level: "P2", name: "基础应用", defaultDimensions: ["基础操作", "规范执行"] },
    { level: "P3", name: "熟练掌握", defaultDimensions: ["独立工作", "问题处理"] },
    { level: "P4", name: "独立工作", defaultDimensions: ["复杂任务", "质量保障"] },
    { level: "P5", name: "技术骨干", defaultDimensions: ["疑难解决", "知识传承"] },
    { level: "P6", name: "领域专家", defaultDimensions: ["专业深度", "方法创新"] },
    { level: "P7", name: "技术领导", defaultDimensions: ["技术决策", "团队指导"] },
    { level: "P8", name: "资深专家", defaultDimensions: ["体系建设", "行业影响"] },
    { level: "P9", name: "首席专家", defaultDimensions: ["战略规划", "标准制定"] },
    { level: "P10", name: "行业领袖", defaultDimensions: ["行业引领", "生态建设"] },
  ];

  return levelNames.map((ln, index) => ({
    id: `level-${index + 1}`,
    level: ln.level,
    name: ln.name,
    dimensions: index < 4 
      ? ln.defaultDimensions.concat(baseDimensions.slice(0, 2).map(d => d.name))
      : ln.defaultDimensions,
    selected: index < 3, // Default select first 3 levels
  }));
};

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
  const [growthLevels, setGrowthLevels] = useState<GrowthLevel[]>(() => 
    generateGrowthLevels(initialContext.competencyModel.dimensions)
  );
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);

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

  const removeKnowledge = (knowledgeId: string) => {
    setContext((prev) => ({
      ...prev,
      relatedKnowledge: prev.relatedKnowledge.filter((k) => k.id !== knowledgeId),
    }));
  };

  const toggleGrowthLevel = (levelId: string) => {
    setGrowthLevels((prev) =>
      prev.map((l) =>
        l.id === levelId ? { ...l, selected: !l.selected } : l
      )
    );
  };

  const handleAddKnowledge = (items: SearchKnowledgeItem[]) => {
    const newKnowledge: KnowledgeItem[] = items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      selected: true,
    }));
    
    setContext((prev) => ({
      ...prev,
      relatedKnowledge: [
        ...prev.relatedKnowledge,
        ...newKnowledge.filter(nk => !prev.relatedKnowledge.some(rk => rk.id === nk.id))
      ],
    }));
  };

  const selectedDimensionsCount = context.competencyModel.dimensions.filter(
    (d) => d.selected
  ).length;
  const selectedKnowledgeCount = context.relatedKnowledge.filter(
    (k) => k.selected
  ).length;
  const selectedLevelsCount = growthLevels.filter((l) => l.selected).length;

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

      {/* Growth Map - P1-P10 Levels */}
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
                    已选择 {selectedLevelsCount} 个职级 · 点击选择要生成的职级范围
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {growthLevels.map((level) => (
                  <div
                    key={level.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      level.selected
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                    onClick={() => toggleGrowthLevel(level.id)}
                  >
                    <Checkbox
                      checked={level.selected}
                      onCheckedChange={() => toggleGrowthLevel(level.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={level.selected ? "default" : "secondary"} className="text-xs">
                          {level.level}
                        </Badge>
                        <span className="font-medium">{level.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {level.dimensions.map((dim, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-muted-foreground">
                            {dim}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer group",
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeKnowledge(knowledge.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Add Knowledge Button */}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setKnowledgeModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加知识
              </Button>
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

      {/* Knowledge Search Modal */}
      <KnowledgeSearchModal
        open={knowledgeModalOpen}
        onOpenChange={setKnowledgeModalOpen}
        onConfirm={handleAddKnowledge}
        initialSelected={context.relatedKnowledge.filter(k => k.selected).map(k => ({
          id: k.id,
          title: k.title,
          category: k.category,
        }))}
      />
    </div>
  );
}
