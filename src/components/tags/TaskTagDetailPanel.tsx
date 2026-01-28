import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, History, Send, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for task tags
const taskTagsData: Record<string, {
  id: string;
  name: string;
  position: string;
  domain: string;
  cluster: string;
  behaviorTagCount: number;
  status: "draft" | "published" | "disabled";
  version: string;
  updatedBy: string;
  updatedAt: string;
  definition: string;
  triggerConditions: string[];
  successCriteria: string[];
  keySteps: string[];
  riskPoints: string[];
  relatedBehaviorTags: string[];
}> = {
  "cluster-1-1-1": {
    id: "task-1",
    name: "客户获取",
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
  "cluster-1-1-2": {
    id: "task-4",
    name: "需求分析",
    position: "物流销售",
    domain: "销售流程",
    cluster: "需求分析",
    behaviorTagCount: 3,
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
  "cluster-1-1-3": {
    id: "task-2",
    name: "成交转化",
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
  "cluster-1-2-1": {
    id: "task-5",
    name: "关系维护",
    position: "物流销售",
    domain: "客户维护",
    cluster: "关系维护",
    behaviorTagCount: 2,
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
  "cluster-1-2-2": {
    id: "task-renewal",
    name: "续约管理",
    position: "物流销售",
    domain: "客户维护",
    cluster: "续约管理",
    behaviorTagCount: 3,
    status: "draft",
    version: "v1",
    updatedBy: "王培训",
    updatedAt: "2024-01-16 09:15",
    definition: "在合同到期前主动与客户沟通续约事宜，确保客户留存。",
    triggerConditions: ["合同到期前30天", "客户主动询问", "系统提醒"],
    successCriteria: ["续约成功", "客户满意度高", "条款优化"],
    keySteps: ["续约提醒", "客户沟通", "条款协商", "合同签订"],
    riskPoints: ["客户流失", "条款分歧"],
    relatedBehaviorTags: ["建立信任关系", "有效处理客户异议"],
  },
  "cluster-2-1-1": {
    id: "task-6",
    name: "咨询解答",
    position: "客服",
    domain: "服务流程",
    cluster: "咨询解答",
    behaviorTagCount: 4,
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
  "cluster-2-1-2": {
    id: "task-problem",
    name: "问题解决",
    position: "客服",
    domain: "服务流程",
    cluster: "问题解决",
    behaviorTagCount: 5,
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-13 10:00",
    definition: "针对客户遇到的问题，快速定位原因并提供解决方案。",
    triggerConditions: ["客户报告问题", "系统告警", "内部发现"],
    successCriteria: ["问题解决", "客户满意", "防止复发"],
    keySteps: ["问题确认", "原因分析", "方案制定", "执行解决", "验证确认"],
    riskPoints: ["问题升级", "解决延迟"],
    relatedBehaviorTags: ["有效处理客户异议", "团队信息及时同步"],
  },
  "cluster-2-1-3": {
    id: "task-3",
    name: "投诉处理",
    position: "客服",
    domain: "服务流程",
    cluster: "投诉处理",
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
  "cluster-3-1-1": {
    id: "task-pharmacy-1",
    name: "用药咨询",
    position: "药房营业员",
    domain: "销售服务",
    cluster: "用药咨询",
    behaviorTagCount: 6,
    status: "published",
    version: "v1",
    updatedBy: "张经理",
    updatedAt: "2024-01-15 14:30",
    definition: "为顾客提供专业的用药咨询服务，包括药品用法、用量、注意事项等。",
    triggerConditions: ["顾客询问", "购药时", "复诊咨询"],
    successCriteria: ["信息准确", "顾客理解", "安全用药"],
    keySteps: ["了解病情", "推荐药品", "用法说明", "注意事项", "确认理解"],
    riskPoints: ["信息错误", "药物禁忌", "过敏反应"],
    relatedBehaviorTags: ["清晰表达产品价值", "建立信任关系"],
  },
  "cluster-3-1-2": {
    id: "task-pharmacy-2",
    name: "产品推荐",
    position: "药房营业员",
    domain: "销售服务",
    cluster: "产品推荐",
    behaviorTagCount: 4,
    status: "published",
    version: "v1",
    updatedBy: "李主管",
    updatedAt: "2024-01-14 10:20",
    definition: "根据顾客需求推荐合适的药品或保健品。",
    triggerConditions: ["顾客询问", "主动推荐", "关联销售"],
    successCriteria: ["推荐合适", "顾客满意", "成交"],
    keySteps: ["需求了解", "产品匹配", "功效说明", "价格介绍", "成交"],
    riskPoints: ["推荐不当", "价格异议"],
    relatedBehaviorTags: ["主动挖掘客户需求", "清晰表达产品价值"],
  },
};

const statusConfig = {
  draft: { label: "草稿", variant: "secondary" as const },
  published: { label: "已发布", variant: "default" as const },
  disabled: { label: "停用", variant: "outline" as const },
};

interface TaskTagDetailPanelProps {
  selectedPosition: string | null;
  selectedDomain: string | null;
  selectedCluster: string | null;
}

interface FormData {
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

export function TaskTagDetailPanel({
  selectedPosition,
  selectedDomain,
  selectedCluster,
}: TaskTagDetailPanelProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    position: "",
    domain: "",
    cluster: "",
    definition: "",
    triggerConditions: [""],
    successCriteria: [""],
    keySteps: [""],
    riskPoints: [""],
    relatedBehaviorTags: [],
  });

  // Get the tag data based on selected cluster
  const tagData = selectedCluster ? taskTagsData[selectedCluster] : null;

  const handleEdit = () => {
    if (tagData) {
      setFormData({
        name: tagData.name,
        position: tagData.position,
        domain: tagData.domain,
        cluster: tagData.cluster,
        definition: tagData.definition,
        triggerConditions: tagData.triggerConditions.length > 0 ? tagData.triggerConditions : [""],
        successCriteria: tagData.successCriteria.length > 0 ? tagData.successCriteria : [""],
        keySteps: tagData.keySteps.length > 0 ? tagData.keySteps : [""],
        riskPoints: tagData.riskPoints.length > 0 ? tagData.riskPoints : [""],
        relatedBehaviorTags: tagData.relatedBehaviorTags,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    toast({
      title: "保存成功",
      description: "能力标签已保存为草稿",
    });
    setIsEditing(false);
  };

  const handlePublish = () => {
    toast({
      title: "发布成功",
      description: "能力标签已发布",
    });
    setIsEditing(false);
  };

  const handleViewHistory = () => {
    toast({
      title: "版本记录",
      description: "打开版本历史记录",
    });
  };

  const handleAddItem = (field: keyof FormData) => {
    if (Array.isArray(formData[field])) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), ""],
      });
    }
  };

  const handleUpdateItem = (field: keyof FormData, index: number, value: string) => {
    if (Array.isArray(formData[field])) {
      const newArray = [...(formData[field] as string[])];
      newArray[index] = value;
      setFormData({ ...formData, [field]: newArray });
    }
  };

  const handleRemoveItem = (field: keyof FormData, index: number) => {
    if (Array.isArray(formData[field]) && (formData[field] as string[]).length > 1) {
      const newArray = (formData[field] as string[]).filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArray });
    }
  };

  // Show placeholder when no cluster is selected
  if (!selectedCluster || !tagData) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">请在左侧选择一个二级能力</p>
          <p className="mt-2 text-sm">选择后将显示能力标签详情</p>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="flex h-full flex-col">
        {/* Header with actions */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-semibold">编辑能力标签</h2>
            <p className="text-sm text-muted-foreground">修改能力标签信息</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button variant="secondary" onClick={handleSave}>
              保存草稿
            </Button>
            <Button onClick={handlePublish}>
              <Send className="mr-1 h-4 w-4" />
              发布
            </Button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl space-y-6">
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
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="flex h-full flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{tagData.name}</h2>
          <Badge variant={statusConfig[tagData.status].variant}>
            {statusConfig[tagData.status].label}
          </Badge>
          <Badge variant="outline">{tagData.version}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleViewHistory}>
            <History className="mr-1 h-4 w-4" />
            查看历史版本
          </Button>
          {tagData.status === "draft" ? (
            <>
              <Button onClick={handleEdit}>
                <Edit className="mr-1 h-4 w-4" />
                编辑
              </Button>
              <Button onClick={handlePublish}>
                <Send className="mr-1 h-4 w-4" />
                发布
              </Button>
            </>
          ) : tagData.status === "published" ? (
            <Button onClick={handleEdit}>
              <Edit className="mr-1 h-4 w-4" />
              创建新版本
            </Button>
          ) : null}
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-6">
          {/* Meta info */}
          <div className="text-sm text-muted-foreground">
            {tagData.position} · 一级能力: {tagData.domain} · 二级能力: {tagData.cluster}
            <span className="ml-4">最近更新: {tagData.updatedBy} · {tagData.updatedAt}</span>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">能力定义</h4>
            <p className="text-sm text-muted-foreground">{tagData.definition}</p>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 text-sm font-semibold">触发条件</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {tagData.triggerConditions.map((condition, idx) => (
                <li key={idx}>{condition}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">成功标准</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {tagData.successCriteria.map((criteria, idx) => (
                <li key={idx}>{criteria}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">关键步骤</h4>
            <div className="flex flex-wrap gap-2">
              {tagData.keySteps.map((step, idx) => (
                <Badge key={idx} variant="outline">
                  {idx + 1}. {step}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-destructive">风险点</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {tagData.riskPoints.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 text-sm font-semibold">关联技能标签</h4>
            <div className="flex flex-wrap gap-2">
              {tagData.relatedBehaviorTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
