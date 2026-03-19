import { useState, useEffect } from "react";
import { Drawer, Button, Steps, Form, Input, Select, Typography, Space, Spin, Alert, Card, Tag, Checkbox, InputNumber, Divider, Empty } from "antd";
import { App } from "antd";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveAICharacters } from "@/hooks/useAICharacters";
import { useCreateDialogScript, useUpdateDialogScript, type DialogScript, type DialogTurn } from "@/hooks/useDialogScripts";
import { RobotOutlined, UserOutlined, CheckCircleOutlined, LoadingOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  editingScript: DialogScript | null;
}

export function DialogScriptCreator({ open, onClose, editingScript }: Props) {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [generatedTurns, setGeneratedTurns] = useState<DialogTurn[]>([]);
  const [selectedTurnIds, setSelectedTurnIds] = useState<Set<string>>(new Set());

  const createMutation = useCreateDialogScript();
  const updateMutation = useUpdateDialogScript();
  const { data: characters = [] } = useActiveAICharacters();

  // Fetch knowledge bases for selection
  const { data: knowledgeBases = [] } = useQuery({
    queryKey: ["knowledge-bases-for-dialog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_bases")
        .select("id, name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch docs for selected KB
  const selectedKbId = Form.useWatch("knowledge_base_id", form);
  const { data: kbDocs = [] } = useQuery({
    queryKey: ["kb-docs-for-dialog", selectedKbId],
    queryFn: async () => {
      if (!selectedKbId) return [];
      const { data, error } = await supabase
        .from("knowledge_documents")
        .select("id, title, ai_summary, ai_key_points, status")
        .eq("knowledge_base_id", selectedKbId)
        .eq("status", "ready")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedKbId,
  });

  useEffect(() => {
    if (open) {
      if (editingScript) {
        form.setFieldsValue({
          title: editingScript.title,
          description: editingScript.description,
          knowledge_base_id: editingScript.knowledge_base_id,
          knowledge_doc_ids: editingScript.knowledge_doc_ids || [],
          mode: editingScript.mode,
          character_id: editingScript.character_id,
          max_attempts: editingScript.practice_config?.max_attempts || 3,
        });
        setGeneratedTurns(editingScript.dialog_turns || []);
        setSelectedTurnIds(new Set((editingScript.dialog_turns || []).map((t: DialogTurn) => t.id)));
        setStep(2);
      } else {
        form.resetFields();
        form.setFieldsValue({ mode: "practice", max_attempts: 3 });
        setGeneratedTurns([]);
        setSelectedTurnIds(new Set());
        setStep(0);
      }
    }
  }, [open, editingScript, form]);

  const handleGenerate = async () => {
    try {
      await form.validateFields(["title", "description"]);
    } catch {
      message.warning("请填写剧本标题和场景描述");
      return;
    }

    setGenerating(true);
    try {
      const values = form.getFieldsValue();
      const docIds: string[] = values.knowledge_doc_ids || [];

      // Gather knowledge content from selected docs
      let knowledgeContent = "";
      if (docIds.length > 0) {
        const { data: docs } = await supabase
          .from("knowledge_documents")
          .select("title, ai_summary, ai_key_points")
          .in("id", docIds);
        if (docs) {
          knowledgeContent = docs
            .map((d: any) => {
              const kps = Array.isArray(d.ai_key_points)
                ? d.ai_key_points.map((kp: any) => (typeof kp === "string" ? kp : kp.content || kp.title || JSON.stringify(kp))).join("\n- ")
                : "";
              return `【${d.title}】\n摘要: ${d.ai_summary || "无"}\n知识点:\n- ${kps}`;
            })
            .join("\n\n");
        }
      }

      const { data, error } = await supabase.functions.invoke("generate-dialog-script", {
        body: {
          title: values.title,
          sceneDescription: values.description,
          knowledgeContent,
          assessmentDimensions: null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const turns: DialogTurn[] = data.dialog_turns || [];
      setGeneratedTurns(turns);
      setSelectedTurnIds(new Set(turns.map((t) => t.id)));
      setStep(2);
      message.success(`成功生成 ${turns.length} 轮对话`);
    } catch (err: any) {
      message.error(err?.message || "生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await form.validateFields(["title"]);
    } catch {
      message.warning("请填写剧本标题");
      return;
    }

    const values = form.getFieldsValue();
    const selectedTurns = generatedTurns.filter((t) => selectedTurnIds.has(t.id));

    // Get org id
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user!.id)
      .single();

    let orgId = profile?.organization_id;
    if (!orgId) {
      const { data: newOrgId } = await supabase.rpc("initialize_user_with_organization", {
        _user_id: user!.id,
        _full_name: user!.user_metadata?.full_name || null,
        _org_name: "我的组织",
      });
      orgId = newOrgId;
    }

    const payload = {
      organization_id: orgId!,
      title: values.title,
      description: values.description || null,
      knowledge_base_id: values.knowledge_base_id || null,
      knowledge_doc_ids: values.knowledge_doc_ids || [],
      character_id: values.character_id || null,
      mode: values.mode || "practice",
      dialog_turns: selectedTurns,
      practice_config: { max_attempts: values.max_attempts || 3 },
      exam_config: { passing_score: 60 },
      status: "draft" as const,
      created_by: user!.id,
    };

    if (editingScript) {
      await updateMutation.mutateAsync({ id: editingScript.id, ...payload } as any);
    } else {
      await createMutation.mutateAsync(payload as any);
    }
    onClose();
  };

  const toggleTurn = (id: string) => {
    setSelectedTurnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      title={editingScript ? "编辑对话剧本" : "新建对话剧本"}
      placement="right"
      width="50vw"
      open={open}
      onClose={onClose}
      destroyOnClose
      styles={{ body: { paddingBottom: 80 } }}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          {step === 2 && (
            <Button type="primary" onClick={handleSave} loading={isSaving}>
              {editingScript ? "保存修改" : "保存剧本"}
            </Button>
          )}
        </Space>
      }
    >
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: "基本信息" },
          { title: "AI 生成" },
          { title: "编辑话术" },
        ]}
      />

      <Form form={form} layout="vertical">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div>
            <Form.Item label="剧本标题" name="title" rules={[{ required: true, message: "请输入标题" }]}>
              <Input placeholder="例如：客户投诉处理话术练习" />
            </Form.Item>
            <Form.Item label="场景描述" name="description" rules={[{ required: true, message: "请输入场景描述" }]}>
              <TextArea rows={3} placeholder="描述对话场景，例如：模拟客户来电投诉产品质量问题，客服需要安抚客户情绪并提出解决方案..." />
            </Form.Item>
            <Form.Item label="关联知识库" name="knowledge_base_id">
              <Select placeholder="选择知识库（可选）" allowClear options={knowledgeBases.map((kb) => ({ label: kb.name, value: kb.id }))} />
            </Form.Item>
            {selectedKbId && (
              <Form.Item label="选择知识文档" name="knowledge_doc_ids">
                <Select
                  mode="multiple"
                  placeholder="选择文档"
                  options={kbDocs.map((doc: any) => ({ label: doc.title, value: doc.id }))}
                />
              </Form.Item>
            )}
            <Form.Item label="模式" name="mode">
              <Select
                options={[
                  { label: "练习模式", value: "practice" },
                  { label: "考试模式", value: "exam" },
                  { label: "先练后考", value: "practice_then_exam" },
                ]}
              />
            </Form.Item>
            <Form.Item label="虚拟对话者" name="character_id">
              <Select
                placeholder="选择 AI 角色（可选）"
                allowClear
                options={characters.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
            <Form.Item label="每轮最大回答次数" name="max_attempts">
              <InputNumber min={1} max={5} style={{ width: "100%" }} />
            </Form.Item>
            <Button type="primary" block onClick={() => setStep(1)} style={{ marginTop: 8 }}>
              下一步：AI 生成对话
            </Button>
          </div>
        )}

        {/* Step 1: Generate */}
        {step === 1 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            {generating ? (
              <div>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
                <Title level={4} style={{ marginTop: 24 }}>AI 正在生成对话剧本...</Title>
                <Text type="secondary">基于知识库内容和场景描述，生成结构化对话轮次</Text>
              </div>
            ) : (
              <div>
                <ThunderboltOutlined style={{ fontSize: 48, color: "#1677ff" }} />
                <Title level={4} style={{ marginTop: 24 }}>准备生成</Title>
                <Text type="secondary">
                  AI 将根据您提供的场景描述和知识库内容，自动生成对话练习剧本
                </Text>
                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button onClick={() => setStep(0)}>返回修改</Button>
                    <Button type="primary" onClick={handleGenerate} icon={<ThunderboltOutlined />}>
                      开始生成
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Edit Turns */}
        {step === 2 && (
          <div>
            <Alert
              message={`共 ${generatedTurns.length} 轮对话，已选 ${selectedTurnIds.size} 轮`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Space>
                  <Button size="small" onClick={() => setStep(0)}>返回修改</Button>
                  <Button size="small" onClick={() => { setStep(1); }}>重新生成</Button>
                </Space>
              }
            />

            {generatedTurns.length === 0 ? (
              <Empty description="暂无对话轮次" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {generatedTurns.map((turn, idx) => (
                  <Card
                    key={turn.id}
                    size="small"
                    style={{
                      borderLeft: `4px solid ${turn.speaker === "companion" ? "#1677ff" : "#52c41a"}`,
                      opacity: selectedTurnIds.has(turn.id) ? 1 : 0.5,
                    }}
                    title={
                      <Space>
                        <Checkbox
                          checked={selectedTurnIds.has(turn.id)}
                          onChange={() => toggleTurn(turn.id)}
                        />
                        <Tag
                          color={turn.speaker === "companion" ? "blue" : "green"}
                          icon={turn.speaker === "companion" ? <RobotOutlined /> : <UserOutlined />}
                        >
                          {turn.speaker === "companion" ? "陪练者" : "学员"}
                        </Tag>
                        <Text type="secondary">第 {idx + 1} 轮</Text>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>对话内容：</Text>
                      <div style={{ background: "#fafafa", padding: 8, borderRadius: 4, marginTop: 4 }}>
                        {turn.content}
                      </div>
                    </div>

                    {turn.standard_answer && (
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>标准回答：</Text>
                        <div style={{ background: "#f6ffed", padding: 8, borderRadius: 4, marginTop: 4 }}>
                          {turn.standard_answer}
                        </div>
                      </div>
                    )}

                    {turn.key_points.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>关键要点：</Text>
                        <div style={{ marginTop: 4 }}>
                          {turn.key_points.map((kp) => (
                            <Tag key={kp.id} icon={<CheckCircleOutlined />} color={kp.required ? "warning" : "default"} style={{ marginBottom: 4 }}>
                              {kp.content}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}

                    {turn.analysis && (
                      <div>
                        <Text strong>解析：</Text>
                        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                          {turn.analysis}
                        </Text>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Form>
    </Drawer>
  );
}
