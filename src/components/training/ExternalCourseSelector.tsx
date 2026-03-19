import { useState } from "react";
import { Modal, Table, Tag, Input, Space, Typography, Button, Tabs, Avatar, Empty } from "antd";
import { SearchOutlined, VideoCameraOutlined, FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ExternalCourse {
  id: string;
  title: string;
  description: string;
  course_type: "video" | "ppt" | "document";
  duration_minutes: number;
  source: string;
  cover_image_url?: string;
  tags: string[];
}

// Mock data for 京英 courses
const mockJingyingCourses: ExternalCourse[] = [
  { id: "jy-001", title: "新员工入职培训-企业文化篇", description: "了解公司发展历程、核心价值观与企业文化", course_type: "video", duration_minutes: 45, source: "jingying", tags: ["入职培训", "企业文化"] },
  { id: "jy-002", title: "产品知识精讲 - 核心产品线", description: "深入讲解公司核心产品线的功能、优势与市场定位", course_type: "ppt", duration_minutes: 60, source: "jingying", tags: ["产品知识", "必修"] },
  { id: "jy-003", title: "销售技巧实战 - SPIN提问法", description: "掌握SPIN提问法的四个维度及实际应用场景", course_type: "video", duration_minutes: 90, source: "jingying", tags: ["销售技巧", "进阶"] },
  { id: "jy-004", title: "客户服务标准流程", description: "标准化客户服务流程，包括接待、处理、跟进等环节", course_type: "ppt", duration_minutes: 30, source: "jingying", tags: ["客户服务", "基础"] },
  { id: "jy-005", title: "沟通协作能力提升", description: "跨部门沟通技巧、冲突处理与团队协作方法论", course_type: "video", duration_minutes: 75, source: "jingying", tags: ["软技能", "通用"] },
  { id: "jy-006", title: "数据分析基础 - Excel进阶", description: "数据透视表、VLOOKUP、条件格式等高级功能", course_type: "ppt", duration_minutes: 120, source: "jingying", tags: ["数据分析", "工具"] },
  { id: "jy-007", title: "项目管理方法论 - 敏捷实践", description: "Scrum框架、看板管理与持续改进的敏捷实践指南", course_type: "video", duration_minutes: 60, source: "jingying", tags: ["项目管理", "进阶"] },
  { id: "jy-008", title: "合规与风险控制培训", description: "企业合规要求、风险识别与防控机制详解", course_type: "document", duration_minutes: 40, source: "jingying", tags: ["合规", "必修"] },
];

interface ExternalCourseSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (courses: ExternalCourse[]) => void;
  selectedIds?: string[];
}

const typeConfig = {
  video: { icon: <VideoCameraOutlined />, color: "blue", label: "视频" },
  ppt: { icon: <FileTextOutlined />, color: "orange", label: "PPT" },
  document: { icon: <FileTextOutlined />, color: "green", label: "文档" },
};

export function ExternalCourseSelector({ open, onClose, onSelect, selectedIds = [] }: ExternalCourseSelectorProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedIds);

  const filtered = mockJingyingCourses.filter(c =>
    c.title.includes(search) || c.tags.some(t => t.includes(search))
  );

  const handleConfirm = () => {
    const courses = mockJingyingCourses.filter(c => selected.includes(c.id));
    onSelect(courses);
    onClose();
  };

  return (
    <Modal
      title="从京英慕课导入课程"
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText={`导入 ${selected.length} 门课程`}
      width={800}
      zIndex={1001}
    >
      <Tabs
        items={[
          {
            key: "jingying",
            label: "京英慕课",
            children: (
              <div>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="搜索课程名称或标签..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ marginBottom: 16 }}
                  allowClear
                />
                <Table
                  dataSource={filtered}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 5 }}
                  rowSelection={{
                    selectedRowKeys: selected,
                    onChange: (keys) => setSelected(keys as string[]),
                  }}
                  columns={[
                    {
                      title: "课程",
                      key: "course",
                      render: (_, record) => (
                        <Space>
                          <Avatar
                            shape="square"
                            size="large"
                            style={{ background: typeConfig[record.course_type].color === "blue" ? "#1677ff" : typeConfig[record.course_type].color === "orange" ? "#fa8c16" : "#52c41a" }}
                            icon={typeConfig[record.course_type].icon}
                          />
                          <div>
                            <Text strong>{record.title}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      title: "类型",
                      dataIndex: "course_type",
                      width: 80,
                      render: (type: keyof typeof typeConfig) => (
                        <Tag color={typeConfig[type].color} icon={typeConfig[type].icon}>
                          {typeConfig[type].label}
                        </Tag>
                      ),
                    },
                    {
                      title: "时长",
                      dataIndex: "duration_minutes",
                      width: 80,
                      render: (m: number) => `${m}分钟`,
                    },
                    {
                      title: "标签",
                      dataIndex: "tags",
                      width: 150,
                      render: (tags: string[]) => tags.map(t => <Tag key={t} style={{ marginBottom: 2 }}>{t}</Tag>),
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            key: "project",
            label: "项目课程",
            children: <Empty description="项目课程对接开发中" style={{ padding: 40 }} />,
          },
        ]}
      />
    </Modal>
  );
}
