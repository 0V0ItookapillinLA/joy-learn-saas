import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for task tags - now includes more variety for different positions/domains
const taskTags = [
  // 物流销售 - 销售流程 - 客户获取
  {
    id: "task-1",
    name: "客户开发",
    position: "物流销售",
    domain: "销售流程",
    cluster: "客户获取",
    growthPath: { complete: true, currentLevel: "P10", maxLevel: "P15" },
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
    id: "task-1-2",
    name: "线索筛选",
    position: "物流销售",
    domain: "销售流程",
    cluster: "客户获取",
    growthPath: { complete: true, currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-14 11:00",
    definition: "对获取的客户线索进行评估和筛选，确定优先跟进顺序。",
    triggerConditions: ["新线索入库", "线索批量导入", "活动线索分配"],
    successCriteria: ["线索分级完成", "优先级排序", "分配到责任人"],
    keySteps: ["线索收集", "信息核实", "价值评估", "优先排序"],
    riskPoints: ["线索过期", "信息不准确"],
    relatedBehaviorTags: ["系统性分析问题", "快速定位问题根因"],
  },
  {
    id: "task-1-3",
    name: "陌生拜访",
    position: "物流销售",
    domain: "销售流程",
    cluster: "客户获取",
    growthPath: { complete: false, currentLevel: "P5", maxLevel: "P15" },
    status: "draft",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-13 09:00",
    definition: "主动拜访潜在客户，建立初步联系并了解业务需求。",
    triggerConditions: ["区域开发计划", "新市场拓展", "竞品客户转化"],
    successCriteria: ["获取联系方式", "了解业务现状", "建立初步信任"],
    keySteps: ["前期准备", "开场白", "需求探询", "价值传递", "后续约定"],
    riskPoints: ["被拒绝", "无法找到决策人"],
    relatedBehaviorTags: ["建立信任关系", "清晰表达产品价值"],
  },
  // 物流销售 - 销售流程 - 需求分析
  {
    id: "task-4",
    name: "需求分析",
    position: "物流销售",
    domain: "销售流程",
    cluster: "需求分析",
    growthPath: { complete: true, currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-12 11:00",
    definition: "深入了解客户的物流需求，分析痛点并提供针对性解决方案。",
    triggerConditions: ["客户表达需求", "首次拜访", "需求变更"],
    successCriteria: ["需求清晰记录", "客户确认理解", "方案匹配度高"],
    keySteps: ["需求收集", "痛点分析", "需求确认", "方案匹配"],
    riskPoints: ["需求理解偏差", "遗漏关键需求"],
    relatedBehaviorTags: ["主动挖掘客户需求", "清晰表达产品价值"],
  },
  {
    id: "task-4-2",
    name: "痛点诊断",
    position: "物流销售",
    domain: "销售流程",
    cluster: "需求分析",
    growthPath: { complete: true, currentLevel: "P11", maxLevel: "P15" },
    status: "published",
    version: "v2",
    updatedBy: "李主管",
    updatedAt: "2024-01-11 15:00",
    definition: "识别客户在物流环节的核心痛点和改进空间。",
    triggerConditions: ["客户抱怨", "成本居高", "效率低下"],
    successCriteria: ["痛点清单", "优先级排序", "客户认可"],
    keySteps: ["现状调研", "数据分析", "问题归纳", "影响评估"],
    riskPoints: ["痛点遗漏", "判断错误"],
    relatedBehaviorTags: ["快速定位问题根因", "精准把握客户痛点"],
  },
  // 物流销售 - 销售流程 - 成交转化
  {
    id: "task-2",
    name: "报价谈判",
    position: "物流销售",
    domain: "销售流程",
    cluster: "成交转化",
    growthPath: { complete: true, currentLevel: "P12", maxLevel: "P15" },
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
    id: "task-2-2",
    name: "合同签订",
    position: "物流销售",
    domain: "销售流程",
    cluster: "成交转化",
    growthPath: { complete: true, currentLevel: "P9", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-10 14:00",
    definition: "完成合同条款确认和签署流程，确保双方权益。",
    triggerConditions: ["价格达成一致", "条款协商完成", "客户确认合作"],
    successCriteria: ["合同签署", "条款无争议", "付款条件明确"],
    keySteps: ["合同起草", "条款确认", "法务审核", "签署存档"],
    riskPoints: ["条款争议", "签署延迟"],
    relatedBehaviorTags: ["结构化表达观点", "建立信任关系"],
  },
  // 物流销售 - 客户维护 - 关系维护
  {
    id: "task-5",
    name: "客户回访",
    position: "物流销售",
    domain: "客户维护",
    cluster: "关系维护",
    growthPath: { complete: true, currentLevel: "P15", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-10 09:00",
    definition: "定期回访老客户，维护客户关系，挖掘二次销售机会。",
    triggerConditions: ["合同到期前", "定期回访计划", "客户反馈"],
    successCriteria: ["客户满意度提升", "续约意向明确", "新需求挖掘"],
    keySteps: ["回访准备", "满意度调查", "问题收集", "需求挖掘", "后续安排"],
    riskPoints: ["客户流失", "竞争对手介入"],
    relatedBehaviorTags: ["建立信任关系", "主动挖掘客户需求"],
  },
  {
    id: "task-5-2",
    name: "客情维护",
    position: "物流销售",
    domain: "客户维护",
    cluster: "关系维护",
    growthPath: { complete: true, currentLevel: "P10", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-09 11:00",
    definition: "通过日常关怀和节日问候维护客户关系。",
    triggerConditions: ["节假日", "客户生日", "重要纪念日"],
    successCriteria: ["客户感受到重视", "关系更加紧密"],
    keySteps: ["信息收集", "礼品准备", "问候传达", "反馈记录"],
    riskPoints: ["信息错误", "时机不当"],
    relatedBehaviorTags: ["建立信任关系", "团队信息及时同步"],
  },
  // 客服 - 服务流程 - 咨询解答
  {
    id: "task-6",
    name: "咨询解答",
    position: "客服",
    domain: "服务流程",
    cluster: "咨询解答",
    growthPath: { complete: true, currentLevel: "P7", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-11 14:00",
    definition: "快速准确地回答客户咨询，提供专业的服务信息。",
    triggerConditions: ["客户来电", "在线咨询", "邮件咨询"],
    successCriteria: ["问题解决", "客户满意", "一次性解决率"],
    keySteps: ["问题确认", "信息查询", "解答说明", "确认理解"],
    riskPoints: ["信息错误", "响应超时"],
    relatedBehaviorTags: ["清晰表达产品价值", "有效处理客户异议"],
  },
  {
    id: "task-6-2",
    name: "业务咨询",
    position: "客服",
    domain: "服务流程",
    cluster: "咨询解答",
    growthPath: { complete: true, currentLevel: "P8", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-10 10:00",
    definition: "解答客户关于业务流程、政策规定的咨询。",
    triggerConditions: ["业务咨询", "政策查询", "流程询问"],
    successCriteria: ["信息准确", "客户理解", "无后续投诉"],
    keySteps: ["需求确认", "政策查询", "清晰解答", "记录归档"],
    riskPoints: ["政策更新", "解答错误"],
    relatedBehaviorTags: ["简洁准确传递信息", "准确理解客户意图"],
  },
  // 客服 - 服务流程 - 问题解决
  {
    id: "task-3",
    name: "投诉处理",
    position: "客服",
    domain: "服务流程",
    cluster: "问题解决",
    growthPath: { complete: false, currentLevel: "P5", maxLevel: "P15" },
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
  {
    id: "task-3-2",
    name: "异常处理",
    position: "客服",
    domain: "服务流程",
    cluster: "问题解决",
    growthPath: { complete: true, currentLevel: "P9", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-08 16:00",
    definition: "处理物流过程中的异常情况，协调各方资源解决问题。",
    triggerConditions: ["物流延迟", "货物损坏", "信息错误"],
    successCriteria: ["异常解决", "客户获得补偿", "流程优化"],
    keySteps: ["异常确认", "原因分析", "方案制定", "执行跟进", "结果反馈"],
    riskPoints: ["处理延迟", "客户不满"],
    relatedBehaviorTags: ["快速定位问题根因", "制定可行解决方案"],
  },
  {
    id: "task-3-3",
    name: "工单升级",
    position: "客服",
    domain: "服务流程",
    cluster: "问题解决",
    growthPath: { complete: true, currentLevel: "P6", maxLevel: "P15" },
    status: "published",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-07 11:00",
    definition: "将无法直接解决的问题升级至上级或专业部门处理。",
    triggerConditions: ["权限不足", "专业问题", "VIP客户"],
    successCriteria: ["升级及时", "信息完整", "跟进到位"],
    keySteps: ["问题评估", "信息整理", "升级提交", "进度跟进"],
    riskPoints: ["升级延迟", "信息遗漏"],
    relatedBehaviorTags: ["团队信息及时同步", "跨部门协调沟通"],
  },
];

const statusConfig = {
  draft: { label: "草稿", variant: "secondary" as const },
  published: { label: "已发布", variant: "default" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

// Position to domain mapping for tree filtering
const positionDomainMap: Record<string, string[]> = {
  "pos-1": ["domain-1-1", "domain-1-2"], // 物流销售
  "pos-2": ["domain-2-1"], // 客服
  "pos-3": ["domain-3-1"], // 药房营业员
};

const domainNameMap: Record<string, string> = {
  "domain-1-1": "销售流程",
  "domain-1-2": "客户维护",
  "domain-2-1": "服务流程",
  "domain-3-1": "销售服务",
};

const clusterNameMap: Record<string, string> = {
  "cluster-1-1-1": "客户获取",
  "cluster-1-1-2": "需求分析",
  "cluster-1-1-3": "成交转化",
  "cluster-1-2-1": "关系维护",
  "cluster-1-2-2": "续约管理",
  "cluster-2-1-1": "咨询解答",
  "cluster-2-1-2": "问题解决",
  "cluster-2-1-3": "投诉处理",
  "cluster-3-1-1": "用药咨询",
  "cluster-3-1-2": "产品推荐",
};

const positionNameMap: Record<string, string> = {
  "pos-1": "物流销售",
  "pos-2": "客服",
  "pos-3": "药房营业员",
};

interface TaskTagTableProps {
  selectedPosition: string;
  selectedDomain: string | null;
  selectedCluster: string | null;
}

interface TaskTagFormData {
  name: string;
  position: string;
  domain: string;
  cluster: string;
  definition: string;
  triggerConditions: string[];
  successCriteria: string[];
  keySteps: string[];
  riskPoints: string[];
  relatedBehaviorTags: string[];
}

export function TaskTagTable({
  selectedPosition,
  selectedDomain,
  selectedCluster,
}: TaskTagTableProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingTag, setViewingTag] = useState<typeof taskTags[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TaskTagFormData>({
    name: "",
    position: "物流销售",
    domain: "",
    cluster: "",
    definition: "",
    triggerConditions: [""],
    successCriteria: [""],
    keySteps: [""],
    riskPoints: [""],
    relatedBehaviorTags: [],
  });

  // Get position name from ID
  const getPositionName = (posId: string): string => {
    return positionNameMap[posId] || posId;
  };

  // Get domain name from ID
  const getDomainName = (domainId: string): string => {
    return domainNameMap[domainId] || "";
  };

  // Get cluster name from ID
  const getClusterName = (clusterId: string): string => {
    return clusterNameMap[clusterId] || "";
  };

  // Filter tags based on tree selection and other filters
  const filteredTags = taskTags.filter((tag) => {
    if (searchQuery && !tag.name.includes(searchQuery)) return false;
    if (statusFilter !== "all" && tag.status !== statusFilter) return false;
    
    // Filter by position
    const positionName = getPositionName(selectedPosition);
    if (positionName && tag.position !== positionName) return false;
    
    // Filter by domain if selected
    if (selectedDomain) {
      const domainName = getDomainName(selectedDomain);
      if (domainName && tag.domain !== domainName) return false;
    }
    
    // Filter by cluster if selected
    if (selectedCluster) {
      const clusterName = getClusterName(selectedCluster);
      if (clusterName && tag.cluster !== clusterName) return false;
    }
    
    return true;
  });

  const handleOpenNew = () => {
    setFormData({
      name: "",
      position: getPositionName(selectedPosition) || "物流销售",
      domain: selectedDomain ? getDomainName(selectedDomain) : "",
      cluster: selectedCluster ? getClusterName(selectedCluster) : "",
      definition: "",
      triggerConditions: [""],
      successCriteria: [""],
      keySteps: [""],
      riskPoints: [""],
      relatedBehaviorTags: [],
    });
    setIsEditing(true);
    setViewingTag(null);
  };

  const handleView = (tag: typeof taskTags[0]) => {
    setViewingTag(tag);
    setIsEditing(false);
  };

  const handleEdit = (tag: typeof taskTags[0]) => {
    setFormData({
      name: tag.name,
      position: tag.position,
      domain: tag.domain,
      cluster: tag.cluster,
      definition: tag.definition,
      triggerConditions: tag.triggerConditions.length > 0 ? tag.triggerConditions : [""],
      successCriteria: tag.successCriteria.length > 0 ? tag.successCriteria : [""],
      keySteps: tag.keySteps.length > 0 ? tag.keySteps : [""],
      riskPoints: tag.riskPoints.length > 0 ? tag.riskPoints : [""],
      relatedBehaviorTags: tag.relatedBehaviorTags,
    });
    setViewingTag(tag);
    setIsEditing(true);
  };

  const handleCloseSheet = () => {
    setViewingTag(null);
    setIsEditing(false);
  };

  const handleAddItem = (field: keyof TaskTagFormData) => {
    if (Array.isArray(formData[field])) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), ""],
      });
    }
  };

  const handleUpdateItem = (field: keyof TaskTagFormData, index: number, value: string) => {
    if (Array.isArray(formData[field])) {
      const newArray = [...(formData[field] as string[])];
      newArray[index] = value;
      setFormData({ ...formData, [field]: newArray });
    }
  };

  const handleRemoveItem = (field: keyof TaskTagFormData, index: number) => {
    if (Array.isArray(formData[field]) && (formData[field] as string[]).length > 1) {
      const newArray = (formData[field] as string[]).filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArray });
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "草稿已保存",
      description: "能力标签草稿已成功保存",
    });
    handleCloseSheet();
  };

  const handlePublish = () => {
    toast({
      title: "发布成功",
      description: "能力标签已发布",
    });
    handleCloseSheet();
  };

  return (
    <>
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
            <Button onClick={handleOpenNew}>
              <Plus className="mr-1 h-4 w-4" />
              新增能力标签
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">能力标签名</TableHead>
                <TableHead>岗位</TableHead>
                <TableHead>一级能力</TableHead>
                <TableHead>二级能力</TableHead>
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
                    <TableCell>{tag.position}</TableCell>
                    <TableCell>{tag.domain}</TableCell>
                    <TableCell>{tag.cluster}</TableCell>
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
                          onClick={() => handleView(tag)}
                        >
                          查看
                        </Button>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0"
                          onClick={() => handleEdit(tag)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-destructive"
                          onClick={() => toast({ title: "已删除", description: "标签已删除" })}
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

      {/* View/Edit Sheet */}
      <Sheet open={!!viewingTag || isEditing} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
          {isEditing ? (
            // Edit Mode
            <>
              <SheetHeader>
                <SheetTitle>{viewingTag ? "编辑能力标签" : "新建能力标签"}</SheetTitle>
                <SheetDescription>
                  {viewingTag ? "修改能力标签信息" : "创建新的专业能力标签"}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold border-b pb-2">基本信息</h4>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">标签名称 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="输入能力标签名称"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>适用岗位 *</Label>
                        <Select 
                          value={formData.position} 
                          onValueChange={(value) => setFormData({ ...formData, position: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择岗位" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="物流销售">物流销售</SelectItem>
                            <SelectItem value="客服">客服</SelectItem>
                            <SelectItem value="药房营业员">药房营业员</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>一级能力 *</Label>
                        <Select 
                          value={formData.domain} 
                          onValueChange={(value) => setFormData({ ...formData, domain: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择一级能力" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="销售流程">销售流程</SelectItem>
                            <SelectItem value="客户维护">客户维护</SelectItem>
                            <SelectItem value="服务流程">服务流程</SelectItem>
                            <SelectItem value="销售服务">销售服务</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>二级能力 *</Label>
                        <Select 
                          value={formData.cluster} 
                          onValueChange={(value) => setFormData({ ...formData, cluster: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择二级能力" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="客户获取">客户获取</SelectItem>
                            <SelectItem value="需求分析">需求分析</SelectItem>
                            <SelectItem value="成交转化">成交转化</SelectItem>
                            <SelectItem value="关系维护">关系维护</SelectItem>
                            <SelectItem value="咨询解答">咨询解答</SelectItem>
                            <SelectItem value="问题解决">问题解决</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>能力定义 *</Label>
                      <Textarea
                        value={formData.definition}
                        onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                        placeholder="描述该能力标签的定义..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Trigger Conditions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">触发条件</h4>
                  {formData.triggerConditions.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleUpdateItem("triggerConditions", idx, e.target.value)}
                        placeholder={`触发条件 ${idx + 1}`}
                      />
                      {formData.triggerConditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem("triggerConditions", idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem("triggerConditions")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加触发条件
                  </Button>
                </div>

                {/* Success Criteria */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">成功标准</h4>
                  {formData.successCriteria.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleUpdateItem("successCriteria", idx, e.target.value)}
                        placeholder={`成功标准 ${idx + 1}`}
                      />
                      {formData.successCriteria.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem("successCriteria", idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem("successCriteria")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加成功标准
                  </Button>
                </div>

                {/* Key Steps */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">关键步骤</h4>
                  {formData.keySteps.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleUpdateItem("keySteps", idx, e.target.value)}
                        placeholder={`步骤 ${idx + 1}`}
                      />
                      {formData.keySteps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem("keySteps", idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem("keySteps")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加关键步骤
                  </Button>
                </div>

                {/* Risk Points */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-destructive">风险点</h4>
                  {formData.riskPoints.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleUpdateItem("riskPoints", idx, e.target.value)}
                        placeholder={`风险点 ${idx + 1}`}
                      />
                      {formData.riskPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem("riskPoints", idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem("riskPoints")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加风险点
                  </Button>
                </div>
              </div>

              <SheetFooter className="mt-6 flex gap-2">
                <Button variant="outline" onClick={handleCloseSheet}>
                  取消
                </Button>
                <Button variant="secondary" onClick={handleSaveDraft}>
                  保存草稿
                </Button>
                <Button onClick={handlePublish}>
                  发布
                </Button>
              </SheetFooter>
            </>
          ) : viewingTag ? (
            // View Mode
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle className="text-xl">{viewingTag.name}</SheetTitle>
                  <Badge
                    variant={statusConfig[viewingTag.status as keyof typeof statusConfig].variant}
                  >
                    {statusConfig[viewingTag.status as keyof typeof statusConfig].label}
                  </Badge>
                  <Badge variant="outline">{viewingTag.version}</Badge>
                </div>
                <SheetDescription>
                  {viewingTag.position} · 一级能力: {viewingTag.domain} · 二级能力: {viewingTag.cluster}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">能力定义</h4>
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
                  <h4 className="mb-2 text-sm font-semibold">关联技能标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTag.relatedBehaviorTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={handleCloseSheet}>
                  关闭
                </Button>
                <Button onClick={() => handleEdit(viewingTag)}>
                  编辑
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
