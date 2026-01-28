import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, MoreHorizontal, ChevronRight, Folder, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for behavior tag tree
const behaviorDomains = [
  {
    id: "domain-1",
    name: "沟通能力",
    tagCount: 24,
    clusters: [
      { id: "cluster-1-1", name: "表达清晰", tagCount: 8 },
      { id: "cluster-1-2", name: "倾听理解", tagCount: 6 },
      { id: "cluster-1-3", name: "说服影响", tagCount: 10 },
    ],
  },
  {
    id: "domain-2",
    name: "问题解决",
    tagCount: 18,
    clusters: [
      { id: "cluster-2-1", name: "分析诊断", tagCount: 7 },
      { id: "cluster-2-2", name: "方案制定", tagCount: 5 },
      { id: "cluster-2-3", name: "执行落地", tagCount: 6 },
    ],
  },
  {
    id: "domain-3",
    name: "客户服务",
    tagCount: 15,
    clusters: [
      { id: "cluster-3-1", name: "需求识别", tagCount: 5 },
      { id: "cluster-3-2", name: "投诉处理", tagCount: 4 },
      { id: "cluster-3-3", name: "关系维护", tagCount: 6 },
    ],
  },
  {
    id: "domain-4",
    name: "团队协作",
    tagCount: 12,
    clusters: [
      { id: "cluster-4-1", name: "信息共享", tagCount: 4 },
      { id: "cluster-4-2", name: "冲突处理", tagCount: 4 },
      { id: "cluster-4-3", name: "协同配合", tagCount: 4 },
    ],
  },
];

interface BehaviorTagTreeProps {
  selectedDomain: string | null;
  selectedCluster: string | null;
  onSelectDomain: (domainId: string | null) => void;
  onSelectCluster: (clusterId: string | null) => void;
}

export function BehaviorTagTree({
  selectedDomain,
  selectedCluster,
  onSelectDomain,
  onSelectCluster,
}: BehaviorTagTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDomains, setExpandedDomains] = useState<string[]>(["domain-1"]);

  const filteredDomains = behaviorDomains.filter(
    (domain) =>
      domain.name.includes(searchQuery) ||
      domain.clusters.some((cluster) => cluster.name.includes(searchQuery))
  );

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleDomainClick = (domainId: string) => {
    onSelectDomain(domainId === selectedDomain ? null : domainId);
    onSelectCluster(null);
  };

  const handleClusterClick = (domainId: string, clusterId: string) => {
    onSelectDomain(domainId);
    onSelectCluster(clusterId === selectedCluster ? null : clusterId);
  };

  return (
    <div className="flex h-full flex-col border-r">
      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索一级/二级能力..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {filteredDomains.map((domain) => (
            <Collapsible
              key={domain.id}
              open={expandedDomains.includes(domain.id)}
              onOpenChange={() => toggleDomain(domain.id)}
            >
              <div
                className={cn(
                  "group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted",
                  selectedDomain === domain.id && !selectedCluster && "bg-primary/10"
                )}
              >
                <CollapsibleTrigger asChild>
                  <button className="flex flex-1 items-center gap-2 text-left">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        expandedDomains.includes(domain.id) && "rotate-90"
                      )}
                    />
                    <Folder className="h-4 w-4 shrink-0 text-primary" />
                    <span
                      className="flex-1 truncate text-sm font-medium cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDomainClick(domain.id);
                      }}
                    >
                      {domain.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {domain.tagCount}
                    </span>
                  </button>
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem>新增二级能力</DropdownMenuItem>
                    <DropdownMenuItem>编辑</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      停用
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent className="ml-4 space-y-0.5">
                {domain.clusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer",
                      selectedCluster === cluster.id && "bg-primary/10"
                    )}
                    onClick={() => handleClusterClick(domain.id, cluster.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-sm">{cluster.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {cluster.tagCount}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem>编辑</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            停用
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}
