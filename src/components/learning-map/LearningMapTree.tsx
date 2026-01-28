import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, MoreHorizontal, ChevronRight, Folder, Map, Plus, Copy, GitBranch, Ban, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningMap } from "@/pages/learning-map/LearningMapLibrary";

interface Position {
  id: string;
  name: string;
}

interface LearningMapTreeProps {
  positions: Position[];
  maps: LearningMap[];
  selectedPosition: string | null;
  onSelectPosition: (positionId: string | null) => void;
  onCreateMap: () => void;
  onCreateVersion: (map: LearningMap) => void;
  onDisableMap: (map: LearningMap) => void;
}

export function LearningMapTree({
  positions,
  maps,
  selectedPosition,
  onSelectPosition,
  onCreateMap,
  onCreateVersion,
  onDisableMap,
}: LearningMapTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPositions, setExpandedPositions] = useState<string[]>(
    positions.map((p) => p.id)
  );

  const getMapsByPosition = (positionId: string) => {
    return maps.filter((map) => map.positionId === positionId);
  };

  const filteredPositions = positions.filter((position) => {
    const positionMaps = getMapsByPosition(position.id);
    return (
      position.name.includes(searchQuery) ||
      positionMaps.some((map) => map.name.includes(searchQuery))
    );
  });

  const togglePosition = (positionId: string) => {
    setExpandedPositions((prev) =>
      prev.includes(positionId)
        ? prev.filter((id) => id !== positionId)
        : [...prev, positionId]
    );
  };

  const handlePositionClick = (positionId: string) => {
    onSelectPosition(positionId === selectedPosition ? null : positionId);
  };

  const getStatusBadge = (status: LearningMap["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 hover:bg-green-500/10 border-0">
            已发布
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            草稿
          </Badge>
        );
      case "disabled":
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
            已停用
          </Badge>
        );
    }
  };

  const totalMapCount = maps.length;

  return (
    <div className="flex h-full flex-col border-r">
      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索岗位/地图..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {/* All Maps */}
          <div
            className={cn(
              "group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer",
              selectedPosition === null && "bg-primary/10"
            )}
            onClick={() => onSelectPosition(null)}
          >
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium">全部地图</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {totalMapCount}
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
                  <DropdownMenuItem onClick={onCreateMap}>
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    新建地图
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Position Tree */}
          {filteredPositions.map((position) => {
            const positionMaps = getMapsByPosition(position.id);
            const isExpanded = expandedPositions.includes(position.id);

            return (
              <Collapsible
                key={position.id}
                open={isExpanded}
                onOpenChange={() => togglePosition(position.id)}
              >
                <div
                  className={cn(
                    "group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted",
                    selectedPosition === position.id && "bg-primary/10"
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex flex-1 items-center gap-2 text-left">
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                      <Folder className="h-4 w-4 shrink-0 text-primary" />
                      <span
                        className="flex-1 truncate text-sm font-medium cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePositionClick(position.id);
                        }}
                      >
                        {position.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {positionMaps.length}
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
                      <DropdownMenuItem onClick={onCreateMap}>
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        新建地图
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CollapsibleContent className="ml-4 space-y-0.5">
                  {positionMaps.length > 0 ? (
                    positionMaps.map((map) => (
                      <div
                        key={map.id}
                        className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Map className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">
                              {map.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getStatusBadge(map.status)}
                              <span className="text-[10px] text-muted-foreground">
                                {map.version}
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-popover">
                            <DropdownMenuItem onClick={onCreateMap}>
                              <Plus className="h-3.5 w-3.5 mr-2" />
                              新建地图
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              复制地图
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onCreateVersion(map)}
                            >
                              <GitBranch className="h-3.5 w-3.5 mr-2" />
                              创建新版本
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDisableMap(map)}
                              className="text-destructive"
                            >
                              <Ban className="h-3.5 w-3.5 mr-2" />
                              停用
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className="h-3.5 w-3.5 mr-2" />
                              导出
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      暂无地图
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
