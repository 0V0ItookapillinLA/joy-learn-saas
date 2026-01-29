import { Table, Button, Tag, Avatar, Space, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";

export interface TrainingChapter {
  id: string;
  title: string;
  description: string | null;
  chapter_type: string | null;
  sort_order: number | null;
  duration_minutes: number | null;
  content_items?: string | null;
}

export interface TrainingPlan {
  id: string;
  title: string;
  planId: string;
  description: string;
  trainees: { name: string; avatar?: string }[];
  invitedCount: number;
  participantCount: number;
  status: "active" | "inactive";
  training_chapters?: TrainingChapter[];
}

interface TrainingPlanTableProps {
  plans: TrainingPlan[];
  onEdit: (plan: TrainingPlan) => void;
  onInvite: (plan: TrainingPlan) => void;
  onCopyLink: (plan: TrainingPlan) => void;
  onToggleStatus: (plan: TrainingPlan) => void;
}

export function TrainingPlanTable({
  plans,
  onEdit,
  onInvite,
  onCopyLink,
  onToggleStatus,
}: TrainingPlanTableProps) {
  const columns: ColumnsType<TrainingPlan> = [
    {
      title: "计划名称",
      dataIndex: "title",
      key: "title",
      width: 160,
      ellipsis: true,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "计划ID",
      dataIndex: "planId",
      key: "planId",
      width: 200,
      render: (text) => (
        <span className="text-primary font-mono text-sm">{text}</span>
      ),
    },
    {
      title: "培训计划描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-gray-500">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "学员",
      dataIndex: "trainees",
      key: "trainees",
      width: 120,
      render: (trainees: TrainingPlan["trainees"]) => (
        <Avatar.Group maxCount={3} size="small">
          {trainees.map((trainee, index) => (
            <Tooltip title={trainee.name} key={index}>
              <Avatar
                style={{ backgroundColor: "#3b82f6" }}
                size="small"
              >
                {trainee.name.slice(0, 2)}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: "邀请人数",
      dataIndex: "invitedCount",
      key: "invitedCount",
      width: 100,
      align: "center",
    },
    {
      title: "参与人数",
      dataIndex: "participantCount",
      key: "participantCount",
      width: 100,
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      align: "center",
      render: (status: TrainingPlan["status"]) => (
        <Tag color={status === "active" ? "success" : "default"}>
          {status === "active" ? "开启" : "停用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => onInvite(record)}>
            邀请
          </Button>
          <Button type="link" size="small" onClick={() => onCopyLink(record)}>
            邀请链接
          </Button>
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => onToggleStatus(record)}>
            {record.status === "active" ? "停用" : "开启"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={plans}
      rowKey="id"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "20", "50"],
      }}
      scroll={{ x: 1100 }}
    />
  );
}
