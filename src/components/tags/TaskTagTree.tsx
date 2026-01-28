import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, ChevronRight, Briefcase, FolderOpen, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for task tag tree
const taskTagTree = [
  {
    id: "pos-1",
    name: "物流销售",
    domains: [
      {
        id: "domain-1-1",
        name: "销售流程",
        clusters: [
          { id: "cluster-1-1-1", name: "客户获取", tagCount: 3 },
          { id: "cluster-1-1-2", name: "需求分析", tagCount: 4 },
          { id: "cluster-1-1-3", name: "成交转化", tagCount: 5 },
        ],
      },
      {
        id: "domain-1-2",
        name: "客户维护",
        clusters: [
          { id: "cluster-1-2-1", name: "关系维护", tagCount: 2 },
          { id: "cluster-1-2-2", name: "续约管理", tagCount: 3 },
        ],
      },
    ],
  },
  {
    id: "pos-2",
    name: "客服",
    domains: [
      {
        id: "domain-2-1",
        name: "服务流程",
        clusters: [
          { id: "cluster-2-1-1", name: "咨询解答", tagCount: 4 },
          { id: "cluster-2-1-2", name: "问题解决", tagCount: 5 },
          { id: "cluster-2-1-3", name: "投诉处理", tagCount: 3 },
        ],
      },
    ],
  },
  {
    id: "pos-3",
    name: "药房营业员",
    domains: [
      {
        id: "domain-3-1",
        name: "销售服务",
        clusters: [
          { id: "cluster-3-1-1", name: "用药咨询", tagCount: 6 },
          { id: "cluster-3-1-2", name: "产品推荐", tagCount: 4 },
        ],
      },
    ],
  },
];

interface TaskTagTreeProps {
  selectedPosition: string | null;
  selectedDomain: string | null;
  selectedCluster: string | null;
  onSelectPosition: (positionId: string | null) => void;
  onSelectDomain: (domainId: string | null) => void;
  onSelectCluster: (clusterId: string | null) => void;
}

export function TaskTagTree({
  selectedPosition,
  selectedDomain,
  selectedCluster,
  onSelectPosition,
  onSelectDomain,
  onSelectCluster,
}: TaskTagTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPositions, setExpandedPositions] = useState<string[]>(["pos-1"]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>(["domain-1-1"]);

  const togglePosition = (posId: string) => {
    setExpandedPositions((prev) =>
      prev.includes(posId) ? prev.filter((id) => id !== posId) : [...prev, posId]
    );
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handlePositionClick = (posId: string) => {
    onSelectPosition(posId === selectedPosition ? null : posId);
    onSelectDomain(null);
    onSelectCluster(null);
  };

  const handleDomainClick = (posId: string, domainId: string) => {
    onSelectPosition(posId);
    onSelectDomain(domainId === selectedDomain ? null : domainId);
    onSelectCluster(null);
  };

  const handleClusterClick = (posId: string, domainId: string, clusterId: string) => {
    onSelectPosition(posId);
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
            placeholder="搜索岗位/域/簇..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {taskTagTree.map((position) => (
            <Collapsible
              key={position.id}
              open={expandedPositions.includes(position.id)}
              onOpenChange={() => togglePosition(position.id)}
            >
              <div
                className={cn(
                  "group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted",
                  selectedPosition === position.id &&
                    !selectedDomain &&
                    "bg-primary/10"
                )}
              >
                <CollapsibleTrigger asChild>
                  <button className="flex flex-1 items-center gap-2 text-left">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        expandedPositions.includes(position.id) && "rotate-90"
                      )}
                    />
                    <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                    <span
                      className="flex-1 truncate text-sm font-medium cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePositionClick(position.id);
                      }}
                    >
                      {position.name}
                    </span>
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="ml-4 space-y-0.5">
                {position.domains.map((domain) => (
                  <Collapsible
                    key={domain.id}
                    open={expandedDomains.includes(domain.id)}
                    onOpenChange={() => toggleDomain(domain.id)}
                  >
                    <div
                      className={cn(
                        "group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted",
                        selectedDomain === domain.id &&
                          !selectedCluster &&
                          "bg-primary/10"
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
                          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span
                            className="flex-1 truncate text-sm cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDomainClick(position.id, domain.id);
                            }}
                          >
                            {domain.name}
                          </span>
                        </button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="ml-6 space-y-0.5">
                      {domain.clusters.map((cluster) => (
                        <div
                          key={cluster.id}
                          className={cn(
                            "flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer",
                            selectedCluster === cluster.id && "bg-primary/10"
                          )}
                          onClick={() =>
                            handleClusterClick(position.id, domain.id, cluster.id)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="text-sm">{cluster.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {cluster.tagCount}
                          </span>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}
