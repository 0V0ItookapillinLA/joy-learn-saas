import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LearningMapTree } from "@/components/learning-map/LearningMapTree";
import { LearningMapTable } from "@/components/learning-map/LearningMapTable";
import { LearningMapEditor, LearningMapEditorData } from "@/components/learning-map/LearningMapEditor";
import { Button, Input, Select } from "antd";
import { PlusOutlined, UploadOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";

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
  // Editor data for view/edit
  editorData?: LearningMapEditorData;
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

// Mock data with complete editor data
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
    editorData: {
      id: "1",
      positionName: "物流销售",
      levelRange: { start: 1, end: 4 },
      version: "v1.2",
      status: "published",
      levels: {
        P1: {
          skills: [
            { id: "ls1", name: "公司产品知识", description: "熟悉公司物流产品线及服务内容", order: 0 },
            { id: "ls2", name: "客户沟通基础", description: "掌握基本的客户沟通技巧和话术", order: 1 },
            { id: "ls3", name: "CRM 系统操作", description: "能够熟练使用公司CRM系统录入客户信息", order: 2 },
          ],
        },
        P2: {
          skills: [
            { id: "ls4", name: "需求挖掘技巧", description: "通过提问发现客户潜在物流需求", order: 0 },
            { id: "ls5", name: "报价方案制作", description: "根据客户需求制作合理的报价方案", order: 1 },
            { id: "ls6", name: "竞品分析能力", description: "了解主要竞争对手的产品和定价策略", order: 2 },
          ],
        },
        P3: {
          skills: [
            { id: "ls7", name: "商务谈判技巧", description: "能够独立完成中小客户的商务谈判", order: 0 },
            { id: "ls8", name: "客户关系维护", description: "建立并维护良好的客户关系", order: 1 },
            { id: "ls9", name: "异议处理能力", description: "有效处理客户的价格和服务异议", order: 2 },
          ],
        },
        P4: {
          skills: [
            { id: "ls10", name: "大客户开发", description: "具备开发和维护大客户的能力", order: 0 },
            { id: "ls11", name: "解决方案设计", description: "为客户设计定制化物流解决方案", order: 1 },
            { id: "ls12", name: "团队协作领导", description: "能够带领小团队完成销售目标", order: 2 },
          ],
        },
      },
      skillConfigs: {
        ls1: { learningMethods: ["course"], courses: ["c1"], isRequired: true, verificationMethod: "exam" },
        ls2: { learningMethods: ["course", "practice"], courses: ["c2"], isRequired: true, verificationMethod: "practice" },
        ls3: { learningMethods: ["course"], courses: ["c3"], isRequired: true, verificationMethod: "exam" },
        ls4: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        ls5: { learningMethods: ["course", "project"], courses: ["c4"], isRequired: true, verificationMethod: "project" },
        ls6: { learningMethods: ["course"], courses: ["c5"], isRequired: false, verificationMethod: "exam" },
        ls7: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        ls8: { learningMethods: ["course", "practice"], courses: ["c6"], isRequired: true, verificationMethod: "practice" },
        ls9: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        ls10: { learningMethods: ["course", "project"], courses: ["c7"], isRequired: true, verificationMethod: "project" },
        ls11: { learningMethods: ["project"], courses: [], isRequired: true, verificationMethod: "project" },
        ls12: { learningMethods: ["course", "practice"], courses: ["c8"], isRequired: false, verificationMethod: "practice" },
      },
    },
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
    editorData: {
      id: "2",
      positionName: "物流销售",
      levelRange: { start: 5, end: 7 },
      version: "v0.1",
      status: "draft",
      levels: {
        P5: {
          skills: [
            { id: "adv1", name: "区域市场分析", description: "能够分析区域市场特点和竞争格局", order: 0 },
            { id: "adv2", name: "销售策略制定", description: "根据市场情况制定有效的销售策略", order: 1 },
            { id: "adv3", name: "关键客户管理", description: "管理和维护区域内的关键客户资源", order: 2 },
            { id: "adv4", name: "销售数据分析", description: "通过数据分析优化销售行为和决策", order: 3 },
            { id: "adv5", name: "跨部门协调", description: "与运营、客服等部门高效协作", order: 4 },
            { id: "adv6", name: "合同谈判能力", description: "独立完成大型合同的谈判和签署", order: 5 },
          ],
        },
        P6: {
          skills: [
            { id: "adv7", name: "团队业绩管理", description: "设定团队目标并追踪业绩达成", order: 0 },
            { id: "adv8", name: "销售培训辅导", description: "能够培训和辅导初级销售人员", order: 1 },
            { id: "adv9", name: "战略客户开发", description: "开发和维护战略级大客户", order: 2 },
            { id: "adv10", name: "行业解决方案", description: "针对特定行业设计专业物流方案", order: 3 },
            { id: "adv11", name: "销售流程优化", description: "优化销售流程提升团队效率", order: 4 },
            { id: "adv12", name: "客户成功管理", description: "确保客户持续满意并发掘增长机会", order: 5 },
          ],
        },
        P7: {
          skills: [
            { id: "adv13", name: "销售战略规划", description: "制定区域或产品线的年度销售战略", order: 0 },
            { id: "adv14", name: "高管关系建立", description: "与客户高层建立战略合作关系", order: 1 },
            { id: "adv15", name: "商业模式创新", description: "探索新的销售模式和合作方式", order: 2 },
            { id: "adv16", name: "团队建设管理", description: "建设高绩效销售团队", order: 3 },
            { id: "adv17", name: "市场趋势洞察", description: "把握物流行业发展趋势和机会", order: 4 },
            { id: "adv18", name: "业务增长策略", description: "制定可持续的业务增长策略", order: 5 },
          ],
        },
      },
      skillConfigs: {
        adv1: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        adv2: { learningMethods: ["course", "project"], courses: [], isRequired: true, verificationMethod: "project" },
        adv3: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        adv4: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        adv5: { learningMethods: ["practice"], courses: [], isRequired: false, verificationMethod: "practice" },
        adv6: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
      },
    },
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
    editorData: {
      id: "3",
      positionName: "客服",
      levelRange: { start: 1, end: 4 },
      version: "v2.0",
      status: "published",
      levels: {
        P1: {
          skills: [
            { id: "cs1", name: "服务礼仪规范", description: "掌握客服接待的基本礼仪和规范", order: 0 },
            { id: "cs2", name: "系统操作能力", description: "熟练操作客服工单和知识库系统", order: 1 },
          ],
        },
        P2: {
          skills: [
            { id: "cs3", name: "问题诊断能力", description: "快速准确诊断客户问题的根因", order: 0 },
            { id: "cs4", name: "话术应用技巧", description: "灵活运用标准话术解决常见问题", order: 1 },
            { id: "cs5", name: "情绪管理能力", description: "保持专业态度，管理自身情绪", order: 2 },
          ],
        },
        P3: {
          skills: [
            { id: "cs6", name: "投诉处理能力", description: "妥善处理客户投诉并转化满意", order: 0 },
            { id: "cs7", name: "复杂问题升级", description: "识别并正确升级复杂问题", order: 1 },
          ],
        },
        P4: {
          skills: [
            { id: "cs8", name: "服务质量监控", description: "监控团队服务质量并提出改进", order: 0 },
            { id: "cs9", name: "知识库维护", description: "维护和更新客服知识库内容", order: 1 },
            { id: "cs10", name: "新人带教辅导", description: "能够辅导新入职客服人员", order: 2 },
          ],
        },
      },
      skillConfigs: {
        cs1: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        cs2: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        cs3: { learningMethods: ["course", "practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        cs4: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        cs5: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        cs6: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        cs7: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        cs8: { learningMethods: ["course", "project"], courses: [], isRequired: true, verificationMethod: "project" },
        cs9: { learningMethods: ["project"], courses: [], isRequired: false, verificationMethod: "project" },
        cs10: { learningMethods: ["practice"], courses: [], isRequired: true, verificationMethod: "practice" },
      },
    },
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
    editorData: {
      id: "4",
      positionName: "药房营业员",
      levelRange: { start: 1, end: 3 },
      version: "v1.0",
      status: "disabled",
      levels: {
        P1: {
          skills: [
            { id: "ph1", name: "药品分类知识", description: "掌握处方药与非处方药的分类标准", order: 0 },
            { id: "ph2", name: "药品陈列规范", description: "按规范进行药品陈列和库存管理", order: 1 },
            { id: "ph3", name: "收银操作流程", description: "熟练掌握收银和发票开具流程", order: 2 },
          ],
        },
        P2: {
          skills: [
            { id: "ph4", name: "常见病症咨询", description: "能够回答常见病症的用药咨询", order: 0 },
            { id: "ph5", name: "药品相互作用", description: "了解常见药品间的相互作用", order: 1 },
          ],
        },
        P3: {
          skills: [
            { id: "ph6", name: "处方审核能力", description: "能够初步审核处方的合理性", order: 0 },
            { id: "ph7", name: "特殊药品管理", description: "掌握特殊管理药品的销售规范", order: 1 },
            { id: "ph8", name: "不良反应上报", description: "识别并上报药品不良反应", order: 2 },
          ],
        },
      },
      skillConfigs: {
        ph1: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        ph2: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        ph3: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        ph4: { learningMethods: ["course", "practice"], courses: [], isRequired: true, verificationMethod: "practice" },
        ph5: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        ph6: { learningMethods: ["course", "practice"], courses: [], isRequired: true, verificationMethod: "exam" },
        ph7: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
        ph8: { learningMethods: ["course"], courses: [], isRequired: true, verificationMethod: "exam" },
      },
    },
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
  
  // Editor drawer state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"view" | "edit" | "create">("create");
  const [selectedMap, setSelectedMap] = useState<LearningMap | null>(null);

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
    setEditorMode("create");
    setEditorOpen(true);
  };

  const handleViewMap = (map: LearningMap) => {
    setSelectedMap(map);
    setEditorMode("view");
    setEditorOpen(true);
  };

  const handleEditMap = (map: LearningMap) => {
    setSelectedMap(map);
    setEditorMode("edit");
    setEditorOpen(true);
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

  const handleEditorSave = (data: LearningMapEditorData) => {
    if (editorMode === "create") {
      // Create new map from editor data
      const skillCount = Object.values(data.levels).reduce(
        (sum, level) => sum + (level.skills?.length || 0),
        0
      );
      const newMap: LearningMap = {
        id: data.id || `map-${Date.now()}`,
        name: data.positionName + " 学习地图",
        position: data.positionName,
        positionId: `pos-${Date.now()}`,
        behaviorTagCount: skillCount,
        taskTagCount: 0,
        stageCount: data.levelRange.end - data.levelRange.start + 1,
        targetAudience: ["在岗"],
        status: data.status,
        version: data.version,
        updatedBy: "当前用户",
        updatedAt: new Date().toLocaleString("zh-CN"),
        description: `P${data.levelRange.start} – P${data.levelRange.end} 职级学习路径`,
        editorData: data,
      };
      setMaps((prev) => [...prev, newMap]);
    } else if (selectedMap) {
      // Update existing map
      const skillCount = Object.values(data.levels).reduce(
        (sum, level) => sum + (level.skills?.length || 0),
        0
      );
      const updatedMap: LearningMap = {
        ...selectedMap,
        name: data.positionName + " 学习地图",
        position: data.positionName,
        behaviorTagCount: skillCount,
        stageCount: data.levelRange.end - data.levelRange.start + 1,
        status: data.status,
        version: data.version,
        updatedBy: "当前用户",
        updatedAt: new Date().toLocaleString("zh-CN"),
        description: `P${data.levelRange.start} – P${data.levelRange.end} 职级学习路径`,
        editorData: data,
      };
      setMaps((prev) =>
        prev.map((m) => (m.id === selectedMap.id ? updatedMap : m))
      );
    }
    setEditorOpen(false);
  };

  const handleEditorPublish = (data: LearningMapEditorData) => {
    if (selectedMap) {
      setMaps((prev) =>
        prev.map((m) =>
          m.id === selectedMap.id ? { ...m, status: "published" as const } : m
        )
      );
    }
  };

  const handleEditorDisable = (data: LearningMapEditorData) => {
    if (selectedMap) {
      setMaps((prev) =>
        prev.map((m) =>
          m.id === selectedMap.id ? { ...m, status: "disabled" as const } : m
        )
      );
    }
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
              onCreateVersion={() => {}}
              onDisableMap={handleDisableMap}
            />
          </div>

          {/* Right: Map List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="搜索地图名/岗位..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  style={{ width: 256 }}
                  allowClear
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 120 }}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "draft", label: "草稿" },
                    { value: "published", label: "已发布" },
                    { value: "disabled", label: "已停用" },
                  ]}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button icon={<UploadOutlined />}>导入</Button>
                <Button icon={<DownloadOutlined />}>导出</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateMap}>
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Drawer */}
      <LearningMapEditor
        open={editorOpen}
        mode={editorMode}
        mapId={selectedMap?.id}
        initialData={selectedMap?.editorData}
        onClose={() => setEditorOpen(false)}
        onSave={handleEditorSave}
        onPublish={handleEditorPublish}
        onDisable={handleEditorDisable}
      />
    </DashboardLayout>
  );
}
