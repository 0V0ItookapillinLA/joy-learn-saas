import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BehaviorTagTable } from "@/components/tags/BehaviorTagTable";
import { BehaviorTagDrawer } from "@/components/tags/BehaviorTagDrawer";
import { NewBehaviorTagSheet } from "@/components/tags/NewBehaviorTagSheet";
import { TaskTagTree } from "@/components/tags/TaskTagTree";
import { TaskTagDetailPanel } from "@/components/tags/TaskTagDetailPanel";
import { AliasMappingTable } from "@/components/tags/AliasMappingTable";

export default function GrowthMap() {
  const [activeTab, setActiveTab] = useState("behavior");
  
  // Behavior tag states
  const [selectedBehaviorDomain, setSelectedBehaviorDomain] = useState<string | null>(null);
  const [selectedBehaviorCluster, setSelectedBehaviorCluster] = useState<string | null>(null);
  const [viewingTagId, setViewingTagId] = useState<string | null>(null);
  const [tagDrawerOpen, setTagDrawerOpen] = useState(false);
  const [newTagSheetOpen, setNewTagSheetOpen] = useState(false);

  // Task tag states
  const [selectedTaskPosition, setSelectedTaskPosition] = useState<string | null>("pos-1");
  const [selectedTaskDomain, setSelectedTaskDomain] = useState<string | null>(null);
  const [selectedTaskCluster, setSelectedTaskCluster] = useState<string | null>(null);

  const handleViewTag = (tagId: string) => {
    setViewingTagId(tagId);
    setTagDrawerOpen(true);
  };

  return (
    <DashboardLayout 
      title="成长地图标签库" 
      description="管理通用技能标签、专业能力标签与岗位术语映射"
    >
      <div className="flex h-[calc(100vh-180px)] flex-col">
        {/* Top Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <div className="border-b px-1">
            <TabsList className="h-10">
              <TabsTrigger value="behavior">通用技能标签</TabsTrigger>
              <TabsTrigger value="task">专业能力标签</TabsTrigger>
              <TabsTrigger value="alias">别名与映射</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="behavior" className="mt-0 flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Full width table - no left tree */}
              <div className="flex-1 overflow-hidden">
                <BehaviorTagTable
                  onViewTag={handleViewTag}
                  onNewTag={() => setNewTagSheetOpen(true)}
                  selectedDomain={selectedBehaviorDomain}
                  selectedCluster={selectedBehaviorCluster}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="task" className="mt-0 flex-1 overflow-hidden">
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
              {/* Right: Detail View when cluster selected, otherwise Table */}
              <div className="flex-1 overflow-hidden">
                <TaskTagDetailPanel
                  selectedPosition={selectedTaskPosition}
                  selectedDomain={selectedTaskDomain}
                  selectedCluster={selectedTaskCluster}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alias" className="mt-0 flex-1 overflow-hidden">
            <AliasMappingTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Drawers & Sheets */}
      <BehaviorTagDrawer
        open={tagDrawerOpen}
        onOpenChange={setTagDrawerOpen}
        tagId={viewingTagId}
      />
      <NewBehaviorTagSheet
        open={newTagSheetOpen}
        onOpenChange={setNewTagSheetOpen}
      />
    </DashboardLayout>
  );
}
