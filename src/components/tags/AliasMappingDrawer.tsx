import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface AliasMappingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: {
    id: string;
    position: string;
    term: string;
    termType: string;
    mappedTo: string;
    mappedToType: string;
    domain: string;
    cluster: string;
    priority: number;
    status: string;
    source: string;
    confidence: number | null;
  } | null;
}

export function AliasMappingDrawer({
  open,
  onOpenChange,
  mapping,
}: AliasMappingDrawerProps) {
  const { toast } = useToast();
  const isEditing = !!mapping;
  const isPending = mapping?.status === "pending" || mapping?.status === "conflict";

  const handleSave = () => {
    toast({
      title: isEditing ? "映射已更新" : "映射已创建",
      description: isEditing
        ? "岗位术语映射已成功更新"
        : "岗位术语映射已成功创建",
    });
    onOpenChange(false);
  };

  const handleApprove = () => {
    toast({
      title: "审核通过",
      description: "该映射已生效",
    });
    onOpenChange(false);
  };

  const handleReject = () => {
    toast({
      title: "已驳回",
      description: "该映射已被驳回",
      variant: "destructive",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] overflow-y-auto sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? "编辑岗位术语映射" : "新增岗位术语映射"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "修改岗位术语与标准标签的映射关系"
              : "创建岗位术语与标准标签的映射关系"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Block 1: Term Info */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-sm font-semibold">术语信息</h3>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>岗位 *</Label>
                <Select defaultValue={mapping?.position || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择岗位" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="物流销售">物流销售</SelectItem>
                    <SelectItem value="客服">客服</SelectItem>
                    <SelectItem value="药房营业员">药房营业员</SelectItem>
                    <SelectItem value="电商客服">电商客服</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>岗位术语 Term *</Label>
                <Input
                  defaultValue={mapping?.term || ""}
                  placeholder="输入岗位使用的术语"
                />
              </div>

              <div className="grid gap-2">
                <Label>术语类型</Label>
                <RadioGroup
                  defaultValue={mapping?.termType || "alias"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alias" id="alias" />
                    <Label htmlFor="alias" className="font-normal">
                      别名
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="display" id="display" />
                    <Label htmlFor="display" className="font-normal">
                      展示名
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>术语解释（可选）</Label>
                <Textarea placeholder="解释该术语在该岗位的含义..." rows={2} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Block 2: Mapping Object */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-sm font-semibold">映射对象</h3>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>映射对象类型</Label>
                <RadioGroup
                  defaultValue={mapping?.mappedToType || "behavior"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="behavior" id="behavior" />
                    <Label htmlFor="behavior" className="font-normal">
                      行为标签
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="task" id="task" />
                    <Label htmlFor="task" className="font-normal">
                      专业任务标签
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>映射到标准标签 *</Label>
                <Select defaultValue={mapping?.mappedTo || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="搜索并选择标准标签" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="清晰表达产品价值">
                      清晰表达产品价值（沟通能力/表达清晰 v2）
                    </SelectItem>
                    <SelectItem value="有效处理客户异议">
                      有效处理客户异议（问题解决/方案制定 v1）
                    </SelectItem>
                    <SelectItem value="主动挖掘客户需求">
                      主动挖掘客户需求（客户服务/需求识别 v1）
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>优先级（1-10）</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={mapping?.priority || 1}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Block 3: Status & Governance */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-sm font-semibold">生效与治理</h3>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">状态：</span>
                  {mapping ? (
                    <Badge
                      variant={
                        mapping.status === "active"
                          ? "default"
                          : mapping.status === "pending"
                          ? "secondary"
                          : mapping.status === "conflict"
                          ? "destructive"
                          : "outline"
                      }
                      className="ml-2"
                    >
                      {mapping.status === "active"
                        ? "生效"
                        : mapping.status === "pending"
                        ? "待审核"
                        : mapping.status === "conflict"
                        ? "冲突"
                        : "停用"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">
                      新建
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">来源：</span>
                  {mapping ? (
                    <Badge variant="outline" className="ml-2">
                      {mapping.source === "manual"
                        ? "手动"
                        : mapping.source === "import"
                        ? "导入"
                        : "AI 推荐"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2">
                      手动
                    </Badge>
                  )}
                </div>
              </div>

              {mapping?.confidence !== null && mapping?.confidence !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">AI 置信度：</span>
                  <span className="ml-2 font-medium">
                    {(mapping.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              {mapping?.status === "conflict" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    该术语已存在其他映射关系，请确认是否替换现有映射。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Help Text */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>展示名</strong>影响员工端显示；<strong>别名</strong>
              影响搜索、推荐和 AI 识别。
            </AlertDescription>
          </Alert>
        </div>

        <SheetFooter className="mt-8">
          {isPending ? (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                取消
              </Button>
              <Button variant="destructive" onClick={handleReject} className="flex-1">
                驳回
              </Button>
              <Button onClick={handleApprove} className="flex-1">
                通过
              </Button>
            </div>
          ) : (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              {!isEditing && (
                <Button variant="secondary" onClick={handleSave}>
                  保存并继续新增
                </Button>
              )}
              <Button onClick={handleSave}>保存</Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
