import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  Button,
  Input,
  Tree,
  Modal,
  Form,
  Dropdown,
  Row,
  Col,
  Statistic,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  TeamOutlined,
  ApartmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { DataNode, TreeProps } from "antd/es/tree";
import type { MenuProps } from "antd";

// Mock organization structure
const mockDepartments = [
  {
    id: "1",
    name: "销售部",
    memberCount: 45,
    children: [
      { id: "1-1", name: "华北区销售", memberCount: 15 },
      { id: "1-2", name: "华东区销售", memberCount: 18 },
      { id: "1-3", name: "华南区销售", memberCount: 12 },
    ],
  },
  {
    id: "2",
    name: "客服部",
    memberCount: 32,
    children: [
      { id: "2-1", name: "在线客服组", memberCount: 20 },
      { id: "2-2", name: "电话客服组", memberCount: 12 },
    ],
  },
  {
    id: "3",
    name: "市场部",
    memberCount: 18,
    children: [],
  },
  {
    id: "4",
    name: "技术部",
    memberCount: 56,
    children: [
      { id: "4-1", name: "研发组", memberCount: 35 },
      { id: "4-2", name: "测试组", memberCount: 12 },
      { id: "4-3", name: "运维组", memberCount: 9 },
    ],
  },
  {
    id: "5",
    name: "人事部",
    memberCount: 8,
    children: [],
  },
];

// Transform to Antd Tree data
const transformToTreeData = (departments: typeof mockDepartments): DataNode[] => {
  return departments.map((dept) => ({
    key: dept.id,
    title: (
      <div className="flex items-center justify-between w-full pr-4">
        <div className="flex items-center gap-2">
          <ApartmentOutlined />
          <span className="font-medium">{dept.name}</span>
          <Tag color="blue">{dept.memberCount} 人</Tag>
        </div>
        <Dropdown
          menu={{
            items: [
              { key: "add", icon: <PlusOutlined />, label: "添加子部门" },
              { key: "edit", icon: <EditOutlined />, label: "编辑" },
              { key: "delete", icon: <DeleteOutlined />, label: "删除", danger: true },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      </div>
    ),
    children: dept.children?.map((child) => ({
      key: child.id,
      title: (
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2">
            <ApartmentOutlined />
            <span>{child.name}</span>
            <Tag>{child.memberCount} 人</Tag>
          </div>
          <Dropdown
            menu={{
              items: [
                { key: "edit", icon: <EditOutlined />, label: "编辑" },
                { key: "delete", icon: <DeleteOutlined />, label: "删除", danger: true },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        </div>
      ),
    })),
  }));
};

export default function OrganizationSettings() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const treeData = transformToTreeData(mockDepartments);

  const handleCreateDepartment = () => {
    form.validateFields().then((values) => {
      console.log("Create department:", values);
      setIsCreateModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <DashboardLayout title="组织架构" description="管理企业部门与团队结构">
      <div className="space-y-6">
        {/* Organization Info */}
        <Card
          title="企业信息"
          extra={<Button>编辑信息</Button>}
        >
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-1">企业名称</div>
                <div className="font-medium">深圳市科技有限公司</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">套餐类型</div>
                <div className="flex items-center gap-2">
                  <Tag color="blue">专业版</Tag>
                  <span className="text-sm text-gray-500">有效期至 2024-12-31</span>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-1">学员配额</div>
                <div>
                  <span className="font-medium">159</span>
                  <span className="text-gray-500"> / 200 人</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">存储空间</div>
                <div>
                  <span className="font-medium">2.5</span>
                  <span className="text-gray-500"> / 10 GB</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="部门总数"
                value={12}
                prefix={<ApartmentOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="总成员数"
                value={159}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="管理员数"
                value={5}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Department Tree */}
        <Card
          title="部门结构"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
              新建部门
            </Button>
          }
        >
          <Tree
            showLine
            defaultExpandAll
            treeData={treeData}
            blockNode
          />
        </Card>
      </div>

      {/* Create Department Modal */}
      <Modal
        title="新建部门"
        open={isCreateModalOpen}
        onOk={handleCreateDepartment}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: "请输入部门名称" }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Input placeholder="选择上级部门（可选）" />
          </Form.Item>
          <Form.Item name="description" label="部门描述">
            <Input.TextArea placeholder="简要描述部门职责（可选）" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
