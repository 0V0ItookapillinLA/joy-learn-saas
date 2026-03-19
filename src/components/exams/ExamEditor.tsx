import { useState } from "react";
import { Drawer, Button, Form, Input, InputNumber, Select, Card, Space, Typography, Tag, Radio, Checkbox, Divider, Empty, App } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";

const { TextArea } = Input;
const { Text, Title } = Typography;

type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "short_answer";

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
  correctAnswer?: string; // for true_false and short_answer
  score: number;
  explanation: string;
}

interface ExamEditorProps {
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
  initialData?: {
    title?: string;
    description?: string;
    questions?: Question[];
    passing_score?: number;
    time_limit_minutes?: number;
    max_attempts?: number;
  };
}

const questionTypeLabels: Record<QuestionType, { label: string; color: string }> = {
  single_choice: { label: "单选题", color: "blue" },
  multiple_choice: { label: "多选题", color: "purple" },
  true_false: { label: "判断题", color: "green" },
  short_answer: { label: "简答题", color: "orange" },
};

export function ExamEditor({ open, onOpenChange, onSave, initialData }: ExamEditorProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm] = Form.useForm();

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: String(Date.now()),
      type,
      title: "",
      options: type === "true_false"
        ? [{ id: "t", text: "正确", isCorrect: true }, { id: "f", text: "错误", isCorrect: false }]
        : type === "short_answer"
        ? []
        : [
            { id: "a", text: "", isCorrect: true },
            { id: "b", text: "", isCorrect: false },
            { id: "c", text: "", isCorrect: false },
            { id: "d", text: "", isCorrect: false },
          ],
      score: 10,
      explanation: "",
      correctAnswer: type === "true_false" ? "true" : "",
    };
    setEditingQuestion(newQ);
    questionForm.setFieldsValue(newQ);
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

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateOption = (optId: string, field: "text" | "isCorrect", value: any) => {
    if (!editingQuestion) return;
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const newOpts = prev.options.map(o => {
        if (field === "isCorrect" && prev.type === "single_choice") {
          return { ...o, isCorrect: o.id === optId };
        }
        return o.id === optId ? { ...o, [field]: value } : o;
      });
      return { ...prev, options: newOpts };
    });
  };

  const addOption = () => {
    if (!editingQuestion) return;
    const newId = String.fromCharCode(97 + editingQuestion.options.length);
    setEditingQuestion(prev => prev ? {
      ...prev,
      options: [...prev.options, { id: newId, text: "", isCorrect: false }],
    } : prev);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (questions.length === 0) {
        message.error("请至少添加一道题目");
        return;
      }
      onSave({
        title: values.title,
        description: values.description || "",
        questions,
        passing_score: values.passing_score,
        time_limit_minutes: values.time_limit_minutes,
        max_attempts: values.max_attempts,
      });
      onOpenChange(false);
    } catch {
      message.error("请填写考试基本信息");
    }
  };

  const totalScore = questions.reduce((s, q) => s + q.score, 0);

  return (
    <Drawer
      title="创建考试"
      open={open}
      onClose={() => onOpenChange(false)}
      width="50vw"
      zIndex={1000}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">共 {questions.length} 题，满分 {totalScore} 分</Text>
          <Space>
            <Button onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>保存考试</Button>
          </Space>
        </div>
      }
    >
      {/* Basic Info */}
      <Form form={form} layout="vertical" initialValues={{
        title: initialData?.title || "",
        description: initialData?.description || "",
        passing_score: initialData?.passing_score || 60,
        time_limit_minutes: initialData?.time_limit_minutes || 30,
        max_attempts: initialData?.max_attempts || 3,
      }}>
        <Form.Item label="考试名称" name="title" rules={[{ required: true }]}>
          <Input placeholder="请输入考试名称" />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <TextArea rows={2} placeholder="考试描述" />
        </Form.Item>
        <Space size="large">
          <Form.Item label="通关分数" name="passing_score" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} addonAfter="分" />
          </Form.Item>
          <Form.Item label="时间限制" name="time_limit_minutes">
            <InputNumber min={5} max={180} addonAfter="分钟" />
          </Form.Item>
          <Form.Item label="最大尝试" name="max_attempts">
            <InputNumber min={1} max={10} addonAfter="次" />
          </Form.Item>
        </Space>
      </Form>

      <Divider>题目列表</Divider>

      {/* Question List */}
      {questions.length === 0 ? (
        <Empty description="暂无题目，请添加" style={{ margin: "24px 0" }} />
      ) : (
        questions.map((q, idx) => (
          <Card
            key={q.id}
            size="small"
            style={{ marginBottom: 12 }}
            title={
              <Space>
                <Tag color={questionTypeLabels[q.type].color}>{questionTypeLabels[q.type].label}</Tag>
                <Text>第 {idx + 1} 题 ({q.score}分)</Text>
              </Space>
            }
            extra={
              <Space>
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => {
                  setEditingQuestion(q);
                  questionForm.setFieldsValue(q);
                }} />
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeQuestion(q.id)} />
              </Space>
            }
          >
            <Text>{q.title || "未填写题目"}</Text>
            {q.type !== "short_answer" && (
              <div style={{ marginTop: 8 }}>
                {q.options.map(o => (
                  <Tag key={o.id} color={o.isCorrect ? "green" : undefined} style={{ marginBottom: 4 }}>
                    {o.isCorrect && <CheckCircleOutlined />} {o.text || "未填"}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        ))
      )}

      {/* Add Question Buttons */}
      <Space style={{ marginTop: 8 }}>
        <Button icon={<PlusOutlined />} onClick={() => addQuestion("single_choice")}>单选题</Button>
        <Button icon={<PlusOutlined />} onClick={() => addQuestion("multiple_choice")}>多选题</Button>
        <Button icon={<PlusOutlined />} onClick={() => addQuestion("true_false")}>判断题</Button>
        <Button icon={<PlusOutlined />} onClick={() => addQuestion("short_answer")}>简答题</Button>
      </Space>

      {/* Question Editor Modal */}
      {editingQuestion && (
        <Card
          title={<><QuestionCircleOutlined /> 编辑题目</>}
          style={{ marginTop: 16, borderColor: "#1677ff" }}
          extra={
            <Space>
              <Button size="small" onClick={() => setEditingQuestion(null)}>取消</Button>
              <Button type="primary" size="small" onClick={saveQuestion}>确认</Button>
            </Space>
          }
        >
          <Form form={questionForm} layout="vertical">
            <Form.Item label="题目内容" name="title" rules={[{ required: true, message: "请输入题目" }]}>
              <TextArea rows={3} placeholder="请输入题目内容" />
            </Form.Item>
            <Form.Item label="分值" name="score">
              <InputNumber min={1} max={50} />
            </Form.Item>

            {editingQuestion.type === "true_false" && (
              <Form.Item label="正确答案" name="correctAnswer">
                <Radio.Group>
                  <Radio value="true">正确</Radio>
                  <Radio value="false">错误</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            {(editingQuestion.type === "single_choice" || editingQuestion.type === "multiple_choice") && (
              <>
                <Text strong>选项 {editingQuestion.type === "single_choice" ? "(单选)" : "(多选)"}</Text>
                {editingQuestion.options.map((opt) => (
                  <div key={opt.id} style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    {editingQuestion.type === "single_choice" ? (
                      <Radio
                        checked={opt.isCorrect}
                        onChange={() => updateOption(opt.id, "isCorrect", true)}
                      />
                    ) : (
                      <Checkbox
                        checked={opt.isCorrect}
                        onChange={(e) => updateOption(opt.id, "isCorrect", e.target.checked)}
                      />
                    )}
                    <Input
                      value={opt.text}
                      onChange={(e) => updateOption(opt.id, "text", e.target.value)}
                      placeholder={`选项 ${opt.id.toUpperCase()}`}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOption} style={{ marginTop: 8 }}>
                  添加选项
                </Button>
              </>
            )}

            {editingQuestion.type === "short_answer" && (
              <Form.Item label="参考答案 (AI评分依据)" name="correctAnswer">
                <TextArea rows={3} placeholder="填写参考答案，AI将据此评分" />
              </Form.Item>
            )}

            <Form.Item label="解析" name="explanation">
              <TextArea rows={2} placeholder="题目解析（可选）" />
            </Form.Item>
          </Form>
        </Card>
      )}
    </Drawer>
  );
}
