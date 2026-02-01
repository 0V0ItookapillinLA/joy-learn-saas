import { Card, Table, Tag, Button, Input, Select, Space, Avatar, Progress, Tooltip, Typography, Dropdown, message } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  UserOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { TaskAssignModal } from "./TaskAssignModal";

const { Text } = Typography;

interface Student {
  id: string;
  name: string;
  avatar?: string;
  employeeId: string;
  department: string;
  position: string;
  progress: number;
  avgScore: number;
  highScore: number;
  aiEvaluation: string[];
  aiGrade: "S" | "A" | "B" | "C";
  lastActive: string;
  daysSinceActive: number;
  practiceCount: number;
}

const studentsData: Student[] = [
  { id: "1", name: "张伟", employeeId: "E001", department: "华东销售部", position: "销售经理", progress: 85, avgScore: 82, highScore: 92, aiEvaluation: ["逻辑清晰", "表达流畅"], aiGrade: "A", lastActive: "2026-01-31", daysSinceActive: 1, practiceCount: 18 },
  { id: "2", name: "李娜", employeeId: "E002", department: "华北销售部", position: "销售代表", progress: 62, avgScore: 65, highScore: 78, aiEvaluation: ["需求理解弱", "语速过快"], aiGrade: "B", lastActive: "2026-01-28", daysSinceActive: 4, practiceCount: 12 },
  { id: "3", name: "王强", employeeId: "E003", department: "研发一组", position: "产品经理", progress: 92, avgScore: 88, highScore: 95, aiEvaluation: ["专业知识扎实", "同理心强"], aiGrade: "S", lastActive: "2026-02-01", daysSinceActive: 0, practiceCount: 25 },
  { id: "4", name: "刘洋", employeeId: "E004", department: "客服一组", position: "客服专员", progress: 45, avgScore: 52, highScore: 68, aiEvaluation: ["反应迟钝", "情绪控制差"], aiGrade: "C", lastActive: "2026-01-20", daysSinceActive: 12, practiceCount: 8 },
  { id: "5", name: "陈明", employeeId: "E005", department: "华东销售部", position: "销售代表", progress: 78, avgScore: 75, highScore: 85, aiEvaluation: ["应变能力强"], aiGrade: "B", lastActive: "2026-01-30", daysSinceActive: 2, practiceCount: 15 },
  { id: "6", name: "赵静", employeeId: "E006", department: "市场部", position: "市场专员", progress: 35, avgScore: 48, highScore: 62, aiEvaluation: ["产品知识薄弱", "缺乏自信"], aiGrade: "C", lastActive: "2026-01-15", daysSinceActive: 17, practiceCount: 6 },
  { id: "7", name: "孙鹏", employeeId: "E007", department: "研发二组", position: "开发工程师", progress: 55, avgScore: 58, highScore: 72, aiEvaluation: ["逻辑思维好", "沟通待提升"], aiGrade: "B", lastActive: "2026-01-25", daysSinceActive: 7, practiceCount: 10 },
  { id: "8", name: "周婷", employeeId: "E008", department: "客服三组", position: "客服主管", progress: 88, avgScore: 85, highScore: 93, aiEvaluation: ["情商高", "问题解决能力强"], aiGrade: "A", lastActive: "2026-02-01", daysSinceActive: 0, practiceCount: 22 },
];

const gradeColors: { [key: string]: string } = {
  S: "gold",
  A: "green",
  B: "blue",
  C: "red",
};

interface StudentListTableProps {
  onViewDetail: (studentId: string) => void;
  departmentFilter?: string;
  skillFilter?: string;
}

