import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Select, Table, Tag, Button, Drawer, Avatar, Tabs, Progress, Collapse, Statistic, Row, Col, Input } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

// Mock practice plans for filter
const mockPlans = [
  { id: "p1", title: "供应链产品-电商仓-服饰面试详情" },
  { id: "p2", title: "客户拜访话术训练" },
  { id: "p3", title: "新员工入职培训-产品知识" },
];

// Mock report list data
const mockReportData = [
  { id: "1", seq: 1, userName: "王占林", erp: "wangzhanlin1", sessionId: "LEPR20345426443669955 2", inviteTime: "2026-03-10 09:20:38", duration: null, practiceStatus: "练习中", resultStatus: "--", score: null, summary: null },
  { id: "2", seq: 2, userName: "傅鹏涛", erp: "fupengtao3", sessionId: "LEPR20345396465343528 6", inviteTime: "2026-03-16 09:18:44", duration: null, practiceStatus: "练习中", resultStatus: "--", score: null, summary: null },
  { id: "3", seq: 3, userName: "唐宁远", erp: "tangningyuan.110", sessionId: "LEPR20345349438179287 4", inviteTime: "2026-03-06 15:21:41", duration: 12, practiceStatus: "练习完成", resultStatus: "通过", score: 60, summary: "销售员具备基础的客户沟通..." },
  { id: "4", seq: 4, userName: "王亚东", erp: "wangyadong87", sessionId: "LEPR20345329014434037 6", inviteTime: "2026-03-16 09:20:38", duration: null, practiceStatus: "练习中", resultStatus: "--", score: null, summary: null },
  { id: "5", seq: 5, userName: "杨宇翔(Lip)", erp: "yangyuxiang.12", sessionId: "LEPR20345323526608035 4", inviteTime: "2025-12-19 10:02:42", duration: null, practiceStatus: "练习中", resultStatus: "--", score: null, summary: null },
  { id: "6", seq: 6, userName: "杨家兴", erp: "yangjiaxing31", sessionId: "LEPR20345023730801049 0", inviteTime: "2026-03-16 09:19:43", duration: null, practiceStatus: "练习中", resultStatus: "--", score: null, summary: null },
  { id: "7", seq: 7, userName: "李梦(Lion)", erp: "limeng318", sessionId: "LEPR20344860493396705 8", inviteTime: "2026-03-16 09:18:44", duration: 8, practiceStatus: "练习完成", resultStatus: "通过", score: 65, summary: "练习人基本达成销售流程的..." },
  { id: "8", seq: 8, userName: "朱亦成", erp: "zhuyicheng.9", sessionId: "LEPR20344736970766417 2", inviteTime: "2026-03-13 09:58:50", duration: 7, practiceStatus: "练习完成", resultStatus: "通过", score: 80, summary: "该销售员具备良好的客户导..." },
  { id: "9", seq: 9, userName: "侯泽菊", erp: "houzeju.1", sessionId: "LEPR20344726104752168 6", inviteTime: "2026-03-13 09:44:47", duration: null, practiceStatus: "练习中", resultStatus: "--", score: null, summary: null },
  { id: "10", seq: 10, userName: "朱亦成", erp: "zhuyicheng.9", sessionId: "LEPR20344698871638261 6", inviteTime: "2026-03-13 09:58:50", duration: 8, practiceStatus: "练习完成", resultStatus: "通过", score: 65, summary: "该销售员具备基础的客户沟..." },
];

