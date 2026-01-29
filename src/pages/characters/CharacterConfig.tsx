import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Input, Button, Table, Tag, Space, Avatar, Statistic, Row, Col, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { CharacterEditSheet } from "@/components/characters/CharacterEditSheet";
import { useAICharacters, useCreateAICharacter, useUpdateAICharacter, useDeleteAICharacter } from "@/hooks/useAICharacters";
import type { Database } from "@/integrations/supabase/types";
import type { ColumnsType } from "antd/es/table";

type AICharacterRow = Database['public']['Tables']['ai_characters']['Row'];

const voiceStyles = [
  "沉稳男声",
  "稳重男声",
  "清亮女声",
  "活泼女声",
  "磁性男声",
  "温柔女声",
];

export default function CharacterConfig() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AICharacterRow | null>(null);

  const { data: characters = [], isLoading } = useAICharacters();
  const createMutation = useCreateAICharacter();
  const updateMutation = useUpdateAICharacter();
  const deleteMutation = useDeleteAICharacter();

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCharacter(null);
    setEditSheetOpen(true);
  };

  const handleEdit = (character: AICharacterRow) => {
    setEditingCharacter(character);
    setEditSheetOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    personality: string;
    voiceStyle: string;
    systemPrompt: string;
    avatarUrl: string;
  }) => {
    if (editingCharacter) {
      await updateMutation.mutateAsync({
        id: editingCharacter.id,
        name: data.name,
        personality: data.personality,
        voice_style: data.voiceStyle,
        system_prompt: data.systemPrompt,
        avatar_url: data.avatarUrl,
      });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        personality: data.personality,
        voice_style: data.voiceStyle,
        system_prompt: data.systemPrompt,
        avatar_url: data.avatarUrl,
        is_active: true,
      });
    }
    setEditSheetOpen(false);
  };

  const handleDelete = (character: AICharacterRow) => {
    deleteMutation.mutate(character.id);
  };

  const handleToggleActive = async (character: AICharacterRow) => {
    await updateMutation.mutateAsync({
      id: character.id,
      is_active: !character.is_active,
    });
  };

  // Stats
  const totalCharacters = characters.length;
  const activeCharacters = characters.filter((c) => c.is_active).length;

  const columns: ColumnsType<AICharacterRow> = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar_url || undefined}
            style={{ backgroundColor: "#3b82f6" }}
          >
            {text.slice(0, 2)}
          </Avatar>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "性格特点",
      dataIndex: "personality",
      key: "personality",
      render: (text) => <span className="text-gray-500">{text || "-"}</span>,
    },
    {
      title: "语音风格",
      dataIndex: "voice_style",
      key: "voice_style",
      render: (text) => <Tag>{text || "未设置"}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      render: (isActive, record) => (
        <Tag
          color={isActive ? "success" : "default"}
          style={{ cursor: "pointer" }}
          onClick={() => handleToggleActive(record)}
        >
          {isActive ? "启用" : "停用"}
        </Tag>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      align: "center",
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="角色配置" description="管理AI对话角色">
      <div className="space-y-6">
        {/* Stats */}
        <Row gutter={16}>
          <Col xs={12} sm={8}>
            <Card>
              <Statistic title="全部角色" value={totalCharacters} />
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card>
              <Statistic title="已启用" value={activeCharacters} valueStyle={{ color: "#3b82f6" }} />
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card>
              <Statistic title="总使用次数" value={0} />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Input
            placeholder="搜索角色名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            style={{ width: 320 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建AI角色
          </Button>
        </div>

        {/* Table */}
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredCharacters}
            rowKey="id"
            loading={isLoading}
            locale={{
              emptyText: (
                <div className="py-8 text-gray-500">
                  <p>暂无AI角色</p>
                  <p className="text-sm">点击"新建AI角色"创建第一个角色</p>
                </div>
              ),
            }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      </div>

      <CharacterEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        character={editingCharacter}
        voiceStyles={voiceStyles}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}
