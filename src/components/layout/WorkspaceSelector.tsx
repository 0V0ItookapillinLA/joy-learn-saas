import { useState } from "react";
import { Dropdown, Button, Modal, Input, Tabs, List, Avatar, Pagination, App, Popconfirm } from "antd";
import { SwapOutlined, PlusOutlined, SettingOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const { TextArea } = Input;

const mockMembers = [
  "卜*建/buwenjian1", "丁*智/dingzhi24", "企*****二/enterprisetest3",
  "姜*良/jiangdongliang11", "李*文/lihanwen14", "刘*瑶/liuliangfan1",
  "马*明/mamingming5", "潘*华/panhuahua2", "钱*龙/qianlong88",
];

export function WorkspaceSelector() {
  const { message } = App.useApp();
  const { currentWorkspace, workspaces, switchWorkspace, addWorkspace, updateWorkspace } = useWorkspace();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newWsOpen, setNewWsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("basic");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [memberPage, setMemberPage] = useState(1);

  const handleSwitchWorkspace = (ws: typeof currentWorkspace) => {
    switchWorkspace(ws);
    message.success(`已切换到空间：${ws.name}`);
  };

  const handleOpenSettings = () => {
    setEditName(currentWorkspace.name);
    setEditDesc(currentWorkspace.description);
    setSettingsTab("basic");
    setSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    updateWorkspace({ ...currentWorkspace, name: editName, description: editDesc });
    message.success("空间信息已更新");
    setSettingsOpen(false);
  };

  const handleCreateWorkspace = () => {
    if (!newName.trim()) { message.warning("请输入空间名称"); return; }
    addWorkspace({ id: `ws${Date.now()}`, name: newName, description: newDesc, memberCount: 0 });
    setNewWsOpen(false);
    setNewName("");
    setNewDesc("");
    message.success("空间创建成功");
  };

  const dropdownItems = {
    items: [
      { key: "label", label: <div style={{ color: "#999", fontSize: 12, padding: "4px 0" }}>切换空间</div>, disabled: true },
      ...workspaces.map(ws => ({
        key: ws.id,
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 200 }}>
            <span style={{ color: ws.id === currentWorkspace.id ? "#1677ff" : undefined, fontWeight: ws.id === currentWorkspace.id ? 600 : 400 }}>{ws.name}</span>
            {ws.id === currentWorkspace.id && <CheckOutlined style={{ color: "#1677ff" }} />}
          </div>
        ),
        onClick: () => handleSwitchWorkspace(ws),
      })),
      { type: "divider" as const },
      { key: "new", icon: <PlusOutlined />, label: "新建业务空间", onClick: () => setNewWsOpen(true) },
      { key: "settings", icon: <SettingOutlined />, label: "空间设置", onClick: handleOpenSettings },
    ],
  };

  const pageSize = 6;
  const paginatedMembers = mockMembers.slice((memberPage - 1) * pageSize, memberPage * pageSize);

  return (
    <>
      <Dropdown menu={dropdownItems} trigger={["click"]} placement="bottomRight">
        <Button type="text" icon={<SwapOutlined />} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {currentWorkspace.name}
        </Button>
      </Dropdown>

      <Modal title={<div><div style={{ fontSize: 16, fontWeight: 600 }}>空间设置</div><div style={{ fontSize: 13, color: "#999" }}>当前空间: {currentWorkspace.name}</div></div>}
        open={settingsOpen} onCancel={() => setSettingsOpen(false)} footer={null} width={600} zIndex={1100}>
        <Tabs activeKey={settingsTab} onChange={setSettingsTab} items={[
          {
            key: "basic", label: "基础信息",
            children: (
              <div className="space-y-4">
                <div><div style={{ marginBottom: 4 }}><span style={{ color: "red" }}>*</span> 空间名称</div>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} maxLength={20} showCount /></div>
                <div><div style={{ marginBottom: 4 }}>空间描述</div>
                  <TextArea value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={500} showCount rows={4} /></div>
                <Button type="primary" onClick={handleSaveSettings}>保存修改</Button>
              </div>
            ),
          },
          {
            key: "members", label: `成员管理 (${currentWorkspace.memberCount})`,
            children: (
              <div>
                <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>添加成员</Button>
                <List dataSource={paginatedMembers} renderItem={(member) => (
                  <List.Item actions={[
                    <Popconfirm title="确定移除该成员？" onConfirm={() => message.success("已移除")}>
                      <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                  ]}>
                    <List.Item.Meta avatar={<Avatar style={{ backgroundColor: "#d9d9d9" }}>{member.split("/")[0].slice(0, 1)}</Avatar>} title={member} />
                  </List.Item>
                )} />
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Pagination current={memberPage} total={mockMembers.length} pageSize={pageSize} onChange={setMemberPage} simple />
                </div>
              </div>
            ),
          },
        ]} />
      </Modal>

      <Modal title="新建业务空间" open={newWsOpen} onCancel={() => setNewWsOpen(false)} onOk={handleCreateWorkspace} okText="创建" zIndex={1100}>
        <div className="space-y-4">
          <div><div style={{ marginBottom: 4 }}><span style={{ color: "red" }}>*</span> 空间名称</div>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="请输入空间名称" maxLength={20} showCount /></div>
          <div><div style={{ marginBottom: 4 }}>空间描述</div>
            <TextArea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="请输入空间描述" maxLength={500} showCount rows={3} /></div>
        </div>
      </Modal>
    </>
  );
}
