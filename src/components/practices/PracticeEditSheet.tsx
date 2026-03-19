import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Select, Tabs, Card, Space, InputNumber, Typography, App, Tag, Divider, Checkbox, Empty } from "antd";
import { PlusOutlined, DeleteOutlined, MessageOutlined, FileTextOutlined, CheckCircleOutlined, LoadingOutlined, EditOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAICharacters } from "@/hooks/useAICharacters";

const { TextArea } = Input;
const { Text } = Typography;

interface AssessmentItem {
  id: string;
  name: string;
  weight: number;
}

interface DialogTurn {
  id: string;
  aiContent: string;
  traineeAnswer: string;
  keyPoints: string;
  editing?: boolean;
}

interface PracticeFormData {
  title: string;
  department: string;
  description: string;
  scenarioDescription: string;
  aiRoleId: string;
  aiRoleInfo: string;
  traineeRole: string;
  dialogueGoal: string;
  passScore: number;
  passAttempts: number;
  assessmentItems: AssessmentItem[];
  dialogTurns: DialogTurn[];
}

interface PracticeEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PracticeFormData) => void;
  initialData?: Partial<PracticeFormData>;
}

const defaultAssessmentItems: AssessmentItem[] = [
  { id: "1", name: "非权力影响", weight: 40 },
  { id: "2", name: "非权力影响", weight: 0 },
  { id: "3", name: "勇于进取", weight: 0 },
  { id: "4", name: "跨界思考", weight: 0 },
];

