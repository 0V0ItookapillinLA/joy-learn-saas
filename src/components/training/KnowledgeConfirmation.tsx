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
  Briefcase,
  BookOpen,
  Plus,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KnowledgeSearchModal, type KnowledgeItem as SearchKnowledgeItem } from "./KnowledgeSearchModal";

// 通用能力标签数据 - 与成长地图保持一致
const generalSkillTags = [
  {
    id: "tag-1",
    name: "清晰表达产品价值",
    level1: "沟通能力",
    level2: "表达清晰",
    growthPath: { currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["产品知识FAQ", "SPIN销售法则详解"],
  },
  {
    id: "tag-2",
    name: "结构化表达观点",
    level1: "沟通能力",
    level2: "表达清晰",
    growthPath: { currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["结构化表达技巧"],
  },
  {
    id: "tag-4",
    name: "准确理解客户意图",
    level1: "沟通能力",
    level2: "倾听理解",
    growthPath: { currentLevel: "P12", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["客户需求分析手册"],
  },
  {
    id: "tag-5",
    name: "捕捉关键信息要点",
    level1: "沟通能力",
    level2: "倾听理解",
    growthPath: { currentLevel: "P9", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: [],
  },
  {
    id: "tag-6",
    name: "有效处理客户异议",
    level1: "沟通能力",
    level2: "说服影响",
    growthPath: { currentLevel: "P11", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["异议处理话术手册"],
  },
  {
    id: "tag-7",
    name: "建立信任关系",
    level1: "沟通能力",
    level2: "说服影响",
    growthPath: { currentLevel: "P15", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["客户关系管理指南"],
  },
  {
    id: "tag-8",
    name: "快速定位问题根因",
    level1: "问题解决",
    level2: "分析诊断",
    growthPath: { currentLevel: "P7", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: [],
  },
  {
    id: "tag-10",
    name: "制定可行解决方案",
    level1: "问题解决",
    level2: "方案制定",
    growthPath: { currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["问题解决方法论"],
  },
  {
    id: "tag-11",
    name: "主动挖掘客户需求",
    level1: "客户服务",
    level2: "需求识别",
    growthPath: { currentLevel: "P3", maxLevel: "P15" },
    status: "draft",
    relatedKnowledge: ["客户拜访流程规范"],
  },
  {
    id: "tag-12",
    name: "精准把握客户痛点",
    level1: "客户服务",
    level2: "需求识别",
    growthPath: { currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["SPIN销售法则详解"],
  },
];

// 专业能力标签数据 - 与成长地图保持一致
const professionalSkillTags = [
  {
    id: "task-1",
    name: "客户开发",
    position: "物流销售",
    level1: "销售流程",
    level2: "客户获取",
    growthPath: { currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["电话销售话术手册", "客户拜访流程规范"],
  },
  {
    id: "task-1-2",
    name: "线索筛选",
    position: "物流销售",
    level1: "销售流程",
    level2: "客户获取",
    growthPath: { currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: [],
  },
  {
    id: "task-1-3",
    name: "陌生拜访",
    position: "物流销售",
    level1: "销售流程",
    level2: "客户获取",
    growthPath: { currentLevel: "P5", maxLevel: "P15" },
    status: "draft",
    relatedKnowledge: ["陌拜技巧指南"],
  },
  {
    id: "task-4",
    name: "需求分析",
    position: "物流销售",
    level1: "销售流程",
    level2: "需求分析",
    growthPath: { currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["SPIN销售法则详解"],
  },
  {
    id: "task-4-2",
    name: "痛点诊断",
    position: "物流销售",
    level1: "销售流程",
    level2: "需求分析",
    growthPath: { currentLevel: "P11", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: [],
  },
  {
    id: "task-2",
    name: "报价谈判",
    position: "物流销售",
    level1: "销售流程",
    level2: "成交转化",
    growthPath: { currentLevel: "P12", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["商务谈判技巧"],
  },
  {
    id: "task-5",
    name: "客户回访",
    position: "物流销售",
    level1: "客户维护",
    level2: "关系维护",
    growthPath: { currentLevel: "P15", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["客户关系管理指南"],
  },
  {
    id: "task-6",
    name: "咨询解答",
    position: "客服",
    level1: "服务流程",
    level2: "咨询解答",
    growthPath: { currentLevel: "P7", maxLevel: "P15" },
    status: "published",
    relatedKnowledge: ["常见问题解决方案库"],
  },
  {
    id: "task-3",
    name: "投诉处理",
    position: "客服",
    level1: "服务流程",
    level2: "问题解决",
    growthPath: { currentLevel: "P5", maxLevel: "P15" },
    status: "draft",
    relatedKnowledge: ["投诉处理流程规范", "客户满意度提升技巧"],
  },
];

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  selected: boolean;
}

export interface CompetencyDimension {
  id: string;
  name: string;
  description: string;
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

interface SkillTag {
  id: string;
  name: string;
  level1: string;
  level2: string;
  growthPath: { currentLevel: string; maxLevel: string };
  status: string;
  relatedKnowledge: string[];
  position?: string;
  selected: boolean;
}

interface GroupedSkills {
  [level1: string]: {
    [level2: string]: SkillTag[];
  };
}

interface KnowledgeConfirmationProps {
  context: DiscoveredContext;
  onConfirm: (context: DiscoveredContext) => void;
  onBack: () => void;
}

// 根据目标岗位筛选并组织标签
function getRelevantSkills(targetRole: string): { general: SkillTag[]; professional: SkillTag[] } {
  // 通用能力标签 - 根据岗位相关性筛选（这里简化为全部显示）
  const generalSkills: SkillTag[] = generalSkillTags.map(tag => ({
    ...tag,
    selected: tag.status === "published",
  }));

  // 专业能力标签 - 根据岗位筛选
  const roleMapping: Record<string, string[]> = {
    "销售代表": ["物流销售"],
    "客服专员": ["客服"],
    "项目经理": ["物流销售", "客服"],
    "业务岗位": ["物流销售", "客服"],
  };

  const relevantPositions = roleMapping[targetRole] || ["物流销售"];
  const professionalSkills: SkillTag[] = professionalSkillTags
    .filter(tag => relevantPositions.includes(tag.position))
    .map(tag => ({
      ...tag,
      selected: tag.status === "published",
    }));

  return { general: generalSkills, professional: professionalSkills };
}

// 按一级/二级能力分组
function groupSkillsByLevel(skills: SkillTag[]): GroupedSkills {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.level1]) {
      acc[skill.level1] = {};
    }
    if (!acc[skill.level1][skill.level2]) {
      acc[skill.level1][skill.level2] = [];
    }
    acc[skill.level1][skill.level2].push(skill);
    return acc;
  }, {} as GroupedSkills);
}

export function KnowledgeConfirmation({
  context: initialContext,
  onConfirm,
  onBack,
}: KnowledgeConfirmationProps) {
  const [context, setContext] = useState<DiscoveredContext>(initialContext);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "general",
    "professional",
    "knowledge",
  ]);
  const [expandedLevel1, setExpandedLevel1] = useState<string[]>([]);
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);

  // 获取与岗位相关的能力标签
  const { general: initialGeneral, professional: initialProfessional } = getRelevantSkills(context.targetRole);
  const [generalSkills, setGeneralSkills] = useState<SkillTag[]>(initialGeneral);
  const [professionalSkills, setProfessionalSkills] = useState<SkillTag[]>(initialProfessional);

  const groupedGeneral = groupSkillsByLevel(generalSkills);
  const groupedProfessional = groupSkillsByLevel(professionalSkills);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleLevel1 = (level1: string) => {
    setExpandedLevel1((prev) =>
      prev.includes(level1)
        ? prev.filter((l) => l !== level1)
        : [...prev, level1]
    );
  };

  const toggleGeneralSkill = (skillId: string) => {
    setGeneralSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, selected: !s.selected } : s
      )
    );
  };

  const toggleProfessionalSkill = (skillId: string) => {
    setProfessionalSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, selected: !s.selected } : s
      )
    );
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

  const selectedGeneralCount = generalSkills.filter((s) => s.selected).length;
  const selectedProfessionalCount = professionalSkills.filter((s) => s.selected).length;
  const selectedKnowledgeCount = context.relatedKnowledge.filter((k) => k.selected).length;

  // 渲染技能标签
  const renderSkillTag = (
    skill: SkillTag,
    onToggle: (id: string) => void
  ) => (
    <div
      key={skill.id}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer",
        skill.selected
          ? "bg-primary/5 border-primary/30"
          : "bg-muted/30 hover:bg-muted/50"
      )}
      onClick={() => onToggle(skill.id)}
    >
      <Checkbox
        checked={skill.selected}
        onCheckedChange={() => onToggle(skill.id)}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{skill.name}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {skill.status === "published" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-warning" />
        )}
        <Badge variant="outline" className="text-xs">
          {skill.growthPath.currentLevel}-{skill.growthPath.maxLevel}
        </Badge>
      </div>
    </div>
  );

  // 渲染分组的技能列表
  const renderGroupedSkills = (
    grouped: GroupedSkills,
    onToggle: (id: string) => void,
    sectionKey: string
  ) => (
    <div className="space-y-4">
      {Object.entries(grouped).map(([level1, level2Groups]) => (
        <Collapsible
          key={level1}
          open={expandedLevel1.includes(`${sectionKey}-${level1}`)}
          onOpenChange={() => toggleLevel1(`${sectionKey}-${level1}`)}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
            {expandedLevel1.includes(`${sectionKey}-${level1}`) ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">{level1}</span>
            <Badge variant="secondary" className="text-xs ml-auto">
              {Object.values(level2Groups).flat().filter(s => s.selected).length} / {Object.values(level2Groups).flat().length}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-6 space-y-3">
            {Object.entries(level2Groups).map(([level2, skills]) => (
              <div key={level2} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{level2}</span>
                  <span className="text-xs text-muted-foreground">
                    ({skills.filter(s => s.selected).length}/{skills.length})
                  </span>
                </div>
                <div className="grid gap-2">
                  {skills.map((skill) => renderSkillTag(skill, onToggle))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">确认培训内容范围</h2>
        <p className="text-muted-foreground">
          AI 已从成长地图中匹配以下能力标签，请确认或调整后继续生成培训计划
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
              <div className="text-sm text-muted-foreground mb-1">职级范围</div>
              <Badge variant="secondary" className="text-base">
                {context.roleLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Skills - 通用能力标签 */}
      <Card>
        <Collapsible
          open={expandedSections.includes("general")}
          onOpenChange={() => toggleSection("general")}
        >
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">通用能力标签</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    已选择 {selectedGeneralCount} / {generalSkills.length} 个标签
                  </p>
                </div>
              </div>
              {expandedSections.includes("general") ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6">
              {renderGroupedSkills(groupedGeneral, toggleGeneralSkill, "general")}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Professional Skills - 专业能力标签 */}
      <Card>
        <Collapsible
          open={expandedSections.includes("professional")}
          onOpenChange={() => toggleSection("professional")}
        >
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">专业能力标签</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    已选择 {selectedProfessionalCount} / {professionalSkills.length} 个标签 · {context.targetRole}
                  </p>
                </div>
              </div>
              {expandedSections.includes("professional") ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6">
              {renderGroupedSkills(groupedProfessional, toggleProfessionalSkill, "professional")}
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