export function StudentListTable({ onViewDetail, departmentFilter, skillFilter }: StudentListTableProps) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargets, setAssignTargets] = useState<{ id: string; name: string; employeeId: string; department: string }[]>([]);
  const [targetWeakSkills, setTargetWeakSkills] = useState<string[]>([]);

  const filteredData = studentsData.filter((student) => {
    const matchesSearch = student.name.includes(searchText) || student.employeeId.includes(searchText);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "not_started" && student.progress === 0) ||
      (statusFilter === "in_progress" && student.progress > 0 && student.progress < 100) ||
      (statusFilter === "completed" && student.progress === 100);
    const matchesGrade = gradeFilter === "all" || student.aiGrade === gradeFilter;
    const matchesDepartment = !departmentFilter || student.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesGrade && matchesDepartment;
  });

  const handleRemind = (studentIds: string[]) => {
    message.success(`已向 ${studentIds.length} 位学员发送催办通知`);
    setSelectedRowKeys([]);
  };

  const handleAssign = (studentIds: string[]) => {
    const targets = studentsData
      .filter(s => studentIds.includes(s.id))
      .map(s => ({ id: s.id, name: s.name, employeeId: s.employeeId, department: s.department }));
    
    // Collect weak skills from AI evaluations that indicate issues
    const weakSkillsSet = new Set<string>();
    targets.forEach(t => {
      const student = studentsData.find(s => s.id === t.id);
      if (student) {
        student.aiEvaluation.forEach(evalItem => {
          if (evalItem.includes("弱") || evalItem.includes("差") || evalItem.includes("缺乏") || evalItem.includes("待提升")) {
            weakSkillsSet.add(evalItem);
          }
        });
      }
    });
    
    setAssignTargets(targets);
    setTargetWeakSkills(Array.from(weakSkillsSet));
    setAssignModalOpen(true);
  };

  const columns: ColumnsType<Student> = [
    {
      title: "学员",
      key: "student",
      fixed: "left",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar size={36} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.employeeId}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "部门/岗位",
      key: "dept",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 13 }}>{record.department}</div>
          <Tag style={{ fontSize: 11 }}>{record.position}</Tag>
        </div>
      ),
    },
    {
      title: "学习进度",
      dataIndex: "progress",
      key: "progress",
      width: 150,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={progress < 40 ? "#ff4d4f" : progress < 70 ? "#faad14" : "#52c41a"}
        />
      ),
    },
    {
      title: "考核数据",
      key: "scores",
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>平均: <span style={{ fontWeight: 500, color: record.avgScore >= 60 ? "#52c41a" : "#ff4d4f" }}>{record.avgScore}</span></div>
          <div>最高: <span style={{ fontWeight: 500 }}>{record.highScore}</span></div>
        </div>
      ),
    },
    {
      title: "AI 综合评价",
      key: "aiEval",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Tag color={gradeColors[record.aiGrade]} style={{ fontWeight: 600 }}>{record.aiGrade}</Tag>
          {record.aiEvaluation.slice(0, 2).map((tag) => (
            <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "最近活跃",
      key: "lastActive",
      width: 120,
      sorter: (a, b) => a.daysSinceActive - b.daysSinceActive,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12 }}>{record.lastActive}</div>
          {record.daysSinceActive > 7 && (
            <Text type="danger" style={{ fontSize: 11 }}>{record.daysSinceActive}天未活跃</Text>
          )}
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space split={<span style={{ color: "#d9d9d9" }}>|</span>}>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => onViewDetail(record.id)}>
            详情
          </Button>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => handleRemind([record.id])}>
            催办
          </Button>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => handleAssign([record.id])}>
            指派
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="学员详情列表"
      extra={
        <Space>
          {selectedRowKeys.length > 0 && (
            <>
              <Button icon={<BellOutlined />} onClick={() => handleRemind(selectedRowKeys as string[])}>
                批量催办 ({selectedRowKeys.length})
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => handleAssign(selectedRowKeys as string[])}>
                批量指派
              </Button>
            </>
          )}
          <Button icon={<ExportOutlined />}>导出</Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Input
          placeholder="搜索姓名/工号"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { label: "全部状态", value: "all" },
            { label: "未开始", value: "not_started" },
            { label: "进行中", value: "in_progress" },
            { label: "已结业", value: "completed" },
          ]}
        />
        <Select
          value={gradeFilter}
          onChange={setGradeFilter}
          style={{ width: 120 }}
          options={[
            { label: "全部评级", value: "all" },
            { label: "S级", value: "S" },
            { label: "A级", value: "A" },
            { label: "B级", value: "B" },
            { label: "C级", value: "C" },
          ]}
        />
      </div>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: 1100 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <TaskAssignModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedRowKeys([]);
        }}
        selectedStudents={assignTargets}
        weakSkills={targetWeakSkills}
      />
    </Card>
  );
}
