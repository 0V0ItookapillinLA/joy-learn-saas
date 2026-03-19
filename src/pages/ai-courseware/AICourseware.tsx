import { useState } from "react";
import { Tabs } from "antd";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseCreator } from "@/components/ai-courseware/CourseCreator";
import { MyCoursesList } from "@/components/ai-courseware/MyCoursesList";

export default function AICourseware() {
  const [activeTab, setActiveTab] = useState("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditCourse = (id: string) => {
    setEditingId(id);
    setActiveTab("create");
  };

  return (
    <DashboardLayout title="AI 制课" description="AI 自动生成互动课程，支持多角色课堂与实时讨论">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key !== "create") setEditingId(null);
        }}
        items={[
          {
            key: "create",
            label: "AI 制课",
            children: <CourseCreator editingId={editingId} onCreated={() => { setActiveTab("courses"); setEditingId(null); }} />,
          },
          {
            key: "courses",
            label: "我的课程",
            children: <MyCoursesList onEdit={handleEditCourse} />,
          },
        ]}
      />
    </DashboardLayout>
  );
}
