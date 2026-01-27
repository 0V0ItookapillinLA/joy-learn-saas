import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, BookOpen, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  competencyDimension?: string;
  organization?: string;
}

interface KnowledgeSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedItems: KnowledgeItem[]) => void;
  initialSelected?: KnowledgeItem[];
}

// Mock knowledge data
const mockKnowledgeItems: KnowledgeItem[] = [
  { id: "k1", title: "电话销售话术手册", category: "话术", tags: ["电话销售", "开场白"], competencyDimension: "沟通表达", organization: "销售部" },
  { id: "k2", title: "客户拜访流程规范", category: "流程", tags: ["拜访", "商务礼仪"], competencyDimension: "客户开发", organization: "销售部" },
  { id: "k3", title: "产品知识FAQ", category: "产品", tags: ["FAQ", "常见问题"], competencyDimension: "专业知识", organization: "产品部" },
  { id: "k4", title: "SPIN销售法则详解", category: "方法论", tags: ["SPIN", "提问技巧"], competencyDimension: "沟通表达", organization: "培训部" },
  { id: "k5", title: "竞品对比分析", category: "市场", tags: ["竞品", "市场分析"], competencyDimension: "专业知识", organization: "市场部" },
  { id: "k6", title: "投诉处理流程规范", category: "流程", tags: ["投诉", "客服"], competencyDimension: "异议处理", organization: "客服部" },
  { id: "k7", title: "客户满意度提升技巧", category: "技巧", tags: ["满意度", "客户关系"], competencyDimension: "客户维护", organization: "客服部" },
  { id: "k8", title: "Scrum框架指南", category: "方法论", tags: ["敏捷", "Scrum"], competencyDimension: "项目管理", organization: "技术部" },
  { id: "k9", title: "敏捷迭代管理手册", category: "流程", tags: ["敏捷", "迭代"], competencyDimension: "项目管理", organization: "技术部" },
  { id: "k10", title: "商务谈判技巧指南", category: "技巧", tags: ["谈判", "成交"], competencyDimension: "商务谈判", organization: "销售部" },
];

// Get unique values for filters
const organizations = [...new Set(mockKnowledgeItems.map(k => k.organization).filter(Boolean))];
const dimensions = [...new Set(mockKnowledgeItems.map(k => k.competencyDimension).filter(Boolean))];
const tags = [...new Set(mockKnowledgeItems.flatMap(k => k.tags || []))];

export function KnowledgeSearchModal({
  open,
  onOpenChange,
  onConfirm,
  initialSelected = [],
}: KnowledgeSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<KnowledgeItem[]>(initialSelected);

  // Filter knowledge items
  const filteredItems = useMemo(() => {
    return mockKnowledgeItems.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesOrg = selectedOrg === "all" || item.organization === selectedOrg;
      const matchesDimension = selectedDimension === "all" || item.competencyDimension === selectedDimension;
      const matchesTag = selectedTag === "all" || (item.tags && item.tags.includes(selectedTag));

      return matchesSearch && matchesOrg && matchesDimension && matchesTag;
    });
  }, [searchQuery, selectedOrg, selectedDimension, selectedTag]);

  const toggleItem = (item: KnowledgeItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSelected = (itemId: string) => selectedItems.some(i => i.id === itemId);

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedOrg("all");
    setSelectedDimension("all");
    setSelectedTag("all");
  };

  const hasActiveFilters = searchQuery !== "" || selectedOrg !== "all" || selectedDimension !== "all" || selectedTag !== "all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            添加关联知识
          </DialogTitle>
          <DialogDescription>
            从知识库中搜索并选择要关联的知识内容
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索知识标题或分类..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">筛选:</span>
            </div>
            
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="组织" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部组织</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org} value={org || ""}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDimension} onValueChange={setSelectedDimension}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="能力维度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部维度</SelectItem>
                {dimensions.map(dim => (
                  <SelectItem key={dim} value={dim || ""}>{dim}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="标签" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部标签</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                <X className="h-4 w-4 mr-1" />
                清除筛选
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 py-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                未找到匹配的知识内容
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    isSelected(item.id)
                      ? "bg-primary/5 border-primary/30"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => toggleItem(item)}
                >
                  <Checkbox
                    checked={isSelected(item.id)}
                    onCheckedChange={() => toggleItem(item)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.competencyDimension && (
                        <Badge variant="outline" className="text-xs">
                          {item.competencyDimension}
                        </Badge>
                      )}
                      {item.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {item.organization && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.organization}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            已选择 {selectedItems.length} 项
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm}>
              确认添加
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
