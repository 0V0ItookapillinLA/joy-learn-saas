import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Select, Tabs, Card, Space, InputNumber, Typography, App, Tag, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, MessageOutlined, FileTextOutlined, CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAICharacters } from "@/hooks/useAICharacters";

const { TextArea } = Input;
const { Text } = Typography;

interface AssessmentItem {
  id: string;
  name: string;
  weight: number;
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
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      form.setFieldsValue(initialData);
      setStep(2);
    } else {
      setFormData({
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
      });
      form.resetFields();
      setStep(1);
      setPromptInput("");
      setActiveTab("basic");
    }
  }, [initialData, open, form]);

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      message.error("请输入练习场景描述");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-practice-script", {
        body: { prompt: promptInput.trim(), practiceMode },
      });

      if (error) throw error;
      if (!data || !data.success) throw new Error(data?.error || "生成失败");

      const script = data.script;
      const newFormData = {
        title: script.title || promptInput.slice(0, 20),
        department: "",
        description: script.description || `培训场景：${promptInput}`,
        scenarioDescription: script.scenarioDescription || "",
        aiRoleId: "1",
        aiRoleInfo: script.aiRoleInfo || "",
        traineeRole: script.traineeRole || "",
        dialogueGoal: script.dialogueGoal || "",
        passScore: 50,
        passAttempts: 3,
        assessmentItems: script.assessmentItems || defaultAssessmentItems,
      };
      setFormData(newFormData);
      form.setFieldsValue(newFormData);
      setStep(2);
      message.success("练习剧本已生成");
    } catch (error) {
      message.error("生成失败：" + (error instanceof Error ? error.message : "请重试"));
    } finally {
      setIsGenerating(false);
    }
  };

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
      onSave({ ...formData, ...values });
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
                <Text type="secondary">本期支持</Text>
              </div>
              {practiceMode === "free" && <CheckCircleOutlined style={{ color: "#1677ff", marginLeft: "auto" }} />}
            </div>
          </Card>
          <Card style={{ flex: 1, opacity: 0.6, cursor: "not-allowed" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <FileTextOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
              <div>
                <Text strong>固定剧本</Text>
                <br />
                <Text type="secondary">敬请期待</Text>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <Card title="创建副本">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Card size="small" style={{ background: "#e6f4ff", border: "1px solid #91caff" }}>
            <Text strong style={{ color: "#1677ff" }}>📝 练习场景描述</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>请详细描述练习场景</Text>
          </Card>
          <Card size="small" style={{ background: "#fff7e6", border: "1px solid #ffd591" }}>
            <Text strong style={{ color: "#fa8c16" }}>👤 人物角色设定</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>请明确参与角色</Text>
          </Card>
        </div>

        <Form.Item label="AI角色设置" required>
          <Select
            value={formData.aiRoleId}
            onChange={(value) => {
              const selected = aiCharacters.find((c) => c.id === value);
              setFormData({ ...formData, aiRoleId: value, aiRoleInfo: selected?.personality || "" });
            }}
            loading={isLoadingCharacters}
            placeholder="请选择AI角色"
          >
            {aiCharacters.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="创建剧本">
          <TextArea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="请输入练习场景描述"
            rows={5}
          />
        </Form.Item>

        <Button icon={isGenerating ? <LoadingOutlined /> : <FileTextOutlined />} onClick={handleGenerate} loading={isGenerating}>
          生成剧本
        </Button>
      </Card>
    </div>
  );

  const renderStep2 = () => {
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
        label: "对话设置",
        children: (
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
                  min={0}
                  max={100}
                  addonAfter="%"
                  style={{ width: 120 }}
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
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    );
  };

  return (
    <Drawer
      title={step === 1 ? "新建练习计划" : "创建练习详情"}
      placement="right"
      width={720}
      open={open}
      onClose={() => onOpenChange(false)}
      footer={
        step === 2 ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </div>
        ) : null
      }
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Drawer>
  );
}
