import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Select, Tabs, Card, Space, InputNumber, Typography, App, Tag, Divider, Empty, Steps } from "antd";
import { PlusOutlined, DeleteOutlined, FileTextOutlined, CheckCircleOutlined, LoadingOutlined, EditOutlined, UserOutlined, RobotOutlined, MessageOutlined, BookOutlined, DatabaseOutlined } from "@ant-design/icons";
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

interface OutlineModule {
  id: string;
  title: string;
  examPoints: string;
  responseStrategy: string;
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
  knowledgeBaseId: string;
}

interface PracticeEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PracticeFormData) => void;
  initialData?: Partial<PracticeFormData>;
}

const defaultAssessmentItems: AssessmentItem[] = [
  { id: "1", name: "非权力影响", weight: 40 },
  { id: "2", name: "沟通表达能力", weight: 30 },
  { id: "3", name: "勇于进取", weight: 20 },
  { id: "4", name: "跨界思考", weight: 10 },
];

// Mock knowledge bases for selection
const mockKnowledgeBases = [
  { id: "kb1", name: "销售话术知识库" },
  { id: "kb2", name: "产品知识手册" },
  { id: "kb3", name: "客服流程规范" },
  { id: "kb4", name: "保险条款知识库" },
];

export function PracticeEditSheet({ open, onOpenChange, onSave, initialData }: PracticeEditSheetProps) {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [practiceMode, setPracticeMode] = useState<"free" | "fixed_dialog" | "fixed_script">("free");
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [form] = Form.useForm();
  const [dialogTurns, setDialogTurns] = useState<DialogTurn[]>([]);
  const [outlineModules, setOutlineModules] = useState<OutlineModule[]>([]);
  const [dialogStarter, setDialogStarter] = useState<"trainee" | "companion">("companion");

  const { data: aiCharacters = [], isLoading: isLoadingCharacters } = useActiveAICharacters();

  const [formData, setFormData] = useState<PracticeFormData>({
    title: "", department: "", description: "", scenarioDescription: "",
    aiRoleId: "", aiRoleInfo: "", traineeRole: "", dialogueGoal: "",
    passScore: 50, passAttempts: 3, assessmentItems: defaultAssessmentItems,
    dialogTurns: [], knowledgeBaseId: "",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData((prev) => ({ ...prev, ...initialData }));
        form.setFieldsValue(initialData);
        setDialogTurns(initialData.dialogTurns || []);
        setCurrentStep(2);
        setPracticeMode(initialData.dialogTurns?.length ? "fixed_script" : "free");
      } else {
        setFormData({
          title: "", department: "", description: "", scenarioDescription: "",
          aiRoleId: "", aiRoleInfo: "", traineeRole: "", dialogueGoal: "",
          passScore: 50, passAttempts: 3, assessmentItems: defaultAssessmentItems,
          dialogTurns: [], knowledgeBaseId: "",
        });
        form.resetFields();
        setCurrentStep(0);
        setPromptInput("");
        setActiveTab("basic");
        setDialogTurns([]);
        setOutlineModules([]);
      }
    }
  }, [initialData, open, form]);

  const getStepItems = () => {
    if (practiceMode === "fixed_dialog") {
      return [
        { title: "填写基本信息" },
        { title: "生成对话大纲" },
        { title: "生成话术" },
      ];
    }
    return [
      { title: "填写基本信息" },
      { title: "编辑详情" },
    ];
  };

  const handleGenerateOutline = async () => {
    if (!promptInput.trim()) {
      message.error("请输入场景描述");
      return;
    }
    setIsGenerating(true);
    try {
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

      // Convert dialog turns into outline modules (group by theme)
      const turns = data.dialog_turns || [];
      const modules: OutlineModule[] = [];
      for (let i = 0; i < turns.length; i += 2) {
        modules.push({
          id: String(modules.length + 1),
          title: turns[i]?.content?.slice(0, 30) || `环节 ${modules.length + 1}`,
          examPoints: "",
          responseStrategy: "",
        });
      }
      if (modules.length === 0) {
        modules.push({ id: "1", title: "环节 1：开场与需求了解", examPoints: "", responseStrategy: "" });
        modules.push({ id: "2", title: "环节 2：方案推荐与说明", examPoints: "", responseStrategy: "" });
        modules.push({ id: "3", title: "环节 3：异议处理与确认", examPoints: "", responseStrategy: "" });
      }
      setOutlineModules(modules);
      setFormData(prev => ({
        ...prev,
        title: data.summary?.slice(0, 30) || promptInput.slice(0, 20),
        description: `固定对话练习：${promptInput}`,
        scenarioDescription: promptInput,
      }));
      setCurrentStep(1);
      message.success("对话大纲已生成，请填写考察点与应对思路");
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDialogFromOutline = async () => {
    setIsGenerating(true);
    try {
      const enrichedDescription = outlineModules.map(m =>
        `${m.title}：考察点=${m.examPoints || '无'}，应对思路=${m.responseStrategy || '无'}`
      ).join("\n");

      const { data, error } = await supabase.functions.invoke("generate-dialog-script", {
        body: {
          title: formData.title,
          sceneDescription: `${promptInput}\n\n对话大纲与评分标准：\n${enrichedDescription}`,
          knowledgeContent: "",
          assessmentDimensions: outlineModules.map(m => m.title),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "生成失败");

      const rawTurns = data.dialog_turns || [];
      const pairedTurns: DialogTurn[] = [];
      let i = 0;
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
      form.setFieldsValue({ ...formData, dialogTurns: pairedTurns });
      setCurrentStep(2);
      setActiveTab("dialogue");
      message.success("对话话术已生成，可编辑调整");
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFixedScript = async () => {
    if (!promptInput.trim()) {
      message.error("请输入场景描述");
      return;
    }
    setIsGenerating(true);
    try {
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

      const rawTurns = data.dialog_turns || [];
      const pairedTurns: DialogTurn[] = [];
      let i = 0;
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
      setFormData(prev => ({
        ...prev,
        title: data.summary?.slice(0, 30) || promptInput.slice(0, 20),
        description: `固定剧本练习：${promptInput}`,
        scenarioDescription: promptInput,
        dialogTurns: pairedTurns,
      }));
      form.setFieldsValue({
        title: data.summary?.slice(0, 30) || promptInput.slice(0, 20),
        description: `固定剧本练习：${promptInput}`,
      });
      setCurrentStep(practiceMode === "fixed_dialog" ? 2 : 1);
      setActiveTab("dialogue");
      message.success("对话剧本已生成");
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFree = async () => {
    if (!promptInput.trim()) {
      message.error("请输入场景描述");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-practice-script", {
        body: { prompt: promptInput.trim(), practiceMode: "free" },
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
      setCurrentStep(1);
      message.success("练习剧本已生成");
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (practiceMode === "fixed_dialog") return handleGenerateOutline();
    if (practiceMode === "fixed_script") return handleGenerateFixedScript();
    return handleGenerateFree();
  };

  // Dialog turn editing
  const updateTurn = (id: string, field: keyof DialogTurn, value: string) => {
    setDialogTurns(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const removeTurn = (id: string) => {
    setDialogTurns(prev => prev.filter(t => t.id !== id));
  };
  const addTurn = () => {
    setDialogTurns(prev => [...prev, { id: String(Date.now()), aiContent: "", traineeAnswer: "", keyPoints: "", editing: true }]);
  };

  // Assessment items
  const addAssessmentItem = () => {
    setFormData(prev => ({ ...prev, assessmentItems: [...prev.assessmentItems, { id: String(Date.now()), name: "", weight: 0 }] }));
  };
  const removeAssessmentItem = (id: string) => {
    setFormData(prev => ({ ...prev, assessmentItems: prev.assessmentItems.filter(i => i.id !== id) }));
  };
  const updateAssessmentItem = (id: string, field: "name" | "weight", value: string | number) => {
    setFormData(prev => ({ ...prev, assessmentItems: prev.assessmentItems.map(i => i.id === id ? { ...i, [field]: value } : i) }));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...formData, ...values, dialogTurns });
      onOpenChange(false);
    } catch {
      message.error("请填写完整信息");
    }
  };

  // ===== STEP 0: Basic Info =====
  const renderStep0 = () => (
    <div>
      <Card title="选择练习模式" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { key: "free" as const, icon: <MessageOutlined style={{ fontSize: 22, color: "#1677ff" }} />, label: "自由对话", desc: "AI根据场景自由发挥" },
            { key: "fixed_dialog" as const, icon: <BookOutlined style={{ fontSize: 22, color: "#52c41a" }} />, label: "固定对话", desc: "AI按预设对话流程进行" },
            { key: "fixed_script" as const, icon: <FileTextOutlined style={{ fontSize: 22, color: "#fa8c16" }} />, label: "固定剧本", desc: "AI按预设剧本逐字进行" },
          ].map(mode => (
            <Card
              key={mode.key}
              hoverable
              size="small"
              style={{ flex: 1, borderColor: practiceMode === mode.key ? "#1677ff" : undefined }}
              onClick={() => setPracticeMode(mode.key)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {mode.icon}
                <div style={{ flex: 1 }}>
                  <Text strong>{mode.label}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{mode.desc}</Text>
                </div>
                {practiceMode === mode.key && <CheckCircleOutlined style={{ color: "#1677ff" }} />}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card title="创建练习">
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Form.Item label="场景描述" style={{ marginBottom: 16 }}>
              <TextArea
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="例如：包含对话场景、2个人物、对话目标..."
                rows={5}
              />
            </Form.Item>

            <Form.Item label="对话素材" style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<DatabaseOutlined />}>从在线课堂选择</Button>
                <Button icon={<BookOutlined />}>从知识空间选择</Button>
                <Button>点击上传</Button>
              </Space>
            </Form.Item>

            <Form.Item label="知识库" style={{ marginBottom: 16 }}>
              <Select
                value={formData.knowledgeBaseId || undefined}
                onChange={v => setFormData(prev => ({ ...prev, knowledgeBaseId: v }))}
                placeholder="选择关联知识库（可选）"
                allowClear
              >
                {mockKnowledgeBases.map(kb => (
                  <Select.Option key={kb.id} value={kb.id}>{kb.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="AI角色设置" style={{ marginBottom: 16 }}>
              <Select
                value={formData.aiRoleId || undefined}
                onChange={value => {
                  const selected = aiCharacters.find(c => c.id === value);
                  setFormData(prev => ({ ...prev, aiRoleId: value, aiRoleInfo: selected?.personality || "" }));
                }}
                loading={isLoadingCharacters}
                placeholder="请选择AI角色"
                allowClear
              >
                {aiCharacters.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            {practiceMode === "fixed_dialog" && (
              <Form.Item label="对话开启者" style={{ marginBottom: 16 }}>
                <Space>
                  <Button
                    type={dialogStarter === "trainee" ? "primary" : "default"}
                    onClick={() => setDialogStarter("trainee")}
                    ghost={dialogStarter === "trainee"}
                  >学员</Button>
                  <Button
                    type={dialogStarter === "companion" ? "primary" : "default"}
                    onClick={() => setDialogStarter("companion")}
                    ghost={dialogStarter === "companion"}
                  >陪练者</Button>
                </Space>
              </Form.Item>
            )}

            <Button
              type="primary"
              icon={isGenerating ? <LoadingOutlined /> : <FileTextOutlined />}
              onClick={handleGenerate}
              loading={isGenerating}
              size="large"
            >
              AI 生成对话场景
            </Button>
          </div>

          <div style={{ width: 320, background: "#f5f5f5", borderRadius: 8, padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Text type="secondary">请在左侧填写信息，AI 将一键生成对话场景</Text>
          </div>
        </div>
      </Card>
    </div>
  );

  // ===== STEP 1 for fixed_dialog: Outline with exam points =====
  const renderOutlineStep = () => (
    <div>
      <Button onClick={() => setCurrentStep(0)} style={{ marginBottom: 16 }}>返回上一步</Button>
      <Tag color="green" style={{ marginBottom: 16, marginLeft: 8 }}>固定对话模式 · 对话大纲</Tag>

      {outlineModules.map((mod, idx) => (
        <Card key={mod.id} style={{ marginBottom: 16 }} title={<Text strong>环节 {idx + 1}：{mod.title}</Text>}
          extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => setOutlineModules(prev => prev.filter(m => m.id !== mod.id))} size="small" />}
        >
          <Form.Item label="考察点" style={{ marginBottom: 12 }}>
            <TextArea
              value={mod.examPoints}
              onChange={e => setOutlineModules(prev => prev.map(m => m.id === mod.id ? { ...m, examPoints: e.target.value } : m))}
              placeholder="填写考察点..."
              rows={3}
            />
          </Form.Item>
          <Form.Item label="应对思路" style={{ marginBottom: 0 }}>
            <TextArea
              value={mod.responseStrategy}
              onChange={e => setOutlineModules(prev => prev.map(m => m.id === mod.id ? { ...m, responseStrategy: e.target.value } : m))}
              placeholder="填写应对思路..."
              rows={3}
            />
          </Form.Item>
        </Card>
      ))}

      <Button type="dashed" icon={<PlusOutlined />} onClick={() => setOutlineModules(prev => [...prev, { id: String(Date.now()), title: `环节 ${prev.length + 1}`, examPoints: "", responseStrategy: "" }])} block style={{ marginBottom: 16 }}>
        添加环节
      </Button>

      <Button type="primary" icon={isGenerating ? <LoadingOutlined /> : <FileTextOutlined />} onClick={handleGenerateDialogFromOutline} loading={isGenerating} block size="large">
        生成话术
      </Button>
    </div>
  );

  const renderDialogTurns = () => (
    <div>
      {dialogTurns.length === 0 ? (
        <Empty description="暂无对话轮次" style={{ margin: "24px 0" }} />
      ) : (
        dialogTurns.map((turn, idx) => (
          <Card key={turn.id} size="small" style={{ marginBottom: 12 }}
            title={<Text strong>第 {idx + 1} 轮</Text>}
            extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeTurn(turn.id)} size="small" />}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Tag color="blue" icon={<RobotOutlined />}>AI</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>AI 提问/话术</Text>
              </div>
              <TextArea value={turn.aiContent} onChange={e => updateTurn(turn.id, "aiContent", e.target.value)} placeholder="AI 应该说什么..." autoSize={{ minRows: 2, maxRows: 5 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Tag color="green" icon={<UserOutlined />}>学员</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>学员标准回答</Text>
              </div>
              <TextArea value={turn.traineeAnswer} onChange={e => updateTurn(turn.id, "traineeAnswer", e.target.value)} placeholder="学员应该回答什么..." autoSize={{ minRows: 2, maxRows: 5 }} />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>评分要点</Text>
              <Input value={turn.keyPoints} onChange={e => updateTurn(turn.id, "keyPoints", e.target.value)} placeholder="关键评分要点（用；分隔）" />
            </div>
          </Card>
        ))
      )}
      <Button type="dashed" icon={<PlusOutlined />} onClick={addTurn} block>添加对话轮次</Button>
    </div>
  );

  // ===== Final edit step =====
  const renderEditStep = () => {
    const isFixed = practiceMode === "fixed_script" || practiceMode === "fixed_dialog";
    const tabItems = [
      {
        key: "basic", label: "基本信息",
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
        key: "scene", label: "设置场景",
        children: (
          <Form form={form} layout="vertical">
            <Form.Item label="场景描述" name="scenarioDescription"><TextArea rows={4} placeholder="请输入场景描述" /></Form.Item>
            <Form.Item label="AI角色信息" name="aiRoleInfo"><TextArea rows={3} placeholder="AI角色设定" /></Form.Item>
            <Form.Item label="学员角色" name="traineeRole"><TextArea rows={3} placeholder="学员角色设定" /></Form.Item>
          </Form>
        ),
      },
      {
        key: "dialogue", label: isFixed ? "对话轮次" : "对话设置",
        children: isFixed ? renderDialogTurns() : (
          <div>
            <Form form={form} layout="vertical">
              <Form.Item label="对话目标" name="dialogueGoal"><TextArea rows={3} placeholder="请输入对话目标" /></Form.Item>
            </Form>
            <Divider>评估标准</Divider>
            {formData.assessmentItems.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input value={item.name} onChange={e => updateAssessmentItem(item.id, "name", e.target.value)} placeholder="评估项" style={{ flex: 1 }} />
                <InputNumber value={item.weight} onChange={v => updateAssessmentItem(item.id, "weight", v || 0)} min={0} max={100} addonAfter="%" style={{ width: 120 }} />
                <Button danger icon={<DeleteOutlined />} onClick={() => removeAssessmentItem(item.id)} />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addAssessmentItem} block>添加评估项</Button>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Button onClick={() => setCurrentStep(practiceMode === "fixed_dialog" ? 1 : 0)} style={{ marginBottom: 16 }}>返回上一步</Button>
        {isFixed && <Tag color={practiceMode === "fixed_dialog" ? "green" : "orange"} style={{ marginBottom: 16, marginLeft: 8 }}>{practiceMode === "fixed_dialog" ? "固定对话" : "固定剧本"}模式</Tag>}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) return renderStep0();
    if (currentStep === 1 && practiceMode === "fixed_dialog") return renderOutlineStep();
    return renderEditStep();
  };

  const showFooter = (practiceMode === "fixed_dialog" && currentStep === 2) ||
    (practiceMode !== "fixed_dialog" && currentStep >= 1);

  return (
    <Drawer
      title="新建练习计划"
      placement="right"
      width="50vw"
      open={open}
      onClose={() => onOpenChange(false)}
      zIndex={1000}
      extra={
        <Steps current={currentStep} items={getStepItems()} size="small" style={{ width: practiceMode === "fixed_dialog" ? 360 : 240 }} />
      }
      footer={showFooter ? (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="primary" onClick={handleSave}>保存</Button>
        </div>
      ) : null}
    >
      {renderCurrentStep()}
    </Drawer>
  );
}
