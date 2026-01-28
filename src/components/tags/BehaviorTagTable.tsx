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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Plus, CheckCircle2, AlertCircle } from "lucide-react";

// Mock data
const behaviorTags = [
  {
    id: "tag-1",
    name: "清晰表达产品价值",
    domain: "沟通能力",
    cluster: "表达清晰",
    positions: ["物流销售", "客服", "药房营业员", "电商客服"],
    growthPath: { complete: true, levels: ["L1", "L2", "L3", "L4"] },
    status: "published",
    version: "v2",
    updatedBy: "张经理",
    updatedAt: "2024-01-15 14:30",
  },
  {
    id: "tag-2",
    name: "有效处理客户异议",
    domain: "问题解决",
    cluster: "方案制定",
    positions: ["物流销售", "客服"],
    growthPath: { complete: true, levels: ["L1", "L2", "L3", "L4"] },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-14 10:20",
  },
  {
    id: "tag-3",
    name: "主动挖掘客户需求",
    domain: "客户服务",
    cluster: "需求识别",
    positions: ["物流销售"],
    growthPath: { complete: false, levels: ["L1", "L2"] },
    status: "draft",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-16 09:15",
  },
  {
    id: "tag-4",
    name: "建立信任关系",
    domain: "客户服务",
    cluster: "关系维护",
    positions: ["物流销售", "药房营业员"],
    growthPath: { complete: true, levels: ["L1", "L2", "L3", "L4"] },
    status: "disabled",
    version: "v3",
    updatedBy: "张经理",
    updatedAt: "2024-01-10 16:45",
  },
  {
    id: "tag-5",
    name: "团队信息及时同步",
    domain: "团队协作",
    cluster: "信息共享",
    positions: ["物流销售", "客服", "药房营业员"],
    growthPath: { complete: true, levels: ["L1", "L2", "L3", "L4"] },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-13 11:30",
  },
];

const statusConfig = {
  draft: { label: "草稿", variant: "secondary" as const },
  published: { label: "已发布", variant: "default" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

interface BehaviorTagTableProps {
  onViewTag: (tagId: string) => void;
  onNewTag: () => void;
  selectedDomain: string | null;
  selectedCluster: string | null;
}

export function BehaviorTagTable({
  onViewTag,
  onNewTag,
  selectedDomain,
  selectedCluster,
}: BehaviorTagTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标签名 / 别名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-8"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="一级能力" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">全部一级能力</SelectItem>
              <SelectItem value="communication">沟通能力</SelectItem>
              <SelectItem value="problem">问题解决</SelectItem>
              <SelectItem value="service">客户服务</SelectItem>
              <SelectItem value="team">团队协作</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="二级能力" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">全部二级能力</SelectItem>
              <SelectItem value="express">表达清晰</SelectItem>
              <SelectItem value="listen">倾听理解</SelectItem>
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
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="适用岗位" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">全部岗位</SelectItem>
              <SelectItem value="sales">物流销售</SelectItem>
              <SelectItem value="cs">客服</SelectItem>
              <SelectItem value="pharmacy">药房营业员</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onNewTag}>
            <Plus className="mr-1 h-4 w-4" />
            新增技能标签
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>一级能力</TableHead>
              <TableHead>二级能力</TableHead>
              <TableHead>适用岗位</TableHead>
              <TableHead>成长路径</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>版本</TableHead>
              <TableHead>最近更新</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {behaviorTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.domain}</TableCell>
                <TableCell>{tag.cluster}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tag.positions.slice(0, 3).map((pos) => (
                      <Badge key={pos} variant="secondary" className="text-xs">
                        {pos}
                      </Badge>
                    ))}
                    {tag.positions.length > 3 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="text-xs">
                              +{tag.positions.length - 3}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tag.positions.slice(3).join("、")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {tag.growthPath.complete ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {tag.growthPath.levels.join("-")}
                    </span>
                  </div>
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
                      onClick={() => onViewTag(tag.id)}
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
                    {tag.status === "disabled" && (
                      <Button variant="link" size="sm" className="h-auto p-0">
                        版本记录
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
