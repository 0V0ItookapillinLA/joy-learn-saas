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

interface TaskTagData {
  id: string;
  name: string;
  position: string;
  domain: string;
  cluster: string;
  growthPath: { complete: boolean; currentLevel: string; maxLevel: string };
  status: string;
  version: string;
  updatedBy: string;
  updatedAt: string;
}

interface TaskTagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TaskTagData | null;
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
}

// Generate growth path levels based on range
const generateGrowthPathLevels = (startLevel: string, endLevel: string) => {
  const start = parseInt(startLevel.replace("P", ""));
  const end = parseInt(endLevel.replace("P", ""));
  const levels = [];
  
  const descriptions: Record<number, { description: string; keyPoints: string[] }> = {
    1: { description: "了解基础知识", keyPoints: ["熟悉基本概念", "了解工作流程"] },
    2: { description: "能够独立执行简单任务", keyPoints: ["独立完成基础任务", "遵循标准流程"] },
    3: { description: "熟练掌握标准流程", keyPoints: ["流程熟练", "效率达标"] },
    4: { description: "能够处理常见问题", keyPoints: ["问题识别", "基础解决"] },
    5: { description: "掌握进阶技巧", keyPoints: ["技巧运用", "效率提升"] },
    6: { description: "能够优化工作方法", keyPoints: ["方法优化", "流程改进"] },
    7: { description: "能够指导他人", keyPoints: ["经验传授", "问题解答"] },
    8: { description: "能够制定标准", keyPoints: ["标准制定", "规范建立"] },
    9: { description: "能够创新突破", keyPoints: ["创新方法", "突破瓶颈"] },
    10: { description: "能够引领变革", keyPoints: ["战略规划", "变革推动"] },
    11: { description: "能够培养团队", keyPoints: ["团队建设", "人才培养"] },
    12: { description: "能够跨领域整合", keyPoints: ["资源整合", "跨界协作"] },
    13: { description: "能够战略布局", keyPoints: ["战略思维", "长远规划"] },
    14: { description: "能够行业引领", keyPoints: ["行业标杆", "趋势把握"] },
    15: { description: "能够生态构建", keyPoints: ["生态建设", "价值创造"] },
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
  aliases: ["任务执行", "流程操作"],
  definition: "能够按照标准流程完成指定任务，确保工作质量和效率达到要求。",
  signals: {
    positive: [
      "按照标准流程执行",
      "主动确认关键节点",
      "及时反馈进度和问题",
    ],
    negative: [
      "跳过关键步骤",
      "忽略质量检查",
      "延迟反馈问题",
    ],
    evidencePrompt: "请从工作记录中提取任务执行的关键节点，分析是否按流程执行、是否有主动反馈、是否达成预期结果。",
  },
  positionExamples: [
    {
      position: "物流销售",
      scenario: "客户订单处理",
      positiveExample: "收到订单后第一时间确认库存和配送时效，主动告知客户预计送达时间，并在发货后推送物流信息。",
      negativeExample: "收到订单后直接下单，没有确认库存，导致缺货延迟。",
      remarks: "强调主动沟通和流程规范",
    },
    {
      position: "客服",
      scenario: "工单处理",
      positiveExample: "接到工单后2小时内响应，明确问题类型后按SOP处理，处理完毕后回访确认客户满意。",
      negativeExample: "工单堆积未处理，没有按优先级排序。",
      remarks: "强调响应时效和闭环处理",
    },
  ],
  associatedStats: {
    practiceScenarios: 8,
    learningMapAbilities: 2,
  },
};

const statusConfig = {
  draft: { label: "草稿", variant: "secondary" as const },
  published: { label: "已发布", variant: "default" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

export function TaskTagDrawer({
  open,
  onOpenChange,
  tag,
  mode,
  onModeChange,
}: TaskTagDrawerProps) {
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

        {/* Basic Info - 注意：没有"适用岗位"字段 */}
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
