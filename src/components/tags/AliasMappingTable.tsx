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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Download } from "lucide-react";
import { AliasMappingDrawer } from "./AliasMappingDrawer";

// Mock data
const aliasMappings = [
  {
    id: "mapping-1",
    position: "物流销售",
    term: "产品价值表达",
    termType: "alias",
    mappedTo: "清晰表达产品价值",
    mappedToType: "behavior",
    domain: "沟通能力",
    cluster: "表达清晰",
    priority: 1,
    status: "active",
    source: "manual",
    confidence: null,
    updatedBy: "张经理",
    updatedAt: "2024-01-15 14:30",
  },
  {
    id: "mapping-2",
    position: "物流销售",
    term: "价值传递",
    termType: "alias",
    mappedTo: "清晰表达产品价值",
    mappedToType: "behavior",
    domain: "沟通能力",
    cluster: "表达清晰",
    priority: 2,
    status: "active",
    source: "import",
    confidence: null,
    updatedBy: "系统导入",
    updatedAt: "2024-01-10 10:00",
  },
  {
    id: "mapping-3",
    position: "客服",
    term: "处理投诉",
    termType: "display",
    mappedTo: "有效处理客户异议",
    mappedToType: "behavior",
    domain: "问题解决",
    cluster: "方案制定",
    priority: 1,
    status: "active",
    source: "ai",
    confidence: 0.92,
    updatedBy: "AI 推荐",
    updatedAt: "2024-01-16 08:00",
  },
  {
    id: "mapping-4",
    position: "物流销售",
    term: "客户开拓",
    termType: "alias",
    mappedTo: "客户开发",
    mappedToType: "task",
    domain: "销售流程",
    cluster: "客户获取",
    priority: 1,
    status: "pending",
    source: "ai",
    confidence: 0.85,
    updatedBy: "AI 推荐",
    updatedAt: "2024-01-17 09:30",
  },
  {
    id: "mapping-5",
    position: "药房营业员",
    term: "用药指导",
    termType: "display",
    mappedTo: "用药咨询",
    mappedToType: "task",
    domain: "销售服务",
    cluster: "用药咨询",
    priority: 1,
    status: "conflict",
    source: "manual",
    confidence: null,
    updatedBy: "王培训",
    updatedAt: "2024-01-14 16:00",
  },
];

const statusConfig = {
  active: { label: "生效", variant: "default" as const },
  pending: { label: "待审核", variant: "secondary" as const },
  conflict: { label: "冲突", variant: "destructive" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

const sourceConfig = {
  manual: { label: "手动", variant: "outline" as const },
  import: { label: "导入", variant: "secondary" as const },
  ai: { label: "AI 推荐", variant: "default" as const },
};

const termTypeConfig = {
  alias: { label: "别名", variant: "secondary" as const },
  display: { label: "展示名", variant: "default" as const },
};

export function AliasMappingTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("by-term");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<typeof aliasMappings[0] | null>(null);

  const filteredMappings = aliasMappings.filter((mapping) => {
    if (searchQuery && !mapping.term.includes(searchQuery)) return false;
    if (statusFilter !== "all" && mapping.status !== statusFilter) return false;
    if (sourceFilter !== "all" && mapping.source !== sourceFilter) return false;
    if (activeTab === "pending" && mapping.status !== "pending" && mapping.status !== "conflict")
      return false;
    return true;
  });

  const handleViewEdit = (mapping: typeof aliasMappings[0]) => {
    setEditingMapping(mapping);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setEditingMapping(null);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Sub-tabs */}
        <div className="border-b px-4 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="by-term">按岗位术语</TabsTrigger>
              <TabsTrigger value="by-tag">按标准标签</TabsTrigger>
              <TabsTrigger value="pending">
                待审核 / 冲突
                <Badge variant="destructive" className="ml-2">
                  2
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="岗位" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部岗位</SelectItem>
                <SelectItem value="sales">物流销售</SelectItem>
                <SelectItem value="cs">客服</SelectItem>
                <SelectItem value="pharmacy">药房营业员</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="术语类型" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="alias">别名</SelectItem>
                <SelectItem value="display">展示名</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="映射对象类型" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="behavior">行为标签</SelectItem>
                <SelectItem value="task">专业任务标签</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="active">生效</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="conflict">冲突</SelectItem>
                <SelectItem value="disabled">停用</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="来源" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="manual">手动</SelectItem>
                <SelectItem value="import">导入</SelectItem>
                <SelectItem value="ai">AI 推荐</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索术语..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[160px] pl-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNew}>
              <Plus className="mr-1 h-4 w-4" />
              新增映射
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
                <TableHead>岗位</TableHead>
                <TableHead>岗位术语</TableHead>
                <TableHead>术语类型</TableHead>
                <TableHead>映射到</TableHead>
                <TableHead>所属域/簇</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>置信度</TableHead>
                <TableHead>更新人/时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>{mapping.position}</TableCell>
                  <TableCell className="font-medium">{mapping.term}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        termTypeConfig[mapping.termType as keyof typeof termTypeConfig].variant
                      }
                    >
                      {termTypeConfig[mapping.termType as keyof typeof termTypeConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span>{mapping.mappedTo}</span>
                      <Badge variant="outline" className="text-xs">
                        {mapping.mappedToType === "behavior" ? "行为" : "任务"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mapping.domain} / {mapping.cluster}
                  </TableCell>
                  <TableCell>{mapping.priority}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusConfig[mapping.status as keyof typeof statusConfig].variant}
                    >
                      {statusConfig[mapping.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sourceConfig[mapping.source as keyof typeof sourceConfig].variant}
                    >
                      {sourceConfig[mapping.source as keyof typeof sourceConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {mapping.confidence !== null ? (
                      <span className="text-sm">
                        {(mapping.confidence * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{mapping.updatedBy}</div>
                      <div className="text-xs text-muted-foreground">{mapping.updatedAt}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleViewEdit(mapping)}
                      >
                        {mapping.status === "pending" || mapping.status === "conflict"
                          ? "审核"
                          : "查看"}
                      </Button>
                      {mapping.status === "active" && (
                        <Button variant="link" size="sm" className="h-auto p-0">
                          编辑
                        </Button>
                      )}
                      {mapping.status !== "disabled" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-destructive"
                        >
                          停用
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

      <AliasMappingDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mapping={editingMapping}
      />
    </>
  );
}
