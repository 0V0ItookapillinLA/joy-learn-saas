import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Select, Tabs, Card, Space, InputNumber, Typography, App, Tag, Divider, Empty, Steps } from "antd";
import { PlusOutlined, DeleteOutlined, FileTextOutlined, CheckCircleOutlined, LoadingOutlined, EditOutlined, UserOutlined, RobotOutlined, MessageOutlined, BookOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAICharacters } from "@/hooks/useAICharacters";
import { KnowledgeTreeSelect } from "@/components/knowledge-base/KnowledgeTreeSelect";

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

interface SceneAct {
  id: string;
  title: string;
  scene: string;
  goal: string;
  tasks: string;
  scoringDimensions: { id: string; name: string; detail: string; weight: number }[];
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
  knowledgeIds: string[];
  practiceMode?: string;
  sceneActs?: SceneAct[];
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

export function PracticeEditSheet({ open, onOpenChange, onSave, initialData }: PracticeEditSheetProps) {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [practiceMode, setPracticeMode] = useState<"free" | "fixed_dialog" | "fixed_script">("free");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [form] = Form.useForm();
  const [dialogTurns, setDialogTurns] = useState<DialogTurn[]>([]);
  const [sceneActs, setSceneActs] = useState<SceneAct[]>([]);
  const [dialogStarter, setDialogStarter] = useState<"trainee" | "companion">("companion");

  const { data: aiCharacters = [], isLoading: isLoadingCharacters } = useActiveAICharacters();

  const [formData, setFormData] = useState<PracticeFormData>({
    title: "", department: "", description: "", scenarioDescription: "",
    aiRoleId: "", aiRoleInfo: "", traineeRole: "", dialogueGoal: "",
    passScore: 50, passAttempts: 3, assessmentItems: defaultAssessmentItems,
    dialogTurns: [], knowledgeIds: [],
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData((prev) => ({ ...prev, ...initialData }));
        form.setFieldsValue(initialData);
        setDialogTurns(initialData.dialogTurns || []);
        setCurrentStep(2);
        setPracticeMode(initialData.practiceMode as any || (initialData.dialogTurns?.length ? "fixed_script" : "free"));
      } else {
        setFormData({
          title: "", department: "", description: "", scenarioDescription: "",
          aiRoleId: "", aiRoleInfo: "", traineeRole: "", dialogueGoal: "",
          passScore: 50, passAttempts: 3, assessmentItems: defaultAssessmentItems,
          dialogTurns: [], knowledgeIds: [],
        });
        form.resetFields();
        setCurrentStep(0);
        setActiveTab("basic");
        setDialogTurns([]);
        setSceneActs([]);
      }
    }
  }, [initialData, open, form]);

  const getStepItems = () => {
    if (practiceMode === "fixed_dialog") {
      return [{ title: "基本信息" }, { title: "对话大纲" }, { title: "编辑话术" }];
    }
    if (practiceMode === "fixed_script") {
      return [{ title: "基本信息" }, { title: "剧幕编辑" }];
    }
    return [{ title: "基本信息" }, { title: "编辑详情" }];
  };

  // ===== GENERATION HANDLERS =====
  const handleGenerateOutline = async () => {
    if (!formData.scenarioDescription?.trim()) {
      message.error("请输入场景描述");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-dialog-script", {
        body: {
          title: formData.title || formData.scenarioDescription.slice(0, 30),
          sceneDescription: formData.scenarioDescription,
          knowledgeContent: "",
          assessmentDimensions: formData.assessmentItems.map(i => i.name).filter(Boolean),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "生成失败");

      const turns = data.dialog_turns || [];
      const modules = [];
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
      // Store as outline modules for fixed_dialog step 1
      setSceneActs(modules.map(m => ({
        id: m.id,
        title: m.title,
        scene: "",
        goal: "",
        tasks: "",
        scoringDimensions: [{ id: "1", name: "沟通表达", detail: "", weight: 50 }, { id: "2", name: "专业知识", detail: "", weight: 50 }],
      })));
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
      const enrichedDescription = sceneActs.map(m =>
        `${m.title}：场景=${m.scene || '无'}，目标=${m.goal || '无'}`
      ).join("\n");

      const { data, error } = await supabase.functions.invoke("generate-dialog-script", {
        body: {
          title: formData.title,
          sceneDescription: `${formData.scenarioDescription}\n\n对话大纲：\n${enrichedDescription}`,
          knowledgeContent: "",
          assessmentDimensions: sceneActs.map(m => m.title),
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

  const handleGenerateSceneActs = async () => {
    if (!formData.scenarioDescription?.trim()) {
      message.error("请输入场景描述");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-dialog-script", {
        body: {
          title: formData.title || formData.scenarioDescription.slice(0, 30),
          sceneDescription: `请生成一个多幕式销售场景剧本。场景描述：${formData.scenarioDescription}。
请为每一幕提供：场景名称、场景描述、目标、需完成事项、评分维度。
AI角色：${formData.aiRoleInfo || '客户'}
学员角色：${formData.traineeRole || '销售人员'}`,
          knowledgeContent: "",
          assessmentDimensions: formData.assessmentItems.map(i => i.name).filter(Boolean),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "生成失败");

      // Generate scene acts from response
      const turns = data.dialog_turns || [];
      const acts: SceneAct[] = [];
      const sceneNames = ["电话沟通", "客户拜访", "方案呈现", "促单成交"];
      const sceneGoals = ["建立初步联系，了解客户需求", "深入了解客户痛点，建立信任", "展示解决方案，处理异议", "推动成交，签订合同"];

      for (let i = 0; i < Math.max(3, Math.ceil(turns.length / 3)); i++) {
        acts.push({
          id: String(i + 1),
          title: `第${i + 1}幕：${sceneNames[i] || `场景 ${i + 1}`}`,
          scene: sceneNames[i] || `场景 ${i + 1}`,
          goal: sceneGoals[i] || "",
          tasks: "",
          scoringDimensions: [
            { id: `${i}-1`, name: "沟通表达", detail: "", weight: 30 },
            { id: `${i}-2`, name: "专业知识", detail: "", weight: 30 },
            { id: `${i}-3`, name: "应变能力", detail: "", weight: 20 },
            { id: `${i}-4`, name: "客户关系", detail: "", weight: 20 },
          ],
        });
      }
      if (acts.length === 0) {
        acts.push(
          { id: "1", title: "第1幕：电话沟通", scene: "电话沟通", goal: "建立初步联系", tasks: "", scoringDimensions: [{ id: "1-1", name: "沟通表达", detail: "", weight: 50 }, { id: "1-2", name: "需求挖掘", detail: "", weight: 50 }] },
          { id: "2", title: "第2幕：客户拜访", scene: "客户拜访", goal: "深入了解需求", tasks: "", scoringDimensions: [{ id: "2-1", name: "专业知识", detail: "", weight: 50 }, { id: "2-2", name: "信任建立", detail: "", weight: 50 }] },
          { id: "3", title: "第3幕：促单成交", scene: "促单成交", goal: "推动签约", tasks: "", scoringDimensions: [{ id: "3-1", name: "谈判技巧", detail: "", weight: 50 }, { id: "3-2", name: "异议处理", detail: "", weight: 50 }] },
        );
      }
      setSceneActs(acts);
      setFormData(prev => ({
        ...prev,
        title: prev.title || formData.scenarioDescription.slice(0, 20),
        description: `固定剧本练习：${formData.scenarioDescription}`,
      }));
      setCurrentStep(1);
      message.success("剧幕场景已生成，可编辑调整");
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFree = async () => {
    if (!formData.scenarioDescription?.trim()) {
      message.error("请输入场景描述");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-practice-script", {
        body: { prompt: formData.scenarioDescription, practiceMode: "free" },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "生成失败");

      const script = data.script;
      const newFormData = {
        ...formData,
        title: script.title || formData.scenarioDescription.slice(0, 20),
        description: script.description || `培训场景：${formData.scenarioDescription}`,
        scenarioDescription: script.scenarioDescription || formData.scenarioDescription,
        aiRoleInfo: script.aiRoleInfo || formData.aiRoleInfo,
        traineeRole: script.traineeRole || formData.traineeRole,
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
    if (practiceMode === "fixed_script") return handleGenerateSceneActs();
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
      onSave({ ...formData, ...values, dialogTurns, practiceMode, sceneActs });
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
            { key: "fixed_script" as const, icon: <FileTextOutlined style={{ fontSize: 22, color: "#fa8c16" }} />, label: "固定剧本", desc: "多幕式场景剧本演练" },
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
        <Form layout="vertical">
          <Form.Item label="场景描述" style={{ marginBottom: 16 }}>
            <TextArea
              value={formData.scenarioDescription}
              onChange={e => setFormData(prev => ({ ...prev, scenarioDescription: e.target.value }))}
              placeholder="例如：包含对话场景、2个人物、对话目标..."
              rows={4}
            />
          </Form.Item>

          <Form.Item label="知识库" style={{ marginBottom: 16 }}>
            <KnowledgeTreeSelect
              value={formData.knowledgeIds}
              onChange={v => setFormData(prev => ({ ...prev, knowledgeIds: v }))}
              placeholder="选择关联知识库或文档（可多选）"
            />
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
                <Button type={dialogStarter === "trainee" ? "primary" : "default"} onClick={() => setDialogStarter("trainee")} ghost={dialogStarter === "trainee"}>学员</Button>
                <Button type={dialogStarter === "companion" ? "primary" : "default"} onClick={() => setDialogStarter("companion")} ghost={dialogStarter === "companion"}>陪练者</Button>
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
            {practiceMode === "fixed_script" ? "AI 生成剧幕场景" : "AI 生成对话场景"}
          </Button>
        </Form>
      </Card>
    </div>
  );

  // ===== STEP 1 for fixed_dialog: Outline with scoring =====
  const renderOutlineStep = () => (
    <div>
      <Button onClick={() => setCurrentStep(0)} style={{ marginBottom: 16 }}>返回上一步</Button>
      <Tag color="green" style={{ marginBottom: 16, marginLeft: 8 }}>固定对话模式 · 对话大纲</Tag>

      {sceneActs.map((act, idx) => (
        <Card key={act.id} style={{ marginBottom: 16 }} title={<Text strong>环节 {idx + 1}：{act.title}</Text>}
          extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSceneActs(prev => prev.filter(a => a.id !== act.id))} size="small" />}
        >
          <Form.Item label="考察目标" style={{ marginBottom: 12 }}>
            <TextArea
              value={act.goal}
              onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, goal: e.target.value } : a))}
              placeholder="填写考察目标..."
              rows={2}
            />
          </Form.Item>
          <Divider orientation="left" plain>评分维度</Divider>
          {act.scoringDimensions.map((dim) => (
            <div key={dim.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <Input value={dim.name} onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.map(d => d.id === dim.id ? { ...d, name: e.target.value } : d) } : a))} placeholder="维度名称" style={{ width: 120 }} />
              <Input value={dim.detail} onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.map(d => d.id === dim.id ? { ...d, detail: e.target.value } : d) } : a))} placeholder="评分细则" style={{ flex: 1 }} />
              <InputNumber value={dim.weight} onChange={v => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.map(d => d.id === dim.id ? { ...d, weight: v || 0 } : d) } : a))} min={0} max={100} addonAfter="%" style={{ width: 110 }} />
              <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.filter(d => d.id !== dim.id) } : a))} />
            </div>
          ))}
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: [...a.scoringDimensions, { id: String(Date.now()), name: "", detail: "", weight: 0 }] } : a))}>添加评分维度</Button>
        </Card>
      ))}

      <Button type="dashed" icon={<PlusOutlined />} onClick={() => setSceneActs(prev => [...prev, { id: String(Date.now()), title: `环节 ${prev.length + 1}`, scene: "", goal: "", tasks: "", scoringDimensions: [{ id: "1", name: "", detail: "", weight: 50 }] }])} block style={{ marginBottom: 16 }}>
        添加环节
      </Button>

      <Button type="primary" icon={isGenerating ? <LoadingOutlined /> : <FileTextOutlined />} onClick={handleGenerateDialogFromOutline} loading={isGenerating} block size="large">
        生成话术
      </Button>
    </div>
  );

  // ===== STEP 1 for fixed_script: Scene Acts Editor =====
  const renderSceneActsStep = () => (
    <div>
      <Button onClick={() => setCurrentStep(0)} style={{ marginBottom: 16 }}>返回上一步</Button>
      <Tag color="orange" style={{ marginBottom: 16, marginLeft: 8 }}>固定剧本模式 · 剧幕编辑</Tag>

      {/* Unified config at top */}
      <Card title="统一配置" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="练习名称" style={{ marginBottom: 12 }}>
            <Input value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="请输入练习名称" />
          </Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item label="AI角色（全幕统一）" style={{ flex: 1, marginBottom: 12 }}>
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
                {aiCharacters.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="学员角色（全幕统一）" style={{ flex: 1, marginBottom: 12 }}>
              <Input value={formData.traineeRole} onChange={e => setFormData(prev => ({ ...prev, traineeRole: e.target.value }))} placeholder="如：销售人员" />
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Divider orientation="left">剧幕场景</Divider>

      {sceneActs.map((act, idx) => (
        <Card key={act.id} style={{ marginBottom: 16 }} title={
          <Input
            value={act.title}
            onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, title: e.target.value } : a))}
            bordered={false}
            style={{ fontWeight: 600, fontSize: 14, padding: 0 }}
          />
        }
          extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSceneActs(prev => prev.filter(a => a.id !== act.id))} size="small" />}
        >
          <Form layout="vertical">
            <Form.Item label="场景描述" style={{ marginBottom: 12 }}>
              <TextArea
                value={act.scene}
                onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scene: e.target.value } : a))}
                placeholder="如：电话沟通、客户拜访、促单成交..."
                rows={2}
              />
            </Form.Item>
            <Form.Item label="本幕目标" style={{ marginBottom: 12 }}>
              <TextArea
                value={act.goal}
                onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, goal: e.target.value } : a))}
                placeholder="本幕需要达成的目标..."
                rows={2}
              />
            </Form.Item>
            <Form.Item label="需完成事项" style={{ marginBottom: 12 }}>
              <TextArea
                value={act.tasks}
                onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, tasks: e.target.value } : a))}
                placeholder="学员在本幕需要完成的事情..."
                rows={2}
              />
            </Form.Item>
            <Divider orientation="left" plain>评分维度</Divider>
            {act.scoringDimensions.map((dim) => (
              <div key={dim.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <Input value={dim.name} onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.map(d => d.id === dim.id ? { ...d, name: e.target.value } : d) } : a))} placeholder="维度名称" style={{ width: 120 }} />
                <Input value={dim.detail} onChange={e => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.map(d => d.id === dim.id ? { ...d, detail: e.target.value } : d) } : a))} placeholder="评分细则详情" style={{ flex: 1 }} />
                <InputNumber value={dim.weight} onChange={v => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.map(d => d.id === dim.id ? { ...d, weight: v || 0 } : d) } : a))} min={0} max={100} addonAfter="%" style={{ width: 110 }} />
                <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: a.scoringDimensions.filter(d => d.id !== dim.id) } : a))} />
              </div>
            ))}
            <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => setSceneActs(prev => prev.map(a => a.id === act.id ? { ...a, scoringDimensions: [...a.scoringDimensions, { id: String(Date.now()), name: "", detail: "", weight: 0 }] } : a))}>
              添加评分维度
            </Button>
          </Form>
        </Card>
      ))}

      <Button type="dashed" icon={<PlusOutlined />} onClick={() => setSceneActs(prev => [...prev, {
        id: String(Date.now()),
        title: `第${prev.length + 1}幕：新场景`,
        scene: "",
        goal: "",
        tasks: "",
        scoringDimensions: [{ id: String(Date.now()), name: "", detail: "", weight: 50 }],
      }])} block>
        添加剧幕
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
    const isFixed = practiceMode === "fixed_dialog";
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
        {isFixed && <Tag color="green" style={{ marginBottom: 16, marginLeft: 8 }}>固定对话模式</Tag>}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) return renderStep0();
    if (currentStep === 1 && practiceMode === "fixed_dialog") return renderOutlineStep();
    if (currentStep === 1 && practiceMode === "fixed_script") return renderSceneActsStep();
    return renderEditStep();
  };

  const showFooter = (practiceMode === "fixed_dialog" && currentStep === 2) ||
    (practiceMode === "fixed_script" && currentStep === 1) ||
    (practiceMode === "free" && currentStep >= 1);

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
