import { useState, useEffect } from "react";
import { Drawer, Button, Input, Form, Tabs, Card, Avatar, Space, App, Tag, Switch, Divider, Modal, List, Checkbox } from "antd";
import { PlusOutlined, DeleteOutlined, CheckOutlined, SearchOutlined } from "@ant-design/icons";
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

const characterAvatars = {
  dynamic: [
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Max&backgroundColor=b6e3f4", name: "Max" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Luna&backgroundColor=ffd5dc", name: "Luna" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Alex&backgroundColor=c0aede", name: "Alex" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Sophie&backgroundColor=d1f4d1", name: "Sophie" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=James&backgroundColor=ffeaa7", name: "James" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Emma&backgroundColor=fab1a0", name: "Emma" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Oliver&backgroundColor=74b9ff", name: "Oliver" },
    { url: "https://api.dicebear.com/7.x/personas/svg?seed=Mia&backgroundColor=a29bfe", name: "Mia" },
  ],
  static: [
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher1&backgroundColor=b6e3f4", name: "教师形象1" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher2&backgroundColor=ffd5dc", name: "教师形象2" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Student1&backgroundColor=c0aede", name: "学生形象1" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Student2&backgroundColor=d1f4d1", name: "学生形象2" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1&backgroundColor=ffeaa7", name: "经理形象1" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager2&backgroundColor=fab1a0", name: "经理形象2" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CSR1&backgroundColor=74b9ff", name: "客服形象1" },
    { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CSR2&backgroundColor=a29bfe", name: "客服形象2" },
  ],
};

// Skills library
const skillsLibrary = [
  { id: "s1", name: "智能搜索", category: "通用技能", description: "高效检索信息与知识的能力" },
  { id: "s2", name: "智能检测", category: "通用技能", description: "AI辅助质量检测与异常识别" },
  { id: "s3", name: "客户沟通", category: "销售技能", description: "与客户建立信任、挖掘需求的能力" },
  { id: "s4", name: "产品讲解", category: "销售技能", description: "清晰准确地向客户介绍产品特性" },
  { id: "s5", name: "异议处理", category: "销售技能", description: "有效应对客户质疑与拒绝" },
  { id: "s6", name: "数据分析", category: "通用技能", description: "从数据中提取洞察与决策依据" },
  { id: "s7", name: "谈判技巧", category: "销售技能", description: "在商务谈判中达成共赢" },
  { id: "s8", name: "库存管理", category: "供应链", description: "优化库存水平与周转效率" },
  { id: "s9", name: "物流协调", category: "供应链", description: "协调多方物流确保准时交付" },
  { id: "s10", name: "售后服务", category: "服务技能", description: "处理退换货与客户投诉" },
  { id: "s11", name: "团队协作", category: "通用技能", description: "跨部门协作完成目标" },
  { id: "s12", name: "时间管理", category: "通用技能", description: "合理规划工作优先级" },
];

interface SkillItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

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
  const [isDynamic, setIsDynamic] = useState(true);
  const [skills, setSkills] = useState<SkillItem[]>([
    { id: "s1", name: "智能搜索", category: "通用技能", description: "高效检索信息与知识的能力" },
    { id: "s3", name: "客户沟通", category: "销售技能", description: "与客户建立信任、挖掘需求的能力" },
  ]);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

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
      setIsDynamic(true);
    }
  }, [character, open, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const avatars = isDynamic ? characterAvatars.dynamic : characterAvatars.static;
      await onSave({
        name: values.name,
        personality: values.personality,
        voiceStyle: selectedVoiceStyle,
        systemPrompt: values.systemPrompt,
        avatarUrl: avatars[selectedAvatar]?.url || "",
      });
      onOpenChange(false);
    } catch (error) {
      message.error("请填写完整信息");
    }
  };

  const handleOpenSkillModal = () => {
    setSelectedSkillIds(skills.map(s => s.id));
    setSkillSearch("");
    setSkillModalOpen(true);
  };

  const handleConfirmSkills = () => {
    const selected = skillsLibrary.filter(s => selectedSkillIds.includes(s.id));
    setSkills(selected);
    setSkillModalOpen(false);
  };

  const filteredSkillsLibrary = skillsLibrary.filter(s =>
    s.name.includes(skillSearch) || s.category.includes(skillSearch)
  );

  const isEditing = !!character;
  const avatars = isDynamic ? characterAvatars.dynamic : characterAvatars.static;

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

          <Card size="small" title="Skills" style={{ marginBottom: 16 }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{skill.name}</div>
                  <div style={{ color: "#999", fontSize: 12 }}>{skill.description}</div>
                </div>
                <Space>
                  <Tag color="blue">{skill.category}</Tag>
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSkills(skills.filter(s => s.id !== skill.id))} />
                </Space>
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} block style={{ marginTop: 8 }} onClick={handleOpenSkillModal}>
              从Skills库添加
            </Button>
          </Card>

          <Card size="small" title="数字形象" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span>形象类型</span>
              <Space>
                <Tag color={isDynamic ? "blue" : undefined} style={{ cursor: "pointer" }} onClick={() => setIsDynamic(true)}>动态数字人</Tag>
                <Switch checked={isDynamic} onChange={setIsDynamic} size="small" />
                <Tag color={!isDynamic ? "blue" : undefined} style={{ cursor: "pointer" }} onClick={() => setIsDynamic(false)}>静态数字人</Tag>
              </Space>
            </div>
            <Divider plain style={{ margin: "8px 0" }}>{isDynamic ? "动态数字人形象" : "静态数字人形象"}</Divider>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {avatars.map((avatar, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: selectedAvatar === index ? "2px solid #1677ff" : "2px solid #f0f0f0",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                  }}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img src={avatar.url} alt={avatar.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{avatar.name}</div>
                  {selectedAvatar === index && (
                    <div style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "#1677ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckOutlined style={{ color: "#fff", fontSize: 12 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button type="dashed" icon={<PlusOutlined />} block style={{ marginTop: 8 }}>
              点击添加{isDynamic ? "动态" : "静态"}数字形象
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
            <Avatar size={96} src={avatars[selectedAvatar]?.url} style={{ backgroundColor: "#1677ff", marginBottom: 16 }}>
              {form.getFieldValue("name")?.slice(0, 2) || "AI"}
            </Avatar>
            <h3>{form.getFieldValue("name") || "AI角色"}</h3>
            <p style={{ color: "#999" }}>{form.getFieldValue("personality") || "请设置角色性格特点"}</p>
            <Tag color={isDynamic ? "blue" : "default"}>{isDynamic ? "动态数字人" : "静态数字人"}</Tag>
            <div style={{ marginTop: 12 }}>
              {skills.map(s => <Tag key={s.id} color="geekblue" style={{ marginBottom: 4 }}>{s.name}</Tag>)}
            </div>
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
    <>
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={avatars[selectedAvatar]?.url} style={{ backgroundColor: "#1677ff" }}>{form.getFieldValue("name")?.slice(0, 2) || "AI"}</Avatar>
            <div>
              <div>{isEditing ? form.getFieldValue("name") : "新建AI角色"}</div>
              {isEditing && character?.updated_at && (
                <div style={{ fontSize: 12, color: "#999" }}>数据保存于 {new Date(character.updated_at).toLocaleString()}</div>
              )}
            </div>
          </div>
        }
        placement="right"
        width="50vw"
        open={open}
        onClose={() => onOpenChange(false)}
        zIndex={1000}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="primary" onClick={handleSave} loading={isSaving}>保存</Button>
          </div>
        }
      >
        <Tabs items={tabItems} />
      </Drawer>

      <Modal
        title="从Skills库选择"
        open={skillModalOpen}
        onCancel={() => setSkillModalOpen(false)}
        onOk={handleConfirmSkills}
        width={560}
        zIndex={1100}
      >
        <Input
          placeholder="搜索Skills..."
          prefix={<SearchOutlined />}
          value={skillSearch}
          onChange={e => setSkillSearch(e.target.value)}
          style={{ marginBottom: 12 }}
          allowClear
        />
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          <Checkbox.Group
            value={selectedSkillIds}
            onChange={(vals) => setSelectedSkillIds(vals as string[])}
            style={{ width: "100%" }}
          >
            <List
              dataSource={filteredSkillsLibrary}
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Checkbox value={item.id} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <Tag color="blue" style={{ marginLeft: "auto" }}>{item.category}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>{item.description}</div>
                  </Checkbox>
                </List.Item>
              )}
            />
          </Checkbox.Group>
        </div>
      </Modal>
    </>
  );
}
