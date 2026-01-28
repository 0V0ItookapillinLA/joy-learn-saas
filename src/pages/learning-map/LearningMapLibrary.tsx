import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LearningMapTree } from "@/components/learning-map/LearningMapTree";
import { LearningMapTable } from "@/components/learning-map/LearningMapTable";
import { LearningMapDrawer } from "@/components/learning-map/LearningMapDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Download, Search } from "lucide-react";

export interface LearningMap {
  id: string;
  name: string;
  position: string;
  positionId: string;
  behaviorTagCount: number;
  taskTagCount: number;
  stageCount: number;
  targetAudience: string[];
  status: "draft" | "published" | "disabled";
  version: string;
  updatedBy: string;
  updatedAt: string;
  stages?: Stage[];
  description?: string;
}

export interface Stage {
  id: string;
  name: string;
  level: string;
  objective: string;
  entryCondition: string;
  completionCriteria: string;
  behaviorTags: BehaviorTagBinding[];
  taskTags: TaskTagBinding[];
  learnItems: ContentItem[];
  practiceItems: ContentItem[];
  assessItems: ContentItem[];
  evidenceRequirements: string[];
}

export interface BehaviorTagBinding {
  id: string;
  name: string;
  targetLevel: "L1" | "L2" | "L3" | "L4";
}

export interface TaskTagBinding {
  id: string;
  name: string;
}

export interface ContentItem {
  id: string;
  name: string;
  type: string;
  duration?: number;
  required: boolean;
}

// Mock data
const mockMaps: LearningMap[] = [
  {
    id: "1",
    name: "物流销售新人培养地图",
    position: "物流销售",
    positionId: "pos-1",
    behaviorTagCount: 12,
    taskTagCount: 8,
    stageCount: 4,
    targetAudience: ["新员工"],
    status: "published",
    version: "v1.2",
    updatedBy: "张三",
    updatedAt: "2024-01-15 14:30",
    description: "针对物流销售岗位新员工的系统化培养路径",
  },
  {
    id: "2",
    name: "物流销售进阶提升地图",
    position: "物流销售",
    positionId: "pos-1",
    behaviorTagCount: 18,
    taskTagCount: 15,
    stageCount: 3,
    targetAudience: ["在岗", "晋升"],
    status: "draft",
    version: "v0.1",
    updatedBy: "李四",
    updatedAt: "2024-01-20 09:15",
    description: "面向在岗员工的能力进阶路径",
  },
  {
    id: "3",
    name: "客服标准化培训地图",
    position: "客服",
    positionId: "pos-2",
    behaviorTagCount: 10,
    taskTagCount: 6,
    stageCount: 4,
    targetAudience: ["新员工", "在岗"],
    status: "published",
    version: "v2.0",
    updatedBy: "王五",
    updatedAt: "2024-01-18 16:45",
    description: "客服岗位标准化服务能力培养",
  },
  {
    id: "4",
    name: "药房营业员合规培训",
    position: "药房营业员",
    positionId: "pos-3",
    behaviorTagCount: 8,
    taskTagCount: 12,
    stageCount: 3,
    targetAudience: ["新员工"],
    status: "disabled",
    version: "v1.0",
    updatedBy: "赵六",
    updatedAt: "2024-01-10 11:20",
    description: "药房营业员合规与专业知识培训",
  },
];

const positions = [
  { id: "pos-1", name: "物流销售" },
  { id: "pos-2", name: "客服" },
  { id: "pos-3", name: "药房营业员" },
];

export default function LearningMapLibrary() {
  const [maps, setMaps] = useState<LearningMap[]>(mockMaps);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<LearningMap | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">("view");

  // Filter maps based on search, position, and status
  const filteredMaps = maps.filter((map) => {
    const matchesSearch =
      searchQuery === "" ||
      map.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      map.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition =
      !selectedPosition || map.positionId === selectedPosition;
    const matchesStatus =
      statusFilter === "all" || map.status === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const handleCreateMap = () => {
    setSelectedMap(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  const handleViewMap = (map: LearningMap) => {
    setSelectedMap(map);
    setDrawerMode("view");
    setDrawerOpen(true);
  };

  const handleEditMap = (map: LearningMap) => {
    setSelectedMap(map);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handlePublishMap = (map: LearningMap) => {
    setMaps((prev) =>
      prev.map((m) =>
        m.id === map.id ? { ...m, status: "published" as const } : m
      )
    );
  };

  const handleDisableMap = (map: LearningMap) => {
    setMaps((prev) =>
      prev.map((m) =>
        m.id === map.id ? { ...m, status: "disabled" as const } : m
      )
    );
  };

  const handleCreateVersion = (map: LearningMap) => {
    const newVersion = `v${parseFloat(map.version.slice(1)) + 0.1}`;
    const newMap: LearningMap = {
      ...map,
      id: `${map.id}-${Date.now()}`,
      version: newVersion,
      status: "draft",
      updatedAt: new Date().toLocaleString("zh-CN"),
    };
    setMaps((prev) => [...prev, newMap]);
    setSelectedMap(newMap);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleSaveMap = (mapData: Partial<LearningMap>) => {
    if (drawerMode === "create") {
      const newMap: LearningMap = {
        id: `map-${Date.now()}`,
        name: mapData.name || "未命名地图",
        position: mapData.position || "",
        positionId: mapData.positionId || "",
        behaviorTagCount: 0,
        taskTagCount: 0,
        stageCount: 0,
        targetAudience: mapData.targetAudience || [],
        status: "draft",
        version: "v0.1",
        updatedBy: "当前用户",
        updatedAt: new Date().toLocaleString("zh-CN"),
        description: mapData.description,
      };
      setMaps((prev) => [...prev, newMap]);
    } else if (selectedMap) {
      setMaps((prev) =>
        prev.map((m) =>
          m.id === selectedMap.id
            ? { ...m, ...mapData, updatedAt: new Date().toLocaleString("zh-CN") }
            : m
        )
      );
    }
    setDrawerOpen(false);
  };

  return (
    <DashboardLayout 
      title="学习地图" 
      description="配置岗位学习地图，实现学习→练→考→评→证据→成长的闭环"
    >
      <div className="flex h-[calc(100vh-180px)] flex-col">
        <div className="flex h-full">
          {/* Left: Map Tree */}
          <div className="w-[280px] shrink-0">
            <LearningMapTree
              positions={positions}
              maps={maps}
              selectedPosition={selectedPosition}
              onSelectPosition={setSelectedPosition}
              onCreateMap={handleCreateMap}
              onCreateVersion={handleCreateVersion}
              onDisableMap={handleDisableMap}
            />
          </div>

          {/* Right: Map List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索地图名/岗位..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="disabled">已停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  导入
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  导出
                </Button>
                <Button size="sm" onClick={handleCreateMap}>
                  <Plus className="h-4 w-4 mr-1" />
                  新建地图
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
              <LearningMapTable
                maps={filteredMaps}
                onView={handleViewMap}
                onEdit={handleEditMap}
                onPublish={handlePublishMap}
                onDisable={handleDisableMap}
                onCreateVersion={handleCreateVersion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <LearningMapDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        map={selectedMap}
        mode={drawerMode}
        positions={positions}
        onSave={handleSaveMap}
        onPublish={handlePublishMap}
        onDisable={handleDisableMap}
        onCreateVersion={handleCreateVersion}
      />
    </DashboardLayout>
  );
}
