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
// Mock data - tags mapped to different clusters
const behaviorTags = [
  // 沟通能力 - 表达清晰
  {
    id: "tag-1",
    name: "清晰表达产品价值",
    domain: "沟通能力",
    cluster: "表达清晰",
    positions: ["物流销售", "客服", "药房营业员"],
    growthPath: { complete: true, currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    version: "v2",
    updatedBy: "张经理",
    updatedAt: "2024-01-15 14:30",
  },
  {
    id: "tag-2",
    name: "结构化表达观点",
    domain: "沟通能力",
    cluster: "表达清晰",
    positions: ["物流销售", "客服"],
    growthPath: { complete: true, currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-14 10:20",
  },
  {
    id: "tag-3",
    name: "简洁准确传递信息",
    domain: "沟通能力",
    cluster: "表达清晰",
    positions: ["客服", "药房营业员"],
    growthPath: { complete: false, currentLevel: "P5", maxLevel: "P15" },
    status: "draft",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-16 09:15",
  },
  // 沟通能力 - 倾听理解
  {
    id: "tag-4",
    name: "准确理解客户意图",
    domain: "沟通能力",
    cluster: "倾听理解",
    positions: ["物流销售", "客服"],
    growthPath: { complete: true, currentLevel: "P12", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-13 11:30",
  },
  {
    id: "tag-5",
    name: "捕捉关键信息要点",
    domain: "沟通能力",
    cluster: "倾听理解",
    positions: ["物流销售", "客服", "药房营业员"],
    growthPath: { complete: true, currentLevel: "P9", maxLevel: "P15" },
    status: "published",
    version: "v2",
    updatedBy: "李主管",
    updatedAt: "2024-01-12 14:00",
  },
  // 沟通能力 - 说服影响
  {
    id: "tag-6",
    name: "有效处理客户异议",
    domain: "沟通能力",
    cluster: "说服影响",
    positions: ["物流销售", "客服"],
    growthPath: { complete: true, currentLevel: "P11", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-11 16:00",
  },
  {
    id: "tag-7",
    name: "建立信任关系",
    domain: "沟通能力",
    cluster: "说服影响",
    positions: ["物流销售", "药房营业员"],
    growthPath: { complete: true, currentLevel: "P15", maxLevel: "P15" },
    status: "published",
    version: "v3",
    updatedBy: "李主管",
    updatedAt: "2024-01-10 16:45",
  },
  // 问题解决 - 分析诊断
  {
    id: "tag-8",
    name: "快速定位问题根因",
    domain: "问题解决",
    cluster: "分析诊断",
    positions: ["客服", "药房营业员"],
    growthPath: { complete: true, currentLevel: "P7", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-09 10:00",
  },
  {
    id: "tag-9",
    name: "系统性分析问题",
    domain: "问题解决",
    cluster: "分析诊断",
    positions: ["物流销售", "客服"],
    growthPath: { complete: false, currentLevel: "P4", maxLevel: "P15" },
    status: "draft",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-08 09:30",
  },
  // 问题解决 - 方案制定
  {
    id: "tag-10",
    name: "制定可行解决方案",
    domain: "问题解决",
    cluster: "方案制定",
    positions: ["物流销售", "客服", "药房营业员"],
    growthPath: { complete: true, currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    version: "v2",
    updatedBy: "李主管",
    updatedAt: "2024-01-07 15:00",
  },
  // 客户服务 - 需求识别
  {
    id: "tag-11",
    name: "主动挖掘客户需求",
    domain: "客户服务",
    cluster: "需求识别",
    positions: ["物流销售"],
    growthPath: { complete: false, currentLevel: "P3", maxLevel: "P15" },
    status: "draft",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-06 09:15",
  },
  {
    id: "tag-12",
    name: "精准把握客户痛点",
    domain: "客户服务",
    cluster: "需求识别",
    positions: ["物流销售", "客服"],
    growthPath: { complete: true, currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-05 11:00",
  },
  // 团队协作 - 信息共享
  {
    id: "tag-13",
    name: "团队信息及时同步",
    domain: "团队协作",
    cluster: "信息共享",
    positions: ["物流销售", "客服", "药房营业员"],
    growthPath: { complete: true, currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-04 11:30",
  },
  {
    id: "tag-14",
    name: "跨部门协调沟通",
    domain: "团队协作",
    cluster: "信息共享",
    positions: ["物流销售", "客服"],
    growthPath: { complete: true, currentLevel: "P13", maxLevel: "P15" },
    status: "published",
    version: "v2",
    updatedBy: "张经理",
    updatedAt: "2024-01-03 14:00",
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

  // Domain name mapping
  const domainNameMap: Record<string, string> = {
    "domain-1": "沟通能力",
    "domain-2": "问题解决",
    "domain-3": "客户服务",
    "domain-4": "团队协作",
  };

  // Cluster name mapping
  const clusterNameMap: Record<string, string> = {
    "cluster-1-1": "表达清晰",
    "cluster-1-2": "倾听理解",
    "cluster-1-3": "说服影响",
    "cluster-2-1": "分析诊断",
    "cluster-2-2": "方案制定",
    "cluster-2-3": "执行落地",
    "cluster-3-1": "需求识别",
    "cluster-3-2": "投诉处理",
    "cluster-3-3": "关系维护",
    "cluster-4-1": "信息共享",
    "cluster-4-2": "冲突处理",
    "cluster-4-3": "协同配合",
  };

  // Filter tags based on tree selection
  const filteredTags = behaviorTags.filter((tag) => {
    if (searchQuery && !tag.name.includes(searchQuery)) return false;
    if (statusFilter !== "all" && tag.status !== statusFilter) return false;
    
    // Filter by domain if selected
    if (selectedDomain) {
      const domainName = domainNameMap[selectedDomain];
      if (domainName && tag.domain !== domainName) return false;
    }
    
    // Filter by cluster if selected
    if (selectedCluster) {
      const clusterName = clusterNameMap[selectedCluster];
      if (clusterName && tag.cluster !== clusterName) return false;
    }
    
    return true;
  });
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex flex-wrap items-center gap-3">
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
              placeholder="搜索标签名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px] pl-8"
            />
          </div>
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
              <TableHead className="w-[200px]">标签名</TableHead>
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
            {filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  暂无数据，请选择其他分类或添加新标签
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>{tag.domain}</TableCell>
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
                      {tag.growthPath.currentLevel} / {tag.growthPath.maxLevel}
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
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => onViewTag(tag.id)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-destructive"
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
