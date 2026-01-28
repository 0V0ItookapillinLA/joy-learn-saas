import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewBehaviorTagSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PositionExample {
  position: string;
  scenario: string;
  positiveExample: string;
  negativeExample: string;
  remarks: string;
}

const defaultExamples: PositionExample[] = [
  { position: "物流销售", scenario: "", positiveExample: "", negativeExample: "", remarks: "" },
  { position: "客服", scenario: "", positiveExample: "", negativeExample: "", remarks: "" },
  { position: "药房营业员", scenario: "", positiveExample: "", negativeExample: "", remarks: "" },
];

export function NewBehaviorTagSheet({ open, onOpenChange }: NewBehaviorTagSheetProps) {
  const { toast } = useToast();
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [positionExamples, setPositionExamples] = useState<PositionExample[]>(defaultExamples);
  
  // L1-L4 evaluation points
  const [l1Points, setL1Points] = useState<string[]>([""]);
  const [l2Points, setL2Points] = useState<string[]>([""]);
  const [l3Points, setL3Points] = useState<string[]>([""]);
  const [l4Points, setL4Points] = useState<string[]>([""]);
  
  // Signals
  const [positiveSignals, setPositiveSignals] = useState<string[]>([""]);
  const [negativeSignals, setNegativeSignals] = useState<string[]>([""]);

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()]);
      setAliasInput("");
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter((a) => a !== alias));
  };

  const handleAddPoint = (
    points: string[],
    setPoints: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setPoints([...points, ""]);
  };

  const handleUpdatePoint = (
    index: number,
    value: string,
    points: string[],
    setPoints: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleRemovePoint = (
    index: number,
    points: string[],
    setPoints: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (points.length > 1) {
      setPoints(points.filter((_, i) => i !== index));
    }
  };

  const handleAddExample = () => {
    setPositionExamples([
      ...positionExamples,
      { position: "", scenario: "", positiveExample: "", negativeExample: "", remarks: "" },
    ]);
  };

  const handleRemoveExample = (index: number) => {
    setPositionExamples(positionExamples.filter((_, i) => i !== index));
  };

  const handleUpdateExample = (index: number, field: keyof PositionExample, value: string) => {
    const newExamples = [...positionExamples];
    newExamples[index][field] = value;
    setPositionExamples(newExamples);
  };

  const handleSaveDraft = () => {
    toast({
      title: "草稿已保存",
      description: "技能标签草稿已成功保存",
    });
    onOpenChange(false);
  };

  const handlePublish = () => {
    toast({
      title: "发布成功",
      description: "技能标签已发布，评估口径已冻结",
    });
    setShowPublishConfirm(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[700px] overflow-y-auto sm:max-w-[700px]">
          <SheetHeader>
            <SheetTitle>新建技能标签</SheetTitle>
            <SheetDescription>
              创建公司通用技能标签，可用于 AI 评估
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-8">
            {/* Block 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-sm font-semibold">基本信息（必填）</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tagName">标签名称 *</Label>
                  <Input id="tagName" placeholder="输入标签名称，需唯一" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>一级能力 *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择一级能力" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="communication">沟通能力</SelectItem>
                        <SelectItem value="problem">问题解决</SelectItem>
                        <SelectItem value="service">客户服务</SelectItem>
                        <SelectItem value="team">团队协作</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>二级能力 *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择二级能力" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="express">表达清晰</SelectItem>
                        <SelectItem value="listen">倾听理解</SelectItem>
                        <SelectItem value="persuade">说服影响</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>标签别名</Label>
                  <div className="flex gap-2">
                    <Input
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      placeholder="输入别名后按回车添加"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAlias())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddAlias}>
                      添加
                    </Button>
                  </div>
                  {aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aliases.map((alias) => (
                        <Badge key={alias} variant="secondary" className="gap-1">
                          {alias}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveAlias(alias)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="definition">行为定义 *</Label>
                  <Textarea
                    id="definition"
                    placeholder="详细描述该行为标签的定义和评估标准..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>适用岗位 *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择适用岗位（可多选）" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="sales">物流销售</SelectItem>
                      <SelectItem value="cs">客服</SelectItem>
                      <SelectItem value="pharmacy">药房营业员</SelectItem>
                      <SelectItem value="ecommerce">电商客服</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Block 2: Growth Path L1-L4 */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-sm font-semibold">成长路径 L1-L4（全部必填）</h3>
              
              {[
                { level: "L1", title: "基础级", points: l1Points, setPoints: setL1Points },
                { level: "L2", title: "熟练级", points: l2Points, setPoints: setL2Points },
                { level: "L3", title: "精通级", points: l3Points, setPoints: setL3Points },
                { level: "L4", title: "专家级", points: l4Points, setPoints: setL4Points },
              ].map(({ level, title, points, setPoints }) => (
                <div key={level} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="outline">{level}</Badge>
                    <span className="font-medium">{title}</span>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label>{level} 描述 *</Label>
                      <Textarea placeholder={`描述 ${level} 级别的能力表现...`} rows={2} />
                    </div>
                    <div className="grid gap-2">
                      <Label>评估要点</Label>
                      {points.map((point, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={point}
                            onChange={(e) => handleUpdatePoint(idx, e.target.value, points, setPoints)}
                            placeholder={`评估要点 ${idx + 1}`}
                          />
                          {points.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePoint(idx, points, setPoints)}
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
                        className="w-fit"
                        onClick={() => handleAddPoint(points, setPoints)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        添加评估要点
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Block 3: Observable Signals */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-sm font-semibold">可观察信号（建议填写）</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-success">正向信号</Label>
                  {positiveSignals.map((signal, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={signal}
                        onChange={(e) =>
                          handleUpdatePoint(idx, e.target.value, positiveSignals, setPositiveSignals)
                        }
                        placeholder={`正向信号 ${idx + 1}`}
                      />
                      {positiveSignals.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemovePoint(idx, positiveSignals, setPositiveSignals)
                          }
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
                    className="w-fit"
                    onClick={() => handleAddPoint(positiveSignals, setPositiveSignals)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加正向信号
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label className="text-destructive">负向信号</Label>
                  {negativeSignals.map((signal, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={signal}
                        onChange={(e) =>
                          handleUpdatePoint(idx, e.target.value, negativeSignals, setNegativeSignals)
                        }
                        placeholder={`负向信号 ${idx + 1}`}
                      />
                      {negativeSignals.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemovePoint(idx, negativeSignals, setNegativeSignals)
                          }
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
                    className="w-fit"
                    onClick={() => handleAddPoint(negativeSignals, setNegativeSignals)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加负向信号
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label>证据提取提示</Label>
                  <Textarea
                    placeholder="描述 AI 应如何从对话中提取证据来评估该行为..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Block 4: Position Examples */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-sm font-semibold">岗位示例</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">岗位</TableHead>
                    <TableHead className="w-[120px]">场景描述</TableHead>
                    <TableHead>正例话术</TableHead>
                    <TableHead>反例话术</TableHead>
                    <TableHead className="w-[100px]">备注</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionExamples.map((example, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Input
                          value={example.position}
                          onChange={(e) => handleUpdateExample(idx, "position", e.target.value)}
                          placeholder="岗位"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={example.scenario}
                          onChange={(e) => handleUpdateExample(idx, "scenario", e.target.value)}
                          placeholder="场景"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={example.positiveExample}
                          onChange={(e) => handleUpdateExample(idx, "positiveExample", e.target.value)}
                          placeholder="正例话术"
                          rows={2}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={example.negativeExample}
                          onChange={(e) => handleUpdateExample(idx, "negativeExample", e.target.value)}
                          placeholder="反例话术（可选）"
                          rows={2}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={example.remarks}
                          onChange={(e) => handleUpdateExample(idx, "remarks", e.target.value)}
                          placeholder="备注"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExample(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" size="sm" onClick={handleAddExample}>
                <Plus className="mr-1 h-4 w-4" />
                添加示例行
              </Button>
            </div>
          </div>

          <SheetFooter className="mt-8 flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button variant="secondary" onClick={() => setShowPublishConfirm(true)}>
              发布
            </Button>
            <Button onClick={handleSaveDraft}>保存草稿</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认发布？</AlertDialogTitle>
            <AlertDialogDescription>
              发布后，该行为标签的评估口径将被冻结。如需修改核心字段（定义、成长路径、信号等），需要创建新版本。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>确认发布</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