// Mock detail data
const mockDetailData = {
  userName: "唐宁远",
  position: "供应链产品-电商仓-服饰",
  trainingDate: "2026-03-19 15:09:48",
  duration: "11分19秒",
  score: 60,
  overallReview: "销售员具备基础的客户关系维护与产品认知能力，能够从制度培训和客户需求出发进行话语体系搭建，但整体表现缺乏对客户的深入洞察，其整体表达相对松散，技巧方面显得生硬，未能有效渗透和推进客户认知体系。未达练习目标。",
  strengths: [
    { name: "沟通能力", detail: "具备基本的话题交际能力，与客户保持了比较流畅的交流，在分享渠道运营经验上表现良好" },
    { name: "产品认知能力", detail: "能够基本阐述产品信息和流程，显示出对相关业务的基础了解" },
  ],
  weaknesses: [
    { name: "时光回放", detail: "竹光顾虑" },
    { name: "竹光顾虑", detail: "竹光顾虑" },
  ],
  segments: [
    {
      id: "seg1",
      label: "片段1",
      canOptimize: true,
      aiLine: "来了啊，唐宁远。昨晚直播间那事真是头疼，爆款连衣裙针音爆爆了，结果仓库系统显示缺货，实际天猫仓那边还有，这库存数据得同步才行。",
      userLine: "嗯，您这边的问题了解了。呢，首先呢就是天猫抖音多呢，平台库存不能同步。二是大促期期间，这个旺季拢收跟不上。三就是咱们的服饰烫贴标退费整理呢，现在的物流是做不了影响咱们二次销售，对吗？然后我们这边京东入仓以后...",
      problemAnalysis: "练习人基本回应了多平台库存同步、旺季拢收保障和服饰二次加工三大核心诉求，但表达冗长（如'呢'重复），缺乏结构化呈现；未明确说明ERP对接方式、拢收频次承诺、烫贴标收费标准等客户关心的细节，也未主动引导价格测算，错失推进签约的机会。",
      suggestions: "1. 使用清晰结构分点回应：库存同步→运力保障→增值服务；2. 补充关键细节：如'支持API实时同步各平台库存''大促期每日4次固定拢收''烫贴5元/件、贴标2元/件'；3. 主动追问：'您看是否需要我先出一份基于您月均退单量的报价测算？'以推动下一步。",
    },
    {
      id: "seg2",
      label: "片段2",
      canOptimize: true,
      aiLine: "嗯，你说的这些肯定不错，不过，我还多多个水库荷叶储存流程资料？另外科技外包帮助出总告总",
      userLine: "哦，我们这里还有一些补充资料要跟您分享一下...",
      problemAnalysis: "缺少具体的数据和方案说明，回应较模糊，未展示专业度。",
      suggestions: "1. 提前准备好案例和数据文件；2. 用数据说话：如'上月我们处理了3万件退货，准确率99.8%'。",
    },
    {
      id: "seg3",
      label: "片段3",
      canOptimize: false,
      aiLine: "嗯，上门约谈可以，不过我先对你报的价格有一些模块要确认，这几块钱下来其实很多...",
      userLine: "我们确认一下价格方案吧，基本上维持之前谈的标准...",
      problemAnalysis: "",
      suggestions: "",
    },
  ],
  radarData: {
    dimensions: ["沟通能力", "产品知识", "异议处理", "客户思维", "促单能力"],
    scores: [70, 55, 45, 60, 50],
  },
};

export default function PracticeReports() {
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(mockPlans[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const filteredData = mockReportData.filter(d =>
    !searchQuery || d.userName.includes(searchQuery) || d.erp.includes(searchQuery)
  );

  const columns: ColumnsType<any> = [
    { title: "序号", dataIndex: "seq", key: "seq", width: 60, align: "center" },
    { title: "学员", dataIndex: "userName", key: "userName", width: 100 },
    { title: "erp", dataIndex: "erp", key: "erp", width: 140 },
    { title: "SessionId", dataIndex: "sessionId", key: "sessionId", width: 180, ellipsis: true },
    { title: "邀请时间", dataIndex: "inviteTime", key: "inviteTime", width: 160 },
    {
      title: "有效练习时长(分钟)",
      dataIndex: "duration",
      key: "duration",
      width: 140,
      align: "center",
      render: (v: number | null) => v ?? "-",
    },
    {
      title: "练习状态",
      dataIndex: "practiceStatus",
      key: "practiceStatus",
      width: 100,
      render: (v: string) => <Tag color={v === "练习完成" ? "green" : "blue"}>{v}</Tag>,
    },
    {
      title: "结果状态",
      dataIndex: "resultStatus",
      key: "resultStatus",
      width: 80,
      align: "center",
      render: (v: string) => v === "通过" ? <Tag color="success">通过</Tag> : <span>{v}</span>,
    },
    {
      title: "得分",
      dataIndex: "score",
      key: "score",
      width: 60,
      align: "center",
      render: (v: number | null) => v ?? "-",
    },
    {
      title: "结果",
      dataIndex: "summary",
      key: "summary",
      width: 200,
      ellipsis: true,
      render: (v: string | null) => v || "暂无内容",
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      align: "center",
      render: (_: any, record: any) =>
        record.practiceStatus === "练习完成" ? (
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedReport(record); setDetailOpen(true); }}>
            查看练习报告
          </Button>
        ) : (
          <span style={{ color: "#999" }}>暂无内容</span>
        ),
    },
  ];

  const selectedPlanTitle = mockPlans.find(p => p.id === selectedPlan)?.title || "";

  return (
    <DashboardLayout title="练习报告" description="查看学员练习情况与详细报告">
      <div className="space-y-4">
        {/* Filter bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>练习计划：</span>
          <Select
            value={selectedPlan}
            onChange={setSelectedPlan}
            style={{ width: 320 }}
            options={mockPlans.map(p => ({ value: p.id, label: p.title }))}
            placeholder="选择练习计划"
          />
          <Input
            placeholder="搜索学员/ERP"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </div>

        {/* Breadcrumb & title */}
        <div>
          <div style={{ fontSize: 12, color: "#999" }}>练习数据 / 练习详情</div>
          <h3 style={{ margin: "4px 0" }}>{selectedPlanTitle}</h3>
          <div style={{ color: "#999", fontSize: 13 }}>查看 {selectedPlanTitle} 岗位下所有候选人的面试详情</div>
        </div>

        {/* Table */}
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSize: 10,
            }}
            scroll={{ x: 1400 }}
          />
        </Card>
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width="70vw"
        zIndex={1000}
      >
        <ReportDetail data={mockDetailData} />
      </Drawer>
    </DashboardLayout>
  );
}

