import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { ChevronDown, ExternalLink, History, Link2, XCircle } from "lucide-react";
import { useState } from "react";

interface BehaviorTagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagId: string | null;
}

// Mock data for the selected tag
const mockTagDetail = {
  id: "tag-1",
  name: "清晰表达产品价值",
  status: "published",
  version: "v2",
  domain: "沟通能力",
  cluster: "表达清晰",
  aliases: ["产品价值表达", "价值传递"],
  definition:
    "能够准确、简洁地向客户传达产品的核心价值主张，使用客户易于理解的语言，并根据客户需求调整表达重点。",
  positions: ["物流销售", "客服", "药房营业员", "电商客服"],
  updatedBy: "张经理",
  updatedAt: "2024-01-15 14:30",
  growthPath: [
    {
      level: "L1",
      title: "基础级",
      description: "能够背诵并复述产品的基本功能和卖点",
      keyPoints: ["熟悉产品基本功能", "能准确描述产品规格", "知道常见问题解答"],
    },
    {
      level: "L2",
      title: "熟练级",
      description: "能够根据客户类型调整表达方式，突出相关价值点",
      keyPoints: ["识别客户类型", "匹配相应话术", "处理简单异议"],
    },
    {
      level: "L3",
      title: "精通级",
      description: "能够挖掘客户深层需求，用价值语言回应，引导成交",
      keyPoints: ["深度需求挖掘", "价值场景化表达", "异议转化技巧"],
    },
    {
      level: "L4",
      title: "专家级",
      description: "能够创造性地组合产品价值，形成个性化解决方案",
      keyPoints: ["方案定制能力", "价值创新表达", "培训指导他人"],
    },
  ],
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
    evidencePrompt:
      "请从对话中提取员工描述产品价值的语句，分析是否使用了客户易懂的语言、是否关联了客户需求、是否有数据或案例支撑。",
  },
  positionExamples: [
    {
      position: "物流销售",
      scenario: "客户询问物流时效",
      positiveExample:
        "我们的次日达服务覆盖了您主要的发货区域，相比普通快递能帮您节省1-2天的配送时间，您的客户满意度会明显提升。",
      negativeExample:
        "我们有次日达、隔日达、经济件三种服务，次日达最快。",
      remarks: "强调客户利益而非产品特性",
    },
    {
      position: "客服",
      scenario: "客户投诉延迟",
      positiveExample:
        "非常理解您的心情。我已经帮您查到包裹目前在XX中转站，预计明天送达。为表歉意，我为您申请了一张10元运费券。",
      negativeExample: "您的包裹在路上了，请耐心等待。",
      remarks: "展示解决方案和补偿措施",
    },
  ],
  associatedStats: {
    practiceScenarios: 12,
    learningMapAbilities: 3,
  },
};

export function BehaviorTagDrawer({
  open,
  onOpenChange,
  tagId,
}: BehaviorTagDrawerProps) {
  const [expandedLevels, setExpandedLevels] = useState<string[]>(["L1"]);

  const tag = mockTagDetail;

  const toggleLevel = (level: string) => {
    setExpandedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const statusConfig = {
    draft: { label: "草稿", variant: "secondary" as const },
    published: { label: "已发布", variant: "default" as const },
    disabled: { label: "停用", variant: "outline" as const },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">{tag.name}</SheetTitle>
            <Badge variant={statusConfig[tag.status as keyof typeof statusConfig].variant}>
              {statusConfig[tag.status as keyof typeof statusConfig].label}
            </Badge>
            <Badge variant="outline">{tag.version}</Badge>
          </div>
          <SheetDescription>
            最近更新：{tag.updatedBy} · {tag.updatedAt}
          </SheetDescription>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {tag.status === "published" && (
            <>
              <Button size="sm">创建新版本</Button>
              <Button size="sm" variant="outline">
                <Link2 className="mr-1 h-4 w-4" />
                关联学习地图能力
              </Button>
              <Button size="sm" variant="outline">
                <History className="mr-1 h-4 w-4" />
                版本记录
              </Button>
              <Button size="sm" variant="outline" className="text-destructive">
                <XCircle className="mr-1 h-4 w-4" />
                停用
              </Button>
            </>
          )}
          {tag.status === "draft" && (
            <>
              <Button size="sm">编辑</Button>
              <Button size="sm" variant="secondary">
                发布
              </Button>
              <Button size="sm" variant="outline" className="text-destructive">
                停用
              </Button>
            </>
          )}
        </div>

        <Separator className="my-6" />

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">基本信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">行为域：</span>
              {tag.domain}
            </div>
            <div>
              <span className="text-muted-foreground">行为簇：</span>
              {tag.cluster}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">别名：</span>
              {tag.aliases.join("、")}
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
            <p className="mt-1 text-sm">{tag.definition}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Growth Path */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">成长路径 L1-L4</h3>
          {tag.growthPath.map((level) => (
            <Collapsible
              key={level.level}
              open={expandedLevels.includes(level.level)}
              onOpenChange={() => toggleLevel(level.level)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{level.level}</Badge>
                  <span className="font-medium">{level.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedLevels.includes(level.level) ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pt-2">
                <p className="text-sm text-muted-foreground">{level.description}</p>
                <div className="mt-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    评估要点：
                  </span>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                    {level.keyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Observable Signals */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">可观察信号</h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-success">正向信号</span>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                {tag.signals.positive.map((signal, idx) => (
                  <li key={idx}>{signal}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-medium text-destructive">负向信号</span>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                {tag.signals.negative.map((signal, idx) => (
                  <li key={idx}>{signal}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                证据提取提示
              </span>
              <p className="mt-1 rounded-md bg-muted p-2 text-sm">
                {tag.signals.evidencePrompt}
              </p>
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
              {tag.positionExamples.map((example, idx) => (
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
              <div className="text-2xl font-bold">{tag.associatedStats.practiceScenarios}</div>
              <div className="text-sm text-muted-foreground">已绑定陪练场景</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{tag.associatedStats.learningMapAbilities}</div>
              <div className="text-sm text-muted-foreground">关联学习地图能力</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
