import { useState } from "react";
import { Input, Tree, Button } from "antd";
import {
  SearchOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";

interface Position {
  id: string;
  name: string;
  parentId?: string;
}

interface LearningMapTreeProps {
  positions: Position[];
  selectedPosition: string | null;
  onSelectPosition: (positionId: string | null) => void;
  onAddPosition?: () => void;
}

export function LearningMapTree({
  positions,
  selectedPosition,
  onSelectPosition,
  onAddPosition,
}: LearningMapTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    positions.filter((p) => !p.parentId).map((p) => p.id)
  );

  // Build tree structure from flat positions
  const buildTreeData = (): DataNode[] => {
    const rootPositions = positions.filter((p) => !p.parentId);
    
    const buildNode = (position: Position): DataNode => {
      const children = positions.filter((p) => p.parentId === position.id);
      const isLeaf = children.length === 0;
      
      return {
        key: position.id,
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
            {isLeaf ? (
              <NodeIndexOutlined style={{ color: "#1677ff" }} />
            ) : (
              <ApartmentOutlined style={{ color: "#1677ff" }} />
            )}
            <span>{position.name}</span>
          </div>
        ),
        children: children.length > 0 ? children.map(buildNode) : undefined,
        isLeaf,
      };
    };

    return rootPositions.map(buildNode);
  };

  // Filter tree based on search
  const filterTree = (nodes: DataNode[]): DataNode[] => {
    if (!searchQuery) return nodes;
    
    return nodes
      .map((node) => {
        const position = positions.find((p) => p.id === node.key);
        const matchesSearch = position?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = node.children ? filterTree(node.children) : undefined;
        
        if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as DataNode[];
  };

  const treeData = filterTree(buildTreeData());

  const onSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0];
    if (typeof key === "string") {
      const position = positions.find((p) => p.id === key);
      // Only select leaf nodes (actual positions with maps)
      if (position && !positions.some((p) => p.parentId === key)) {
        onSelectPosition(key);
      }
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #f0f0f0" }}>
      <div style={{ padding: "16px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600, color: "#1f1f1f" }}>岗位列表</span>
          {onAddPosition && (
            <Button 
              type="primary" 
              size="small" 
              icon={<PlusOutlined />}
              onClick={onAddPosition}
            >
              新增
            </Button>
          )}
        </div>
        <Input
          placeholder="搜索岗位..."
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
          selectedKeys={selectedPosition ? [selectedPosition] : []}
          onSelect={onSelect}
          showIcon={false}
          blockNode
        />
      </div>
    </div>
  );
}
