import { useState } from "react";
import { Input, Tree, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, FolderOutlined, TagOutlined, MoreOutlined, PlusOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";

// Mock data for behavior tag tree
const behaviorDomains = [
  {
    id: "domain-1",
    name: "沟通能力",
    tagCount: 24,
    clusters: [
      { id: "cluster-1-1", name: "表达清晰", tagCount: 8 },
      { id: "cluster-1-2", name: "倾听理解", tagCount: 6 },
      { id: "cluster-1-3", name: "说服影响", tagCount: 10 },
    ],
  },
  {
    id: "domain-2",
    name: "问题解决",
    tagCount: 18,
    clusters: [
      { id: "cluster-2-1", name: "分析诊断", tagCount: 7 },
      { id: "cluster-2-2", name: "方案制定", tagCount: 5 },
      { id: "cluster-2-3", name: "执行落地", tagCount: 6 },
    ],
  },
  {
    id: "domain-3",
    name: "客户服务",
    tagCount: 15,
    clusters: [
      { id: "cluster-3-1", name: "需求识别", tagCount: 5 },
      { id: "cluster-3-2", name: "投诉处理", tagCount: 4 },
      { id: "cluster-3-3", name: "关系维护", tagCount: 6 },
    ],
  },
  {
    id: "domain-4",
    name: "团队协作",
    tagCount: 12,
    clusters: [
      { id: "cluster-4-1", name: "信息共享", tagCount: 4 },
      { id: "cluster-4-2", name: "冲突处理", tagCount: 4 },
      { id: "cluster-4-3", name: "协同配合", tagCount: 4 },
    ],
  },
];

interface BehaviorTagTreeProps {
  selectedDomain: string | null;
  selectedCluster: string | null;
  onSelectDomain: (domainId: string | null) => void;
  onSelectCluster: (clusterId: string | null) => void;
}

export function BehaviorTagTree({
  selectedDomain,
  selectedCluster,
  onSelectDomain,
  onSelectCluster,
}: BehaviorTagTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(["domain-1"]);

  const domainMenuItems: MenuProps["items"] = [
    { key: "add", icon: <PlusOutlined />, label: "新增二级能力" },
    { key: "edit", icon: <EditOutlined />, label: "编辑" },
    { key: "disable", icon: <StopOutlined />, label: "停用", danger: true },
  ];

  const clusterMenuItems: MenuProps["items"] = [
    { key: "edit", icon: <EditOutlined />, label: "编辑" },
    { key: "disable", icon: <StopOutlined />, label: "停用", danger: true },
  ];

  const treeData: DataNode[] = behaviorDomains
    .filter(
      (domain) =>
        domain.name.includes(searchQuery) ||
        domain.clusters.some((cluster) => cluster.name.includes(searchQuery))
    )
    .map((domain) => ({
      key: domain.id,
      title: (
        <Dropdown menu={{ items: domainMenuItems }} trigger={["contextMenu"]}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
            <span>
              <FolderOutlined style={{ marginRight: 8, color: "#1677ff" }} />
              {domain.name}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#999", fontSize: 12 }}>{domain.tagCount}</span>
              <Dropdown menu={{ items: domainMenuItems }} trigger={["click"]}>
                <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
              </Dropdown>
            </div>
          </div>
        </Dropdown>
      ),
      children: domain.clusters.map((cluster) => ({
        key: cluster.id,
        title: (
          <Dropdown menu={{ items: clusterMenuItems }} trigger={["contextMenu"]}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
              <span>
                <TagOutlined style={{ marginRight: 8, color: "#999" }} />
                {cluster.name}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#999", fontSize: 12 }}>{cluster.tagCount}</span>
                <Dropdown menu={{ items: clusterMenuItems }} trigger={["click"]}>
                  <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              </div>
            </div>
          </Dropdown>
        ),
        isLeaf: true,
      })),
    }));

  const onSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0] as string;
    if (!key) {
      onSelectDomain(null);
      onSelectCluster(null);
      return;
    }

    if (key.startsWith("cluster-")) {
      const domainId = behaviorDomains.find((d) => d.clusters.some((c) => c.id === key))?.id || null;
      onSelectDomain(domainId);
      onSelectCluster(key);
    } else {
      onSelectDomain(key);
      onSelectCluster(null);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #f0f0f0" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #f0f0f0" }}>
        <Input
          placeholder="搜索一级/二级能力..."
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
          selectedKeys={selectedCluster ? [selectedCluster] : selectedDomain ? [selectedDomain] : []}
          onSelect={onSelect}
          showIcon={false}
          blockNode
        />
      </div>
    </div>
  );
}
