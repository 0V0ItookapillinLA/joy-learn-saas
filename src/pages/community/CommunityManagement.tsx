import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Table, Tag, Button, Input, Space, Drawer, Avatar, Statistic, Row, Col, Popconfirm, Tabs, Collapse, App } from "antd";
import { SearchOutlined, DeleteOutlined, EyeOutlined, LikeOutlined, StarOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const mockCommunityPosts = [
  { id: "1", userName: "唐宁远", avatar: "", practiceTitle: "供应链产品-电商仓-服饰面试", practiceType: "固定对话", score: 60, publishTime: "2026-03-19 15:30:00", likes: 23, favorites: 8, status: "published" },
  { id: "2", userName: "李梦(Lion)", avatar: "", practiceTitle: "客户拜访话术训练", practiceType: "自由对话", score: 85, publishTime: "2026-03-18 10:20:00", likes: 45, favorites: 12, status: "published" },
  { id: "3", userName: "朱亦成", avatar: "", practiceTitle: "新员工入职-产品知识考核", practiceType: "固定剧本", score: 92, publishTime: "2026-03-17 14:15:00", likes: 67, favorites: 21, status: "published" },
  { id: "4", userName: "王亚东", avatar: "", practiceTitle: "售后服务沟通演练", practiceType: "自由对话", score: 78, publishTime: "2026-03-16 09:45:00", likes: 15, favorites: 5, status: "published" },
  { id: "5", userName: "杨宇翔(Lip)", avatar: "", practiceTitle: "供应链产品-电商仓-服饰面试", practiceType: "固定对话", score: 71, publishTime: "2026-03-15 16:30:00", likes: 34, favorites: 9, status: "published" },
];

const mockPracticeInfo = {
  goal: "通过模拟客户拜访场景，训练销售人员在供应链产品推介中的沟通能力、需求分析能力和方案呈现能力，要求能够针对客户痛点提供专业解决方案。",
  scenario: "你是京东物流的一名销售经理，正在拜访一位服饰电商客户。客户目前使用多平台仓储，面临库存同步、大促期间拢收效率低、服饰二次加工（烫贴标）等痛点。你需要了解客户需求，并提供京东物流的解决方案。",
};

const mockConversation = [
  { role: "ai", content: "来了啊，唐宁远。昨晚直播间那事真是头疼，爆款连衣裙针音爆爆了，结果仓库系统显示缺货，实际天猫仓那边还有，这库存数据得同步才行。" },
  { role: "user", content: "嗯，您这边的问题了解了。首先呢就是天猫抖音多平台库存不能同步。二是大促期间旺季拢收跟不上。三就是咱们的服饰烫贴标退费整理呢..." },
  { role: "ai", content: "嗯你说的有道理，那你们怎么保证多平台的数据同步呢？具体说说方案？" },
  { role: "user", content: "好的，我们是通过交叉WMS系统对接到咱们的ERP系统上面，做到实时库存同步..." },
];

export default function CommunityManagement() {
  const { message } = App.useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const filteredPosts = mockCommunityPosts.filter(p =>
    !searchQuery || p.userName.includes(searchQuery) || p.practiceTitle.includes(searchQuery)
  );

  const handleDelete = (id: string) => {
    message.success("已删除该公开记录");
  };

  const handleViewDetail = (record: any) => {
    setSelectedPost(record);
    setDetailOpen(true);
  };

  const totalPosts = mockCommunityPosts.length;
  const totalLikes = mockCommunityPosts.reduce((s, p) => s + p.likes, 0);
  const totalFavorites = mockCommunityPosts.reduce((s, p) => s + p.favorites, 0);

  const columns: ColumnsType<any> = [
    {
      title: "发布用户",
      dataIndex: "userName",
      key: "userName",
      width: 120,
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" style={{ backgroundColor: "#1677ff" }}>{text.slice(0, 1)}</Avatar>
          <span>{text}</span>
        </div>
      ),
    },
    { title: "练习标题", dataIndex: "practiceTitle", key: "practiceTitle", ellipsis: true },
    {
      title: "练习类型",
      dataIndex: "practiceType",
      key: "practiceType",
      width: 100,
      render: (v: string) => {
        const colors: Record<string, string> = { "固定对话": "blue", "自由对话": "green", "固定剧本": "purple" };
        return <Tag color={colors[v] || "default"}>{v}</Tag>;
      },
    },
    {
      title: "得分",
      dataIndex: "score",
      key: "score",
      width: 80,
      align: "center",
      render: (v: number) => <span style={{ fontWeight: 600, color: v >= 80 ? "#52c41a" : v >= 60 ? "#faad14" : "#ff4d4f" }}>{v}</span>,
    },
    { title: "发布时间", dataIndex: "publishTime", key: "publishTime", width: 160 },
    {
      title: "点赞数",
      dataIndex: "likes",
      key: "likes",
      width: 80,
      align: "center",
      render: (v: number) => <span><LikeOutlined style={{ color: "#1677ff", marginRight: 4 }} />{v}</span>,
    },
    {
      title: "收藏数",
      dataIndex: "favorites",
      key: "favorites",
      width: 80,
      align: "center",
      render: (v: number) => <span><StarOutlined style={{ color: "#faad14", marginRight: 4 }} />{v}</span>,
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      align: "center",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          <Popconfirm title="确定删除该公开记录？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="公开社区管理" description="管理用户公开发布的练习记录">
      <div className="space-y-4">
        {/* Stats */}
        <Row gutter={16}>
          <Col span={8}><Card><Statistic title="公开记录总数" value={totalPosts} /></Card></Col>
          <Col span={8}><Card><Statistic title="总点赞数" value={totalLikes} prefix={<LikeOutlined />} valueStyle={{ color: "#1677ff" }} /></Card></Col>
          <Col span={8}><Card><Statistic title="总收藏数" value={totalFavorites} prefix={<StarOutlined />} valueStyle={{ color: "#faad14" }} /></Card></Col>
        </Row>

        {/* Search */}
        <Input
          placeholder="搜索用户名或练习标题..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />

        {/* Table */}
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredPosts}
            rowKey="id"
            pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
          />
        </Card>
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={`练习详情 - ${selectedPost?.userName || ""}`}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width="60vw"
        zIndex={1000}
      >
        {selectedPost && (
          <div className="space-y-6">
            {/* Header info */}
            <Card>
              <Row gutter={16}>
                <Col span={6}><Statistic title="得分" value={selectedPost.score} suffix="/ 100" /></Col>
                <Col span={6}><Statistic title="点赞" value={selectedPost.likes} prefix={<LikeOutlined />} /></Col>
                <Col span={6}><Statistic title="收藏" value={selectedPost.favorites} prefix={<StarOutlined />} /></Col>
                <Col span={6}><Statistic title="练习类型" value={selectedPost.practiceType} /></Col>
              </Row>
            </Card>

            {/* Conversation */}
            <Card title="对话记录">
              <div className="space-y-4">
                {mockConversation.map((msg, i) => (
                  <div key={i} style={{ padding: 12, background: msg.role === "ai" ? "#fff7e6" : "#f6ffed", borderRadius: 8, borderLeft: `3px solid ${msg.role === "ai" ? "#fa8c16" : "#52c41a"}` }}>
                    <div style={{ fontWeight: 600, color: msg.role === "ai" ? "#fa8c16" : "#52c41a", marginBottom: 4 }}>
                      {msg.role === "ai" ? "AI 陪练" : "学员"}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
