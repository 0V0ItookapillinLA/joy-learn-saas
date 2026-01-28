import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, History, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface BehaviorTagData {
  id: string;
  name: string;
  domain: string;
  cluster: string;
  positions: string[];
  growthPath: { complete: boolean; currentLevel: string; maxLevel: string };
  status: string;
  version: string;
  updatedBy: string;
  updatedAt: string;
}

interface BehaviorTagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: BehaviorTagData | null;
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
}

// Generate growth path levels based on range
const generateGrowthPathLevels = (startLevel: string, endLevel: string) => {
  const start = parseInt(startLevel.replace("P", ""));
  const end = parseInt(endLevel.replace("P", ""));
  const levels = [];
  
  const descriptions: Record<number, { description: string; keyPoints: string[] }> = {
    1: { description: "了解产品基本信息", keyPoints: ["熟悉产品名称", "了解基本功能"] },
    2: { description: "能够复述产品卖点", keyPoints: ["记住核心卖点", "基础话术运用"] },
    3: { description: "能够准确描述产品规格", keyPoints: ["参数熟练", "规格对比"] },
    4: { description: "掌握常见问题解答", keyPoints: ["FAQ熟练", "基础异议处理"] },
    5: { description: "能够识别客户类型", keyPoints: ["客户分类", "需求初判"] },
    6: { description: "能够匹配相应话术", keyPoints: ["话术匹配", "场景应用"] },
    7: { description: "能够处理简单异议", keyPoints: ["异议识别", "基础应对"] },
    8: { description: "能够突出客户相关价值点", keyPoints: ["价值提炼", "针对性表达"] },
    9: { description: "能够挖掘客户深层需求", keyPoints: ["深度提问", "需求分析"] },
    10: { description: "能够用价值语言回应", keyPoints: ["价值转化", "利益呈现"] },
    11: { description: "能够引导客户成交", keyPoints: ["成交技巧", "临门一脚"] },
    12: { description: "能够处理复杂异议", keyPoints: ["复杂异议", "多维应对"] },
    13: { description: "能够创造性组合产品价值", keyPoints: ["价值组合", "创新表达"] },
    14: { description: "能够形成个性化解决方案", keyPoints: ["方案定制", "个性服务"] },
    15: { description: "能够培训指导他人", keyPoints: ["经验传承", "团队赋能"] },
  };

  for (let i = start; i <= end; i++) {
    levels.push({
      level: `P${i}`,
      ...descriptions[i],
    });
  }
  
  return levels;
};

// Mock detailed data (signals, examples)
const mockDetailData = {
  aliases: ["产品价值表达", "价值传递"],
  definition: "能够准确、简洁地向客户传达产品的核心价值主张，使用客户易于理解的语言，并根据客户需求调整表达重点。",
  signals: {
    positive: [
      "使用客户易懂的语言",
      "突出与客户需求相关的价值点",
      "用数据或案例支撑价值主张",
    ],
    negative: [
      "过度使用专业术语",
      "只介绍功能不讲价值",
      "忽略客户反馈继续推销",
    ],
    evidencePrompt: "请从对话中提取员工描述产品价值的语句，分析是否使用了客户易懂的语言、是否关联了客户需求、是否有数据或案例支撑。",
  },
  positionExamples: [
    {
      position: "物流销售",
      scenario: "客户询问物流时效",
      positiveExample: "我们的次日达服务覆盖了您主要的发货区域，相比普通快递能帮您节省1-2天的配送时间，您的客户满意度会明显提升。",
      negativeExample: "我们有次日达、隔日达、经济件三种服务，次日达最快。",
      remarks: "强调客户利益而非产品特性",
    },
    {
      position: "客服",
      scenario: "客户投诉延迟",
      positiveExample: "非常理解您的心情。我已经帮您查到包裹目前在XX中转站，预计明天送达。为表歉意，我为您申请了一张10元运费券。",
      negativeExample: "您的包裹在路上了，请耐心等待。",
      remarks: "展示解决方案和补偿措施",
    },
  ],
  associatedStats: {
    practiceScenarios: 12,
    learningMapAbilities: 3,
  },
};

