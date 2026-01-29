import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs } from "antd";
import { BehaviorTagTree } from "@/components/tags/BehaviorTagTree";
import { BehaviorTagTable } from "@/components/tags/BehaviorTagTable";
import { BehaviorTagDrawer } from "@/components/tags/BehaviorTagDrawer";
import { NewBehaviorTagSheet } from "@/components/tags/NewBehaviorTagSheet";
import { TaskTagTree } from "@/components/tags/TaskTagTree";
import { TaskTagTable } from "@/components/tags/TaskTagTable";
import { AliasMappingTable } from "@/components/tags/AliasMappingTable";

export interface BehaviorTagData {
  id: string;
  name: string;
  domain: string;
  cluster: string;
  positions: string[];
  growthPath: { complete: boolean; currentLevel: string; maxLevel: string };
  status: string;
  version: string;
  updatedBy: string;
  updatedAt: string;
}

export default function GrowthMap() {
  const [activeTab, setActiveTab] = useState("behavior");
  
  // Behavior tag states
  const [selectedBehaviorDomain, setSelectedBehaviorDomain] = useState<string | null>(null);
  const [selectedBehaviorCluster, setSelectedBehaviorCluster] = useState<string | null>(null);
  const [viewingTag, setViewingTag] = useState<BehaviorTagData | null>(null);
  const [tagDrawerOpen, setTagDrawerOpen] = useState(false);
  const [tagDrawerMode, setTagDrawerMode] = useState<"view" | "edit">("view");
  const [newTagSheetOpen, setNewTagSheetOpen] = useState(false);

  // Task tag states
  const [selectedTaskPosition, setSelectedTaskPosition] = useState<string | null>("pos-1");
  const [selectedTaskDomain, setSelectedTaskDomain] = useState<string | null>(null);
  const [selectedTaskCluster, setSelectedTaskCluster] = useState<string | null>(null);

  const handleViewTag = (tag: BehaviorTagData) => {
    setViewingTag(tag);
    setTagDrawerMode("view");
    setTagDrawerOpen(true);
  };

  const handleEditTag = (tag: BehaviorTagData) => {
    setViewingTag(tag);
    setTagDrawerMode("edit");
    setTagDrawerOpen(true);
  };

  const tabItems = [
    {
      key: "behavior",
      label: "通用技能标签",
      children: (
        <div className="flex h-full">
          {/* Left: Tree */}
          <div className="w-[280px] shrink-0">
            <BehaviorTagTree
              selectedDomain={selectedBehaviorDomain}
              selectedCluster={selectedBehaviorCluster}
              onSelectDomain={setSelectedBehaviorDomain}
              onSelectCluster={setSelectedBehaviorCluster}
            />
          </div>
          {/* Right: Table */}
          <div className="flex-1 overflow-hidden">
            <BehaviorTagTable
              onViewTag={handleViewTag}
              onEditTag={handleEditTag}
              onNewTag={() => setNewTagSheetOpen(true)}
              selectedDomain={selectedBehaviorDomain}
              selectedCluster={selectedBehaviorCluster}
            />
          </div>
        </div>
      ),
    },
    {
      key: "task",
      label: "专业能力标签",
      children: (
        <div className="flex h-full">
          {/* Left: Tree */}
          <div className="w-[280px] shrink-0">
            <TaskTagTree
              selectedPosition={selectedTaskPosition}
              selectedDomain={selectedTaskDomain}
              selectedCluster={selectedTaskCluster}
              onSelectPosition={setSelectedTaskPosition}
              onSelectDomain={setSelectedTaskDomain}
              onSelectCluster={setSelectedTaskCluster}
            />
          </div>
          {/* Right: Table */}
          <div className="flex-1 overflow-hidden">
            <TaskTagTable
              selectedPosition={selectedTaskPosition || "物流销售"}
              selectedDomain={selectedTaskDomain}
              selectedCluster={selectedTaskCluster}
            />
          </div>
        </div>
      ),
    },
    {
      key: "alias",
      label: "别名与映射",
      children: <AliasMappingTable />,
    },
  ];

  return (
    <DashboardLayout 
      title="成长地图标签库" 
      description="管理通用技能标签、专业能力标签与岗位术语映射"
    >
      <div className="flex h-[calc(100vh-180px)] flex-col">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="h-full [&_.ant-tabs-content]:h-full [&_.ant-tabs-tabpane]:h-full"
        />
      </div>

      {/* Drawers & Sheets */}
      <BehaviorTagDrawer
        open={tagDrawerOpen}
        onOpenChange={setTagDrawerOpen}
        tag={viewingTag}
        mode={tagDrawerMode}
        onModeChange={setTagDrawerMode}
      />
      <NewBehaviorTagSheet
        open={newTagSheetOpen}
        onOpenChange={setNewTagSheetOpen}
      />
    </DashboardLayout>
  );
}
