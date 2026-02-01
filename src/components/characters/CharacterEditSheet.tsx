import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Tabs, Card, Avatar, Space, App, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import type { Database } from "@/integrations/supabase/types";

const { TextArea } = Input;

type AICharacterRow = Database["public"]["Tables"]["ai_characters"]["Row"];

interface CharacterEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: AICharacterRow | null;
  voiceStyles: string[];
  onSave: (data: {
    name: string;
    personality: string;
    voiceStyle: string;
    systemPrompt: string;
    avatarUrl: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

const mockAvatars = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

const mockAgents = [
  { id: "1", name: "MAX", description: "我是Max" },
  { id: "2", name: "小助手", description: "智能客服助手" },
];

export function CharacterEditSheet({
  open,
  onOpenChange,
  character,
  voiceStyles,
  onSave,
  isSaving = false,
}: CharacterEditSheetProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState("");

  useEffect(() => {
    if (character) {
      form.setFieldsValue({
        name: character.name,
        personality: character.personality || "",
        systemPrompt: character.system_prompt || "",
      });
      setSelectedVoiceStyle(character.voice_style || "");
    } else {
      form.resetFields();
      setSelectedVoiceStyle("");
      setSelectedAvatar(0);
    }
  }, [character, open, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        name: values.name,
        personality: values.personality,
        voiceStyle: selectedVoiceStyle,
        systemPrompt: values.systemPrompt,
        avatarUrl: mockAvatars[selectedAvatar],
      });
      onOpenChange(false);
    } catch (error) {
      message.error("请填写完整信息");
    }
  };

  const isEditing = !!character;

  const tabItems = [
    {
      key: "config",
      label: "配置",
      children: (
        <div>
          <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical">
              <Form.Item label="角色名称" name="name" rules={[{ required: true, message: "请输入角色名称" }]}>
                <Input placeholder="请输入角色名称" />
              </Form.Item>
              <Form.Item label="性格特点" name="personality">
                <Input placeholder="如：专业、严谨、有耐心" />
              </Form.Item>
              <Form.Item label="系统提示词" name="systemPrompt">
                <TextArea placeholder="请输入角色的系统提示词..." rows={4} />
              </Form.Item>
            </Form>
          </Card>

          <Card size="small" title="员工技能" style={{ marginBottom: 16 }}>
            {mockAgents.map((agent) => (
              <div key={agent.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{agent.name}</div>
                  <div style={{ color: "#999", fontSize: 12 }}>{agent.description}</div>
                </div>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} block style={{ marginTop: 8 }}>
              请添加智能体
            </Button>
          </Card>

          <Card size="small" title="数字形象" style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {mockAvatars.map((avatar, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: selectedAvatar === index ? "2px solid #1677ff" : "2px solid transparent",
                  }}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {selectedAvatar === index && (
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#1677ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckOutlined style={{ color: "#fff", fontSize: 12 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button type="dashed" icon={<PlusOutlined />} block style={{ marginTop: 8 }}>
              点击添加数字形象
            </Button>
          </Card>

          <Card size="small" title="语言风格">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {voiceStyles.map((style) => (
                <Tag
                  key={style}
                  color={selectedVoiceStyle === style ? "blue" : undefined}
                  style={{ cursor: "pointer", padding: "4px 12px" }}
                  onClick={() => setSelectedVoiceStyle(style)}
                >
                  {style}
                </Tag>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: "preview",
      label: "预览与调试",
      children: (
        <Card>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Avatar size={96} style={{ backgroundColor: "#1677ff", marginBottom: 16 }}>
              {form.getFieldValue("name")?.slice(0, 2) || "AI"}
            </Avatar>
            <h3>{form.getFieldValue("name") || "AI角色"}</h3>
            <p style={{ color: "#999" }}>{form.getFieldValue("personality") || "请设置角色性格特点"}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input placeholder="请输入内容" style={{ flex: 1 }} />
            <Button>发送</Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar style={{ backgroundColor: "#1677ff" }}>{form.getFieldValue("name")?.slice(0, 2) || "AI"}</Avatar>
          <div>
            <div>{isEditing ? form.getFieldValue("name") : "新建AI角色"}</div>
            {isEditing && character?.updated_at && (
              <div style={{ fontSize: 12, color: "#999" }}>数据保存于 {new Date(character.updated_at).toLocaleString()}</div>
            )}
          </div>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={() => onOpenChange(false)}
      zIndex={1000}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="primary" onClick={handleSave} loading={isSaving}>
            保存
          </Button>
        </div>
      }
    >
      <Tabs items={tabItems} />
    </Drawer>
  );
}
