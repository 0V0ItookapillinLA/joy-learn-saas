import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Download } from "lucide-react";

// Mock data for task tags
const taskTags = [
  {
    id: "task-1",
    name: "客户开发",
    position: "物流销售",
    domain: "销售流程",
    cluster: "客户获取",
    behaviorTagCount: 5,
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-15 14:30",
    definition: "通过各种渠道识别潜在客户，进行初次接触并建立业务关系的完整流程。",
    triggerConditions: ["获得新客户线索", "收到客户咨询", "市场活动后跟进"],
    successCriteria: ["成功建立联系", "获取客户需求信息", "预约下次沟通"],
    keySteps: ["线索筛选", "初次联系", "需求了解", "价值呈现", "跟进安排"],
    riskPoints: ["联系方式错误", "客户拒绝沟通", "竞争对手抢先"],
    relatedBehaviorTags: ["清晰表达产品价值", "主动挖掘客户需求", "建立信任关系"],
  },
  {
    id: "task-2",
    name: "报价谈判",
    position: "物流销售",
    domain: "销售流程",
    cluster: "成交转化",
    behaviorTagCount: 4,
    status: "published",
    version: "v2",
    updatedBy: "李主管",
    updatedAt: "2024-01-14 10:20",
    definition: "根据客户需求制定报价方案，并通过谈判达成双方满意的合作条款。",
    triggerConditions: ["客户明确需求", "客户要求报价", "竞标项目"],
    successCriteria: ["达成价格共识", "签订合同", "客户满意度高"],
    keySteps: ["需求确认", "方案制定", "报价呈现", "异议处理", "条款协商"],
    riskPoints: ["报价过高流失", "利润压缩过大", "条款风险"],
    relatedBehaviorTags: ["有效处理客户异议", "清晰表达产品价值"],
  },
  {
    id: "task-3",
    name: "投诉处理",
    position: "客服",
    domain: "服务流程",
    cluster: "问题解决",
    behaviorTagCount: 6,
    status: "draft",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-16 09:15",
    definition: "接收客户投诉，快速响应并解决问题，恢复客户满意度。",
    triggerConditions: ["客户投诉", "负面评价", "升级工单"],
    successCriteria: ["问题解决", "客户撤诉", "满意度恢复"],
    keySteps: ["情绪安抚", "问题确认", "方案提供", "执行跟进", "满意确认"],
    riskPoints: ["情绪升级", "问题复杂化", "承诺无法兑现"],
    relatedBehaviorTags: ["有效处理客户异议", "建立信任关系", "团队信息及时同步"],
  },
];

const statusConfig = {
  draft: { label: "草稿", variant: "secondary" as const },
  published: { label: "已发布", variant: "default" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

interface TaskTagTableProps {
  selectedPosition: string;
  selectedDomain: string | null;
  selectedCluster: string | null;
}

export function TaskTagTable({
  selectedPosition,
  selectedDomain,
  selectedCluster,
}: TaskTagTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingTag, setViewingTag] = useState<typeof taskTags[0] | null>(null);

  const filteredTags = taskTags.filter((tag) => {
    if (searchQuery && !tag.name.includes(searchQuery)) return false;
    if (statusFilter !== "all" && tag.status !== statusFilter) return false;
    if (selectedPosition && tag.position !== selectedPosition) return false;
    return true;
  });

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="物流销售">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="适用岗位" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="物流销售">物流销售</SelectItem>
                <SelectItem value="客服">客服</SelectItem>
                <SelectItem value="药房营业员">药房营业员</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="任务域" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部域</SelectItem>
                <SelectItem value="sales">销售流程</SelectItem>
                <SelectItem value="service">服务流程</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="任务簇" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部簇</SelectItem>
                <SelectItem value="acquire">客户获取</SelectItem>
                <SelectItem value="convert">成交转化</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="disabled">停用</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[180px] pl-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              新增任务标签
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">任务标签名</TableHead>
                <TableHead>岗位</TableHead>
                <TableHead>任务域</TableHead>
                <TableHead>任务簇</TableHead>
                <TableHead>关联行为标签数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>最近更新</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell>{tag.position}</TableCell>
                  <TableCell>{tag.domain}</TableCell>
                  <TableCell>{tag.cluster}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tag.behaviorTagCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[tag.status as keyof typeof statusConfig].variant}>
                      {statusConfig[tag.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tag.version}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{tag.updatedBy}</div>
                      <div className="text-xs text-muted-foreground">{tag.updatedAt}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => setViewingTag(tag)}
                      >
                        查看
                      </Button>
                      {tag.status === "draft" && (
                        <>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            编辑
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-destructive"
                          >
                            停用
                          </Button>
                        </>
                      )}
                      {tag.status === "published" && (
                        <>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            创建新版本
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-destructive"
                          >
                            停用
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Drawer */}
      <Sheet open={!!viewingTag} onOpenChange={() => setViewingTag(null)}>
        <SheetContent className="w-[500px] overflow-y-auto sm:max-w-[500px]">
          {viewingTag && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle className="text-xl">{viewingTag.name}</SheetTitle>
                  <Badge
                    variant={
                      statusConfig[viewingTag.status as keyof typeof statusConfig].variant
                    }
                  >
                    {statusConfig[viewingTag.status as keyof typeof statusConfig].label}
                  </Badge>
                  <Badge variant="outline">{viewingTag.version}</Badge>
                </div>
                <SheetDescription>
                  {viewingTag.position} · {viewingTag.domain} · {viewingTag.cluster}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">任务定义</h4>
                  <p className="text-sm text-muted-foreground">{viewingTag.definition}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-sm font-semibold">触发条件</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {viewingTag.triggerConditions.map((condition, idx) => (
                      <li key={idx}>{condition}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">成功标准</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {viewingTag.successCriteria.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">关键步骤</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTag.keySteps.map((step, idx) => (
                      <Badge key={idx} variant="outline">
                        {idx + 1}. {step}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-destructive">风险点</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {viewingTag.riskPoints.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-sm font-semibold">关联行为标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTag.relatedBehaviorTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
