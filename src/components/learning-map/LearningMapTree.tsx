import { useState } from "react";
import { Input, Tree, Dropdown, Badge, Button } from "antd";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  FolderOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  CopyOutlined,
  BranchesOutlined,
  StopOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import type { LearningMap } from "@/pages/learning-map/LearningMapLibrary";

interface Position {
  id: string;
  name: string;
}

interface LearningMapTreeProps {
  positions: Position[];
  maps: LearningMap[];
  selectedPosition: string | null;
  onSelectPosition: (positionId: string | null) => void;
  onCreateMap: () => void;
  onCreateVersion: (map: LearningMap) => void;
  onDisableMap: (map: LearningMap) => void;
}

export function LearningMapTree({
  positions,
  maps,
  selectedPosition,
  onSelectPosition,
  onCreateMap,
  onCreateVersion,
  onDisableMap,
}: LearningMapTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(positions.map((p) => p.id));

  const getMapsByPosition = (positionId: string) => {
    return maps.filter((map) => map.positionId === positionId);
  };

  const getStatusBadge = (status: LearningMap["status"]) => {
    switch (status) {
      case "published":
        return <Badge status="success" text="已发布" />;
      case "draft":
        return <Badge status="default" text="草稿" />;
      case "disabled":
        return <Badge status="error" text="已停用" />;
    }
  };

  const getMapMenuItems = (map: LearningMap): MenuProps["items"] => [
    { key: "create", icon: <PlusOutlined />, label: "新建地图", onClick: () => onCreateMap() },
    { key: "copy", icon: <CopyOutlined />, label: "复制地图" },
    { key: "version", icon: <BranchesOutlined />, label: "创建新版本", onClick: () => onCreateVersion(map) },
    { type: "divider" },
    { key: "disable", icon: <StopOutlined />, label: "停用", danger: true, onClick: () => onDisableMap(map) },
  ];

  const positionMenuItems: MenuProps["items"] = [
    { key: "create", icon: <PlusOutlined />, label: "新建地图", onClick: () => onCreateMap() },
  ];

  const treeData: DataNode[] = [
    {
      key: "all",
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>
            <NodeIndexOutlined style={{ marginRight: 8, color: "#1677ff" }} />
            全部地图
          </span>
          <span style={{ color: "#999", fontSize: 12 }}>{maps.length}</span>
        </div>
      ),
      icon: null,
    },
    ...positions.map((position) => {
      const positionMaps = getMapsByPosition(position.id);
      return {
        key: position.id,
        title: (
          <Dropdown menu={{ items: positionMenuItems }} trigger={["contextMenu"]}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
              <span>
                <FolderOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                {position.name}
              </span>
              <span style={{ color: "#999", fontSize: 12 }}>{positionMaps.length}</span>
            </div>
          </Dropdown>
        ),
        children: positionMaps.map((map) => ({
          key: map.id,
          title: (
            <Dropdown menu={{ items: getMapMenuItems(map) }} trigger={["contextMenu"]}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                <div>
                  <NodeIndexOutlined style={{ marginRight: 8, color: "#999" }} />
                  <span>{map.name}</span>
                  <div style={{ marginTop: 2 }}>
                    {getStatusBadge(map.status)}
                    <span style={{ marginLeft: 8, fontSize: 10, color: "#999" }}>{map.version}</span>
                  </div>
                </div>
                <Dropdown menu={{ items: getMapMenuItems(map) }} trigger={["click"]}>
                  <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              </div>
            </Dropdown>
          ),
          isLeaf: true,
        })),
      };
    }),
  ];

  const onSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0];
    if (key === "all") {
      onSelectPosition(null);
    } else if (typeof key === "string") {
      // Check if it's a position or a map
      const isPosition = positions.some((p) => p.id === key);
      if (isPosition) {
        onSelectPosition(key);
      }
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #f0f0f0" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #f0f0f0" }}>
        <Input
          placeholder="搜索岗位/地图..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          selectedKeys={selectedPosition ? [selectedPosition] : ["all"]}
          onSelect={onSelect}
          showIcon={false}
          blockNode
        />
      </div>
    </div>
  );
}
