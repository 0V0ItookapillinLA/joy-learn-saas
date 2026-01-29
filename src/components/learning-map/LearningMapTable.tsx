import { Table, Tag, Button, Space, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Map } from "lucide-react";
import type { LearningMap } from "@/pages/learning-map/LearningMapLibrary";

interface LearningMapTableProps {
  maps: LearningMap[];
  onView: (map: LearningMap) => void;
  onEdit: (map: LearningMap) => void;
  onPublish: (map: LearningMap) => void;
  onDisable: (map: LearningMap) => void;
  onCreateVersion: (map: LearningMap) => void;
}

export function LearningMapTable({
  maps,
  onView,
  onEdit,
  onPublish,
  onDisable,
  onCreateVersion,
}: LearningMapTableProps) {
  const getStatusTag = (status: LearningMap["status"]) => {
    switch (status) {
      case "draft":
        return <Tag>草稿</Tag>;
      case "published":
        return <Tag color="success">已发布</Tag>;
      case "disabled":
        return <Tag color="default">已停用</Tag>;
      default:
        return null;
    }
  };

  const columns: ColumnsType<LearningMap> = [
    {
      title: "地图名称",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "岗位",
      dataIndex: "position",
      key: "position",
      width: 100,
    },
    {
      title: "覆盖能力",
      dataIndex: "behaviorTagCount",
      key: "behaviorTagCount",
      width: 100,
      align: "center",
      render: (count) => (
        <span>
          <span className="text-primary font-medium">{count}</span>
          <span className="text-gray-400 text-xs ml-1">个标签</span>
        </span>
      ),
    },
    {
      title: "覆盖任务",
      dataIndex: "taskTagCount",
      key: "taskTagCount",
      width: 100,
      align: "center",
      render: (count) => (
        <span>
          <span className="text-primary font-medium">{count}</span>
          <span className="text-gray-400 text-xs ml-1">个任务</span>
        </span>
      ),
    },
    {
      title: "学习阶段",
      dataIndex: "stageCount",
      key: "stageCount",
      width: 100,
      align: "center",
      render: (count) => (
        <span>
          <span className="text-primary font-medium">{count}</span>
          <span className="text-gray-400 text-xs ml-1">个阶段</span>
        </span>
      ),
    },
    {
      title: "适用人群",
      dataIndex: "targetAudience",
      key: "targetAudience",
      width: 150,
      render: (audiences: string[]) => (
        <Space size={4} wrap>
          {audiences.map((audience) => (
            <Tag key={audience} color="blue">
              {audience}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 80,
      align: "center",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "最近更新",
      key: "updated",
      width: 150,
      render: (_, record) => (
        <Tooltip title={record.updatedAt}>
          <div className="text-sm">
            <div>{record.updatedBy}</div>
            <div className="text-gray-400">{record.updatedAt}</div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => onView(record)}>
            查看
          </Button>
          {record.status === "draft" && (
            <>
              <Button type="link" size="small" onClick={() => onEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" onClick={() => onPublish(record)}>
                发布
              </Button>
            </>
          )}
          {record.status === "published" && (
            <>
              <Button type="link" size="small" onClick={() => onCreateVersion(record)}>
                创建新版本
              </Button>
              <Button type="link" size="small" danger onClick={() => onDisable(record)}>
                停用
              </Button>
            </>
          )}
          {record.status === "disabled" && (
            <Button type="link" size="small" onClick={() => onPublish(record)}>
              恢复
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={maps}
      rowKey="id"
      scroll={{ x: 1200 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`,
        defaultPageSize: 10,
      }}
      locale={{
        emptyText: (
          <div className="py-8 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Map className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium">暂无学习地图</p>
            <p className="text-sm">点击"新建地图"创建第一个学习地图</p>
          </div>
        ),
      }}
    />
  );
}