export function PracticeEditSheet({ open, onOpenChange, onSave, initialData }: PracticeEditSheetProps) {
  const { message } = App.useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [practiceMode, setPracticeMode] = useState<"free" | "fixed">("free");
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [form] = Form.useForm();
  const [dialogTurns, setDialogTurns] = useState<DialogTurn[]>([]);

  const { data: aiCharacters = [], isLoading: isLoadingCharacters } = useActiveAICharacters();

  const [formData, setFormData] = useState<PracticeFormData>({
    title: "",
    department: "",
    description: "",
    scenarioDescription: "",
    aiRoleId: "",
    aiRoleInfo: "",
    traineeRole: "",
    dialogueGoal: "",
    passScore: 50,
    passAttempts: 3,
    assessmentItems: defaultAssessmentItems,
    dialogTurns: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      form.setFieldsValue(initialData);
      setDialogTurns(initialData.dialogTurns || []);
      setStep(2);
      setPracticeMode(initialData.dialogTurns?.length ? "fixed" : "free");
    } else {
      setFormData({
        title: "", department: "", description: "", scenarioDescription: "",
        aiRoleId: "", aiRoleInfo: "", traineeRole: "", dialogueGoal: "",
        passScore: 50, passAttempts: 3, assessmentItems: defaultAssessmentItems, dialogTurns: [],
      });
      form.resetFields();
      setStep(1);
      setPromptInput("");
      setActiveTab("basic");
      setDialogTurns([]);
    }
  }, [initialData, open, form]);

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      message.error("请输入练习场景描述");
      return;
    }

    setIsGenerating(true);
    try {
      if (practiceMode === "fixed") {
        // Use dialog script generation for fixed mode
        const { data, error } = await supabase.functions.invoke("generate-dialog-script", {
          body: {
            title: promptInput.trim().slice(0, 30),
            sceneDescription: promptInput.trim(),
            knowledgeContent: "",
            assessmentDimensions: formData.assessmentItems.map(i => i.name).filter(Boolean),
          },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "生成失败");

        const turns: DialogTurn[] = (data.dialog_turns || []).map((t: any, idx: number) => ({
          id: t.id || String(idx + 1),
          aiContent: t.speaker === "companion" ? t.content : (t.standard_answer || ""),
          traineeAnswer: t.speaker === "trainee" ? t.content : (t.standard_answer || ""),
          keyPoints: (t.key_points || []).map((kp: any) => kp.content).join("；"),
        }));

        // Pair consecutive companion+trainee turns into single rounds
        const pairedTurns: DialogTurn[] = [];
        let i = 0;
        const rawTurns = data.dialog_turns || [];
        while (i < rawTurns.length) {
          const current = rawTurns[i];
          const next = rawTurns[i + 1];
          if (current.speaker === "companion" && next?.speaker === "trainee") {
            pairedTurns.push({
              id: String(pairedTurns.length + 1),
              aiContent: current.content || "",
              traineeAnswer: next.standard_answer || next.content || "",
              keyPoints: [...(current.key_points || []), ...(next.key_points || [])].map((kp: any) => kp.content).join("；"),
            });
            i += 2;
          } else {
            pairedTurns.push({
              id: String(pairedTurns.length + 1),
              aiContent: current.speaker === "companion" ? current.content : "",
              traineeAnswer: current.speaker === "trainee" ? (current.standard_answer || current.content) : "",
              keyPoints: (current.key_points || []).map((kp: any) => kp.content).join("；"),
            });
            i += 1;
          }
        }

        setDialogTurns(pairedTurns);
        const newFormData = {
          ...formData,
          title: data.summary?.slice(0, 30) || promptInput.slice(0, 20),
          description: `固定剧本练习：${promptInput}`,
          scenarioDescription: promptInput,
          dialogTurns: pairedTurns,
        };
        setFormData(newFormData);
        form.setFieldsValue(newFormData);
        setStep(2);
        setActiveTab("dialogue");
        message.success("对话剧本已生成，可在下方编辑");
      } else {
        // Free dialogue mode - use existing practice script generation
        const { data, error } = await supabase.functions.invoke("generate-practice-script", {
          body: { prompt: promptInput.trim(), practiceMode },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "生成失败");

        const script = data.script;
        const newFormData = {
          ...formData,
          title: script.title || promptInput.slice(0, 20),
          description: script.description || `培训场景：${promptInput}`,
          scenarioDescription: script.scenarioDescription || "",
          aiRoleInfo: script.aiRoleInfo || "",
          traineeRole: script.traineeRole || "",
          dialogueGoal: script.dialogueGoal || "",
          assessmentItems: script.assessmentItems || defaultAssessmentItems,
        };
        setFormData(newFormData);
        form.setFieldsValue(newFormData);
        setStep(2);
        message.success("练习剧本已生成");
      }
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Dialog turn editing
  const updateTurn = (id: string, field: keyof DialogTurn, value: string) => {
    setDialogTurns(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTurn = (id: string) => {
    setDialogTurns(prev => prev.filter(t => t.id !== id));
  };

  const addTurn = () => {
    setDialogTurns(prev => [...prev, {
      id: String(Date.now()),
      aiContent: "",
      traineeAnswer: "",
      keyPoints: "",
      editing: true,
    }]);
  };

  // Assessment items
  const addAssessmentItem = () => {
    setFormData((prev) => ({
      ...prev,
      assessmentItems: [...prev.assessmentItems, { id: String(Date.now()), name: "", weight: 0 }],
    }));
  };

  const removeAssessmentItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      assessmentItems: prev.assessmentItems.filter((item) => item.id !== id),
    }));
  };

  const updateAssessmentItem = (id: string, field: "name" | "weight", value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      assessmentItems: prev.assessmentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...formData, ...values, dialogTurns });
      onOpenChange(false);
    } catch (error) {
      message.error("请填写完整信息");
    }
  };

  const renderStep1 = () => (
    <div>
      <Card title="选择练习模式" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Card
            hoverable
            style={{ flex: 1, borderColor: practiceMode === "free" ? "#1677ff" : undefined }}
            onClick={() => setPracticeMode("free")}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <MessageOutlined style={{ fontSize: 24, color: "#1677ff" }} />
              <div>
                <Text strong>自由对话</Text>
                <br />
                <Text type="secondary">AI根据场景自由发挥对话</Text>
              </div>
              {practiceMode === "free" && <CheckCircleOutlined style={{ color: "#1677ff", marginLeft: "auto" }} />}
            </div>
          </Card>
          <Card
            hoverable
            style={{ flex: 1, borderColor: practiceMode === "fixed" ? "#1677ff" : undefined }}
            onClick={() => setPracticeMode("fixed")}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <FileTextOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
              <div>
                <Text strong>固定剧本</Text>
                <br />
                <Text type="secondary">AI按照预设对话流程进行</Text>
              </div>
              {practiceMode === "fixed" && <CheckCircleOutlined style={{ color: "#1677ff", marginLeft: "auto" }} />}
            </div>
          </Card>
        </div>
      </Card>

      <Card title="创建练习">
        <Form.Item label="AI角色设置">
          <Select
            value={formData.aiRoleId || undefined}
            onChange={(value) => {
              const selected = aiCharacters.find((c) => c.id === value);
              setFormData({ ...formData, aiRoleId: value, aiRoleInfo: selected?.personality || "" });
            }}
            loading={isLoadingCharacters}
            placeholder="请选择AI角色"
            allowClear
          >
            {aiCharacters.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="场景描述">
          <TextArea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder={practiceMode === "fixed"
              ? "请描述对话场景，AI将自动生成每一轮对话内容（如：客户咨询保险产品，销售顾问需要了解客户需求并推荐合适的产品）"
              : "请输入练习场景描述"}
            rows={5}
          />
        </Form.Item>

        <Button
          type="primary"
          icon={isGenerating ? <LoadingOutlined /> : <FileTextOutlined />}
          onClick={handleGenerate}
          loading={isGenerating}
        >
          {practiceMode === "fixed" ? "生成对话剧本" : "生成练习剧本"}
        </Button>
      </Card>
    </div>
  );

  const renderDialogTurns = () => (
    <div>
      {dialogTurns.length === 0 ? (
        <Empty description="暂无对话轮次" style={{ margin: "24px 0" }} />
      ) : (
        dialogTurns.map((turn, idx) => (
          <Card
            key={turn.id}
            size="small"
            style={{ marginBottom: 12 }}
            title={<Text strong>第 {idx + 1} 轮</Text>}
            extra={
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeTurn(turn.id)} size="small" />
            }
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Tag color="blue" icon={<RobotOutlined />}>AI</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>AI 提问/话术</Text>
              </div>
              <TextArea
                value={turn.aiContent}
                onChange={(e) => updateTurn(turn.id, "aiContent", e.target.value)}
                placeholder="AI 应该说什么..."
                autoSize={{ minRows: 2, maxRows: 5 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Tag color="green" icon={<UserOutlined />}>学员</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>学员标准回答</Text>
              </div>
              <TextArea
                value={turn.traineeAnswer}
                onChange={(e) => updateTurn(turn.id, "traineeAnswer", e.target.value)}
                placeholder="学员应该回答什么..."
                autoSize={{ minRows: 2, maxRows: 5 }}
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>评分要点</Text>
              <Input
                value={turn.keyPoints}
                onChange={(e) => updateTurn(turn.id, "keyPoints", e.target.value)}
                placeholder="关键评分要点（用；分隔）"
              />
            </div>
          </Card>
        ))
      )}
      <Button type="dashed" icon={<PlusOutlined />} onClick={addTurn} block>
        添加对话轮次
      </Button>
    </div>
  );

  const renderStep2 = () => {
    const isFixed = practiceMode === "fixed";

    const tabItems = [
      {
        key: "basic",
        label: "基本信息",
        children: (
          <Form form={form} layout="vertical" initialValues={formData}>
            <Form.Item label="练习名称" name="title" rules={[{ required: true }]}>
              <Input placeholder="请输入练习名称" />
            </Form.Item>
            <Form.Item label="所属部门" name="department">
              <Select placeholder="请选择部门">
                <Select.Option value="sales">销售部</Select.Option>
                <Select.Option value="service">客服部</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="练习描述" name="description">
              <TextArea rows={3} placeholder="请输入描述" />
            </Form.Item>
          </Form>
        ),
      },
      {
        key: "scene",
        label: "设置场景",
        children: (
          <Form form={form} layout="vertical">
            <Form.Item label="场景描述" name="scenarioDescription">
              <TextArea rows={4} placeholder="请输入场景描述" />
            </Form.Item>
            <Form.Item label="AI角色信息" name="aiRoleInfo">
              <TextArea rows={3} placeholder="AI角色设定" />
            </Form.Item>
            <Form.Item label="学员角色" name="traineeRole">
              <TextArea rows={3} placeholder="学员角色设定" />
            </Form.Item>
          </Form>
        ),
      },
      {
        key: "dialogue",
        label: isFixed ? "对话轮次" : "对话设置",
        children: isFixed ? (
          renderDialogTurns()
        ) : (
          <div>
            <Form form={form} layout="vertical">
              <Form.Item label="对话目标" name="dialogueGoal">
                <TextArea rows={3} placeholder="请输入对话目标" />
              </Form.Item>
            </Form>
            <Divider>评估标准</Divider>
            {formData.assessmentItems.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input
                  value={item.name}
                  onChange={(e) => updateAssessmentItem(item.id, "name", e.target.value)}
                  placeholder="评估项"
                  style={{ flex: 1 }}
                />
                <InputNumber
                  value={item.weight}
                  onChange={(value) => updateAssessmentItem(item.id, "weight", value || 0)}
                  min={0} max={100} addonAfter="%" style={{ width: 120 }}
                />
                <Button danger icon={<DeleteOutlined />} onClick={() => removeAssessmentItem(item.id)} />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addAssessmentItem} block>
              添加评估项
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Button onClick={() => setStep(1)} style={{ marginBottom: 16 }}>
          返回上一步
        </Button>
        {isFixed && (
          <Tag color="orange" style={{ marginBottom: 16, marginLeft: 8 }}>固定剧本模式</Tag>
        )}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    );
  };

  return (
    <Drawer
      title={step === 1 ? "新建练习计划" : "编辑练习详情"}
      placement="right"
      width={720}
      open={open}
      onClose={() => onOpenChange(false)}
      zIndex={1000}
      footer={
        step === 2 ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>保存</Button>
          </div>
        ) : null
      }
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Drawer>
  );
}
