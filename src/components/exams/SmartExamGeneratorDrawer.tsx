import { useState } from "react";
import { Drawer, Button, Form, Input, InputNumber, Select, Card, Space, Typography, Tag, Radio, Checkbox, Divider, Empty, App, Steps } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined, HolderOutlined, LoadingOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeTreeSelect } from "@/components/knowledge-base/KnowledgeTreeSelect";

const { TextArea } = Input;
const { Text } = Typography;

type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "fill_blank" | "short_answer";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  options: QuestionOption[];
  correctAnswer?: string;
  score: number;
  explanation: string;
}

interface SmartExamGeneratorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (examData: {
    title: string;
    description: string;
    questions: Question[];
    passing_score: number;
    time_limit_minutes: number;
    max_attempts: number;
  }) => void;
}

const questionTypeLabels: Record<QuestionType, { label: string; color: string }> = {
  single_choice: { label: "单选题", color: "blue" },
  multiple_choice: { label: "多选题", color: "purple" },
  true_false: { label: "判断题", color: "green" },
  fill_blank: { label: "填空题", color: "cyan" },
  short_answer: { label: "问答题", color: "orange" },
};

export function SmartExamGeneratorDrawer({ open, onOpenChange, onSave }: SmartExamGeneratorDrawerProps) {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm] = Form.useForm();
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const [config, setConfig] = useState({
    knowledgeIds: [] as string[],
    questionCount: 20,
    selectedTypes: ["single_choice", "multiple_choice", "true_false", "fill_blank", "short_answer"] as QuestionType[],
    title: "",
    description: "",
    passingScore: 60,
    timeLimit: 30,
    maxAttempts: 3,
  });

  const handleGenerate = async () => {
    if (!config.title.trim()) {
      message.error("请输入试卷名称");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exam-questions", {
        body: {
          title: config.title,
          knowledgeIds: config.knowledgeIds,
          questionCount: config.questionCount,
          questionTypes: config.selectedTypes,
          description: config.description,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "生成失败");

      setQuestions(data.questions || []);
      setCurrentStep(1);
      message.success(`成功生成 ${data.questions?.length || 0} 道题目`);
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOption = (optId: string, field: "text" | "isCorrect", value: any) => {
    if (!editingQuestion) return;
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const newOpts = prev.options.map(o => {
        if (field === "isCorrect" && (prev.type === "single_choice" || prev.type === "true_false")) {
          return { ...o, isCorrect: o.id === optId };
        }
        return o.id === optId ? { ...o, [field]: value } : o;
      });
      return { ...prev, options: newOpts };
    });
  };

  const saveQuestion = async () => {
    try {
      const values = await questionForm.validateFields();
      const q: Question = {
        ...editingQuestion!,
        title: values.title,
        score: values.score,
        explanation: values.explanation || "",
        correctAnswer: values.correctAnswer,
        options: editingQuestion!.options,
      };
      setQuestions(prev => {
        const idx = prev.findIndex(p => p.id === q.id);
        return idx >= 0 ? prev.map((p, i) => i === idx ? q : p) : [...prev, q];
      });
      setEditingQuestion(null);
    } catch {
      message.error("请填写完整题目信息");
    }
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setQuestions(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggedIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const handleSave = () => {
    if (questions.length === 0) {
      message.error("请至少添加一道题目");
      return;
    }
    onSave({
      title: config.title,
      description: config.description,
      questions,
      passing_score: config.passingScore,
      time_limit_minutes: config.timeLimit,
      max_attempts: config.maxAttempts,
    });
  };

  const totalScore = questions.reduce((s, q) => s + q.score, 0);

  const renderConfigStep = () => (
    <div>
      <Form layout="vertical">
        <Form.Item label="试卷名称" required>
          <Input value={config.title} onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))} placeholder="请输入试卷名称" />
        </Form.Item>
        <Form.Item label="试卷描述">
          <TextArea value={config.description} onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))} rows={2} placeholder="试卷描述（可选）" />
        </Form.Item>

        <Divider>知识来源</Divider>
        <Form.Item label="选择知识库">
          <KnowledgeTreeSelect
            value={config.knowledgeIds}
            onChange={v => setConfig(prev => ({ ...prev, knowledgeIds: v }))}
            placeholder="选择知识库或文档（可多选）"
          />
        </Form.Item>

        <Divider>出题设置</Divider>
        <Form.Item label="题目数量">
          <InputNumber min={5} max={100} value={config.questionCount} onChange={v => setConfig(prev => ({ ...prev, questionCount: v || 20 }))} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="题目类型">
          <Checkbox.Group value={config.selectedTypes} onChange={v => setConfig(prev => ({ ...prev, selectedTypes: v as QuestionType[] }))}>
            <Space wrap>
              {Object.entries(questionTypeLabels).map(([k, v]) => (
                <Checkbox key={k} value={k}><Tag color={v.color}>{v.label}</Tag></Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>

        <Divider>考试设置</Divider>
        <Space size="large">
          <Form.Item label="通关分数">
            <InputNumber min={0} max={100} value={config.passingScore} onChange={v => setConfig(prev => ({ ...prev, passingScore: v || 60 }))} addonAfter="分" />
          </Form.Item>
          <Form.Item label="时间限制">
            <InputNumber min={5} max={180} value={config.timeLimit} onChange={v => setConfig(prev => ({ ...prev, timeLimit: v || 30 }))} addonAfter="分钟" />
          </Form.Item>
          <Form.Item label="尝试次数">
            <InputNumber min={1} max={10} value={config.maxAttempts} onChange={v => setConfig(prev => ({ ...prev, maxAttempts: v || 3 }))} addonAfter="次" />
          </Form.Item>
        </Space>
      </Form>

      <Button type="primary" size="large" block icon={isGenerating ? <LoadingOutlined /> : <PlusOutlined />} onClick={handleGenerate} loading={isGenerating} style={{ marginTop: 16 }}>
        AI 智能出题
      </Button>
    </div>
  );

  const renderQuestionsStep = () => (
    <div>
      <Button onClick={() => setCurrentStep(0)} style={{ marginBottom: 16 }}>返回设置</Button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text>共 {questions.length} 题，满分 {totalScore} 分 <Text type="secondary">（拖拽调整顺序）</Text></Text>
        <Space>
          {Object.entries(questionTypeLabels).map(([k, v]) => (
            <Button key={k} size="small" icon={<PlusOutlined />} onClick={() => {
              const newQ: Question = {
                id: String(Date.now()), type: k as QuestionType, title: "", score: 10, explanation: "", correctAnswer: "",
                options: k === "true_false" ? [{ id: "t", text: "正确", isCorrect: true }, { id: "f", text: "错误", isCorrect: false }]
                  : (k === "short_answer" || k === "fill_blank") ? [] : [{ id: "a", text: "", isCorrect: true }, { id: "b", text: "", isCorrect: false }, { id: "c", text: "", isCorrect: false }, { id: "d", text: "", isCorrect: false }],
              };
              setEditingQuestion(newQ);
              questionForm.setFieldsValue(newQ);
            }}>{v.label}</Button>
          ))}
        </Space>
      </div>

      {questions.map((q, idx) => (
        <Card key={q.id} size="small" style={{ marginBottom: 8, cursor: "grab", borderLeft: draggedIdx === idx ? "3px solid #1677ff" : undefined }}
          draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
          title={
            <Space>
              <HolderOutlined style={{ color: "#999", cursor: "grab" }} />
              <Tag color={questionTypeLabels[q.type].color}>{questionTypeLabels[q.type].label}</Tag>
              <Text>第 {idx + 1} 题 ({q.score}分)</Text>
            </Space>
          }
          extra={
            <Space>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingQuestion(q); questionForm.setFieldsValue(q); }} />
              <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => setQuestions(prev => prev.filter(p => p.id !== q.id))} />
            </Space>
          }
        >
          <Text>{q.title || "未填写题目"}</Text>
          {(q.type === "single_choice" || q.type === "multiple_choice" || q.type === "true_false") && (
            <div style={{ marginTop: 8 }}>
              {q.options.map(o => (
                <Tag key={o.id} color={o.isCorrect ? "green" : undefined} style={{ marginBottom: 4 }}>
                  {o.isCorrect && <CheckCircleOutlined />} {o.text || "未填"}
                </Tag>
              ))}
            </div>
          )}
          {q.type === "fill_blank" && q.correctAnswer && <Tag color="cyan" style={{ marginTop: 4 }}>答案: {q.correctAnswer}</Tag>}
        </Card>
      ))}

      {editingQuestion && (
        <Card title="编辑题目" style={{ marginTop: 16, borderColor: "#1677ff" }}
          extra={<Space><Button size="small" onClick={() => setEditingQuestion(null)}>取消</Button><Button type="primary" size="small" onClick={saveQuestion}>确认</Button></Space>}
        >
          <Form form={questionForm} layout="vertical">
            <Form.Item label="题目内容" name="title" rules={[{ required: true, message: "请输入题目" }]}>
              <TextArea rows={3} placeholder="请输入题目内容" />
            </Form.Item>
            <Form.Item label="分值" name="score"><InputNumber min={1} max={50} /></Form.Item>

            {editingQuestion.type === "true_false" && (
              <Form.Item label="正确答案" name="correctAnswer">
                <Radio.Group><Radio value="true">正确</Radio><Radio value="false">错误</Radio></Radio.Group>
              </Form.Item>
            )}

            {(editingQuestion.type === "single_choice" || editingQuestion.type === "multiple_choice") && (
              <>
                <Text strong>选项 {editingQuestion.type === "single_choice" ? "(单选)" : "(多选)"}</Text>
                {editingQuestion.options.map(opt => (
                  <div key={opt.id} style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    {editingQuestion.type === "single_choice" ? (
                      <Radio checked={opt.isCorrect} onChange={() => updateOption(opt.id, "isCorrect", true)} />
                    ) : (
                      <Checkbox checked={opt.isCorrect} onChange={e => updateOption(opt.id, "isCorrect", e.target.checked)} />
                    )}
                    <Input value={opt.text} onChange={e => updateOption(opt.id, "text", e.target.value)} placeholder={`选项 ${opt.id.toUpperCase()}`} style={{ flex: 1 }} />
                  </div>
                ))}
                <Button type="dashed" size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }}
                  onClick={() => setEditingQuestion(prev => prev ? { ...prev, options: [...prev.options, { id: String.fromCharCode(97 + prev.options.length), text: "", isCorrect: false }] } : prev)}>
                  添加选项
                </Button>
              </>
            )}

            {editingQuestion.type === "fill_blank" && (
              <Form.Item label="正确答案" name="correctAnswer"><Input placeholder="填写正确答案" /></Form.Item>
            )}

            {editingQuestion.type === "short_answer" && (
              <Form.Item label="参考答案 (AI评分依据)" name="correctAnswer"><TextArea rows={3} placeholder="填写参考答案，AI将据此评分" /></Form.Item>
            )}

            <Form.Item label="解析" name="explanation"><TextArea rows={2} placeholder="题目解析（可选）" /></Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );

  return (
    <Drawer title="智能组卷" placement="right" width="50vw" open={open} onClose={() => onOpenChange(false)} zIndex={1000}
      extra={<Steps current={currentStep} items={[{ title: "配置" }, { title: "编辑题目" }]} size="small" style={{ width: 200 }} />}
      footer={currentStep === 1 ? (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">共 {questions.length} 题，满分 {totalScore} 分</Text>
          <Space><Button onClick={() => onOpenChange(false)}>取消</Button><Button type="primary" onClick={handleSave}>保存试卷</Button></Space>
        </div>
      ) : null}
    >
      {currentStep === 0 ? renderConfigStep() : renderQuestionsStep()}
    </Drawer>
  );
}