function ReportDetail({ data }: { data: typeof mockDetailData }) {
  const tabItems = [
    {
      key: "overall",
      label: "综合评价",
      children: (
        <div className="space-y-6">
          <p style={{ lineHeight: 1.8 }}>{data.overallReview}</p>

          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title={<span>✅ 优势维度</span>} style={{ borderColor: "#52c41a" }}>
                {data.strengths.map((s, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: "#52c41a" }}>{s.name}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{s.detail}</div>
                  </div>
                ))}
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title={<span>⚠️ 改善维度</span>} style={{ borderColor: "#faad14" }}>
                {data.weaknesses.map((w, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: "#faad14" }}>{w.name}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{w.detail}</div>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "skills",
      label: "能力素质",
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>能力素质 </span>
            <span>得分：{data.score} <span style={{ color: "#999" }}>/100</span></span>
          </div>
          <Row gutter={16}>
            {data.radarData.dimensions.map((dim, i) => (
              <Col span={8} key={dim} style={{ marginBottom: 12 }}>
                <Card size="small">
                  <Statistic title={dim} value={data.radarData.scores[i]} suffix="/ 100" />
                  <Progress percent={data.radarData.scores[i]} size="small" strokeColor={data.radarData.scores[i] >= 60 ? "#52c41a" : "#faad14"} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
    {
      key: "conversation",
      label: "会话记录分析",
      children: (
        <div>
          <Collapse
            accordion
            defaultActiveKey={["seg1"]}
            items={data.segments.map(seg => ({
              key: seg.id,
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{seg.label}</span>
                  {seg.canOptimize && <Tag color="orange">💡 可以优化</Tag>}
                  {!seg.canOptimize && <Tag color="green">✅ 可以继续</Tag>}
                </div>
              ),
              children: (
                <div className="space-y-4">
                  <div style={{ padding: 12, background: "#fff7e6", borderRadius: 8, borderLeft: "3px solid #fa8c16" }}>
                    <div style={{ fontWeight: 600, color: "#fa8c16", marginBottom: 4 }}>AI 陪练</div>
                    <div>{seg.aiLine}</div>
                  </div>
                  <div style={{ padding: 12, background: "#f6ffed", borderRadius: 8, borderLeft: "3px solid #52c41a" }}>
                    <div style={{ fontWeight: 600, color: "#52c41a", marginBottom: 4 }}>我</div>
                    <div>{seg.userLine}</div>
                  </div>
                  {seg.problemAnalysis && (
                    <div style={{ padding: 12, background: "#fff2e8", borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>问题分析：</div>
                      <div style={{ color: "#666" }}>{seg.problemAnalysis}</div>
                    </div>
                  )}
                  {seg.suggestions && (
                    <div style={{ padding: 12, background: "#e6f7ff", borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>改进建议：</div>
                      <div style={{ color: "#666" }}>{seg.suggestions}</div>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, background: "#fff7e6", padding: 20, borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Avatar size={64} style={{ backgroundColor: "#fa8c16" }}>{data.userName.slice(0, 2)}</Avatar>
          <div>
            <h2 style={{ margin: 0 }}>{data.userName}</h2>
            <div style={{ color: "#666", fontSize: 13 }}>
              培训岗位：{data.position} &nbsp;|&nbsp; 培训日期：{data.trainingDate}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#999" }}>用时：{data.duration} &nbsp; 综合得分：</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#fa8c16" }}>{data.score}分</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabItems} />
    </div>
  );
}
