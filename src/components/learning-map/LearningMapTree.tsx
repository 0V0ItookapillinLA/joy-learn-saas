import { useState } from "react";
import { ChevronRight, ChevronDown, MoreHorizontal, Plus, Copy, GitBranch, Ban, Download, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(
    new Set(positions.map((p) => p.id))
  );

  const togglePosition = (positionId: string) => {
    setExpandedPositions((prev) => {
      const next = new Set(prev);
      if (next.has(positionId)) {
        next.delete(positionId);
      } else {
        next.add(positionId);
      }
      return next;
    });
  };

  const getMapsByPosition = (positionId: string) => {
    return maps.filter((map) => map.positionId === positionId);
  };

  const getStatusBadge = (status: LearningMap["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 hover:bg-green-500/10">
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-foreground">地图库</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateMap}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* All Maps */}
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
              selectedPosition === null
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted text-foreground"
            )}
            onClick={() => onSelectPosition(null)}
          >
            <Map className="h-4 w-4 text-muted-foreground" />
            <span>全部地图</span>
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
              {maps.length}
            </Badge>
          </button>

          {/* Position Tree */}
          <div className="mt-2 space-y-1">
            {positions.map((position) => {
              const positionMaps = getMapsByPosition(position.id);
              const isExpanded = expandedPositions.has(position.id);

              return (
                <div key={position.id}>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                      selectedPosition === position.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <button
                      className="p-0.5 hover:bg-muted-foreground/10 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePosition(position.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                    <span
                      className="flex-1 text-sm truncate"
                      onClick={() => onSelectPosition(position.id)}
                    >
                      {position.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {positionMaps.length}
                    </Badge>
                  </div>

                  {isExpanded && positionMaps.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {positionMaps.map((map) => (
                        <div
                          key={map.id}
                          className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-foreground/80">
                                {map.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getStatusBadge(map.status)}
                              <span className="text-[10px] text-muted-foreground">
                                {map.version}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                · {map.behaviorTagCount}能力 / {map.taskTagCount}任务
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
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
                      ))}
                    </div>
                  )}

                  {isExpanded && positionMaps.length === 0 && (
                    <div className="ml-6 py-2 text-xs text-muted-foreground">
                      暂无地图
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
