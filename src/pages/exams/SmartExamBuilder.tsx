import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Table, Tag, Space, Input, Statistic, Row, Col, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { ExamEditor } from "@/components/exams/ExamEditor";
import { useExams, useCreateExam, useDeleteExam } from "@/hooks/useExams";
import type { ColumnsType } from "antd/es/table";
import { SmartExamGeneratorDrawer } from "@/components/exams/SmartExamGeneratorDrawer";

export default function SmartExamBuilder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  const { data: exams, isLoading } = useExams();
  const createMutation = useCreateExam();
  const deleteMutation = useDeleteExam();

  const filteredExams = (exams || []).filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveExam = async (examData: any) => {
    await createMutation.mutateAsync({
      title: examData.title,
      description: examData.description,
      questions: examData.questions as any,
      passing_score: examData.passing_score,
      time_limit_minutes: examData.time_limit_minutes,
      max_attempts: examData.max_attempts,
      is_active: true,
      exam_type: "smart",
    });
  };

  const handleGeneratorSave = async (examData: any) => {
    await createMutation.mutateAsync({
      title: examData.title,
      description: examData.description,
      questions: examData.questions as any,
      passing_score: examData.passing_score,
      time_limit_minutes: examData.time_limit_minutes,
      max_attempts: examData.max_attempts,
      is_active: true,
      exam_type: "smart",
    });
    setGeneratorOpen(false);
  };

  const columns: ColumnsType<any> = [
    {
      title: "试卷名称", dataIndex: "title", key: "title",
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "题目数", key: "count",
      render: (_: any, record: any) => {
        const qs = Array.isArray(record.questions) ? record.questions : [];
        return <Tag>{qs.length} 题</Tag>;
      },
    },
    {
      title: "通关分数", dataIndex: "passing_score", key: "passing_score",
      render: (v: number) => v ? `${v} 分` : "-",
    },
    {
      title: "时间限制", dataIndex: "time_limit_minutes", key: "time",
      render: (v: number) => v ? `${v} 分钟` : "不限",
    },
    {
      title: "创建时间", dataIndex: "created_at", key: "created_at",
      render: (d: string) => d ? new Date(d).toLocaleDateString() : "-",
    },
    {
      title: "操作", key: "action", align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => { setEditingExam(record); setEditorOpen(true); }}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => deleteMutation.mutate(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="智能组卷" description="AI自动生成试卷，支持多种题型">
      <div className="space-y-6">
        <Row gutter={16}>
          <Col xs={12} sm={6}><Card><Statistic title="试卷总数" value={filteredExams.length} /></Card></Col>
          <Col xs={12} sm={6}><Card><Statistic title="已启用" value={filteredExams.length} valueStyle={{ color: "#3b82f6" }} /></Card></Col>
          <Col xs={12} sm={6}><Card><Statistic title="考试人数" value={0} /></Card></Col>
          <Col xs={12} sm={6}><Card><Statistic title="平均通过率" value={0} suffix="%" /></Card></Col>
        </Row>

        <div className="flex items-center justify-between">
          <Input placeholder="搜索试卷..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />} style={{ width: 320 }} allowClear />
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setGeneratorOpen(true)}>智能组卷</Button>
            <Button icon={<PlusOutlined />} onClick={() => { setEditingExam(null); setEditorOpen(true); }}>手动创建</Button>
          </Space>
        </div>

        <Card bodyStyle={{ padding: 0 }}>
          <Table columns={columns} dataSource={filteredExams} rowKey="id" loading={isLoading}
            locale={{ emptyText: <div className="py-8 text-gray-500"><p>暂无试卷</p><p className="text-sm">点击"智能组卷"创建第一张试卷</p></div> }}
            pagination={{ showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }} />
        </Card>
      </div>

      <ExamEditor open={editorOpen} onOpenChange={setEditorOpen} onSave={handleSaveExam} initialData={editingExam ? {
        title: editingExam.title, description: editingExam.description,
        questions: Array.isArray(editingExam.questions) ? editingExam.questions : [],
        passing_score: editingExam.passing_score, time_limit_minutes: editingExam.time_limit_minutes,
        max_attempts: editingExam.max_attempts,
      } : undefined} />

      <SmartExamGeneratorDrawer open={generatorOpen} onOpenChange={setGeneratorOpen} onSave={handleGeneratorSave} />
    </DashboardLayout>
  );
}