const statusConfig = {
  draft: { label: "草稿", variant: "secondary" as const },
  published: { label: "已发布", variant: "default" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

export function BehaviorTagDrawer({
  open,
  onOpenChange,
  tag,
  mode,
  onModeChange,
}: BehaviorTagDrawerProps) {
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);
  const [editData, setEditData] = useState({
    definition: mockDetailData.definition,
    aliases: mockDetailData.aliases,
    positiveSignals: mockDetailData.signals.positive,
    negativeSignals: mockDetailData.signals.negative,
    evidencePrompt: mockDetailData.signals.evidencePrompt,
  });

  // Generate growth path based on tag's range
  const growthPath = tag 
    ? generateGrowthPathLevels(tag.growthPath.currentLevel, tag.growthPath.maxLevel)
    : [];

  useEffect(() => {
    if (growthPath.length > 0) {
      setExpandedLevels([growthPath[0].level]);
    }
  }, [tag]);

  const toggleLevel = (level: string) => {
    setExpandedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  if (!tag) return null;

  const isEditing = mode === "edit";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">{tag.name}</SheetTitle>
            <Badge variant={statusConfig[tag.status as keyof typeof statusConfig]?.variant || "secondary"}>
              {statusConfig[tag.status as keyof typeof statusConfig]?.label || tag.status}
            </Badge>
            <Badge variant="outline">{tag.version}</Badge>
          </div>
          <SheetDescription>
            最近更新：{tag.updatedBy} · {tag.updatedAt}
          </SheetDescription>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {!isEditing ? (
            <>
              <Button size="sm" onClick={() => onModeChange("edit")}>编辑</Button>
              <Button size="sm" variant="outline">
                <History className="mr-1 h-4 w-4" />
                版本记录
              </Button>
              {tag.status === "published" && (
                <Button size="sm" variant="outline" className="text-destructive">
                  <XCircle className="mr-1 h-4 w-4" />
                  停用
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => onModeChange("view")}>取消</Button>
              <Button size="sm" variant="default">保存</Button>
            </>
          )}
        </div>

        <Separator className="my-6" />

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">基本信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">一级能力：</span>
              {tag.domain}
            </div>
            <div>
              <span className="text-muted-foreground">二级能力：</span>
              {tag.cluster}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">别名：</span>
              {isEditing ? (
                <Input 
                  value={editData.aliases.join("、")} 
                  onChange={(e) => setEditData({...editData, aliases: e.target.value.split("、")})}
                  className="mt-1"
                />
              ) : (
                mockDetailData.aliases.join("、")
              )}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">适用岗位：</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {tag.positions.map((pos) => (
                  <Badge key={pos} variant="secondary">
                    {pos}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">行为定义：</span>
            {isEditing ? (
              <Textarea 
                value={editData.definition}
                onChange={(e) => setEditData({...editData, definition: e.target.value})}
                className="mt-1"
                rows={3}
              />
            ) : (
              <p className="mt-1 text-sm">{mockDetailData.definition}</p>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Growth Path - Dynamic based on tag's range */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            成长路径 {tag.growthPath.currentLevel}-{tag.growthPath.maxLevel}
          </h3>
          <div className="space-y-2">
            {growthPath.map((level) => (
              <Collapsible
                key={level.level}
                open={expandedLevels.includes(level.level)}
                onOpenChange={() => toggleLevel(level.level)}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{level.level}</Badge>
                    <span className="text-sm">{level.description}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedLevels.includes(level.level) ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pt-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input placeholder="描述" defaultValue={level.description} />
                      <Input placeholder="评估要点" defaultValue={level.keyPoints.join("、")} />
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        评估要点：
                      </span>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">
                        {level.keyPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Observable Signals */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">可观察信号</h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-success">正向信号</span>
              {isEditing ? (
                <Textarea 
                  value={editData.positiveSignals.join("\n")}
                  onChange={(e) => setEditData({...editData, positiveSignals: e.target.value.split("\n")})}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                  {mockDetailData.signals.positive.map((signal, idx) => (
                    <li key={idx}>{signal}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <span className="text-xs font-medium text-destructive">负向信号</span>
              {isEditing ? (
                <Textarea 
                  value={editData.negativeSignals.join("\n")}
                  onChange={(e) => setEditData({...editData, negativeSignals: e.target.value.split("\n")})}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                  {mockDetailData.signals.negative.map((signal, idx) => (
                    <li key={idx}>{signal}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                证据提取提示
              </span>
              {isEditing ? (
                <Textarea 
                  value={editData.evidencePrompt}
                  onChange={(e) => setEditData({...editData, evidencePrompt: e.target.value})}
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="mt-1 rounded-md bg-muted p-2 text-sm">
                  {mockDetailData.signals.evidencePrompt}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Position Examples */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">岗位示例</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">岗位</TableHead>
                <TableHead className="w-[100px]">场景</TableHead>
                <TableHead>正例</TableHead>
                <TableHead>反例</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDetailData.positionExamples.map((example, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{example.position}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {example.scenario}
                  </TableCell>
                  <TableCell className="text-sm">{example.positiveExample}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {example.negativeExample}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator className="my-6" />

        {/* Associated Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">关联统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{mockDetailData.associatedStats.practiceScenarios}</div>
              <div className="text-sm text-muted-foreground">已绑定陪练场景</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{mockDetailData.associatedStats.learningMapAbilities}</div>
              <div className="text-sm text-muted-foreground">关联学习地图能力</div>
            </div>
          </div>
        </div>

        {isEditing && (
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => onModeChange("view")}>取消</Button>
            <Button>保存更改</Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
