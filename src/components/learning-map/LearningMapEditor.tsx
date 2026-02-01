import { useState, useEffect } from "react";
import {
  Drawer,
  Typography,
  Tag,
  Button,
  Input,
  Select,
  Checkbox,
  Empty,
  Tooltip,
  message,
  Divider,
  Badge,
} from "antd";
import {
  ArrowDownOutlined,
  PlusOutlined,
  DeleteOutlined,
  BookOutlined,
  MessageOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  SendOutlined,
  CloseOutlined,
  StopOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface Skill {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface LevelConfig {
  skills: Skill[];
}

interface LearningMapData {
  id: string;
  positionName: string;
  levelRange: { start: number; end: number };
  version: string;
  status: "draft" | "published" | "disabled";
  levels: { [key: string]: LevelConfig };
}

interface SkillConfig {
  learningMethods: string[];
  courses: string[];
  isRequired: boolean;
  verificationMethod: string;
}

// Mock available skills for each level
const mockAvailableSkills: { [key: string]: Skill[] } = {
  P5: [
    { id: "s1", name: "前端基础架构理解", description: "理解前端项目的基础架构设计原则", order: 0 },
    { id: "s2", name: "代码规范与 Review", description: "掌握代码规范制定与代码审查能力", order: 1 },
  ],
  P6: [
    { id: "s3", name: "组件化设计", description: "掌握可复用组件的设计与封装能力", order: 0 },
    { id: "s4", name: "前端测试实践", description: "掌握单元测试、集成测试的编写能力", order: 1 },
    { id: "s5", name: "工程化工具链", description: "理解并能配置 Webpack/Vite 等构建工具", order: 2 },
  ],
  P7: [
    { id: "s6", name: "前端架构设计", description: "能够设计中大型前端项目的整体架构", order: 0 },
    { id: "s7", name: "性能优化", description: "掌握前端性能分析与优化方法", order: 1 },
    { id: "s8", name: "TypeScript 高级应用", description: "熟练运用 TS 泛型、类型体操等高级特性", order: 2 },
    { id: "s9", name: "微前端架构", description: "理解并能实践微前端架构方案", order: 3 },
  ],
  P8: [
    { id: "s10", name: "技术方案设计", description: "能够独立完成复杂业务的技术方案设计", order: 0 },
    { id: "s11", name: "跨团队协作", description: "具备跨团队技术协调与推动能力", order: 1 },
    { id: "s12", name: "技术选型决策", description: "能够进行技术选型并阐述决策依据", order: 2 },
  ],
  P9: [
    { id: "s13", name: "技术战略规划", description: "能够制定团队/产品线的技术发展路线图", order: 0 },
    { id: "s14", name: "技术影响力建设", description: "能够在公司内外建立技术影响力", order: 1 },
  ],
};

// Mock courses
const mockCourses = [
  { id: "c1", name: "前端架构设计实战" },
  { id: "c2", name: "性能优化从入门到精通" },
  { id: "c3", name: "TypeScript 高级编程" },
  { id: "c4", name: "微前端架构实践" },
  { id: "c5", name: "前端工程化体系建设" },
  { id: "c6", name: "React 源码解析" },
  { id: "c7", name: "前端测试最佳实践" },
];

export interface LearningMapEditorProps {
  open: boolean;
  mode: "view" | "edit" | "create";
  mapId?: string;
  initialData?: Partial<LearningMapData>;
  onClose: () => void;
  onSave: (data: LearningMapData) => void;
  onPublish?: (data: LearningMapData) => void;
  onDisable?: (data: LearningMapData) => void;
}

export function LearningMapEditor({
  open,
  mode,
  mapId,
  initialData,
  onClose,
  onSave,
  onPublish,
  onDisable,
}: LearningMapEditorProps) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  // Map data
  const [mapData, setMapData] = useState<LearningMapData>({
    id: mapId || `map-${Date.now()}`,
    positionName: "高级前端工程师",
    levelRange: { start: 5, end: 9 },
    version: "v1.0",
    status: "draft",
    levels: {
      P5: { skills: mockAvailableSkills.P5.slice(0, 2) },
      P6: { skills: mockAvailableSkills.P6.slice(0, 2) },
      P7: { skills: mockAvailableSkills.P7.slice(0, 3) },
      P8: { skills: mockAvailableSkills.P8.slice(0, 2) },
      P9: { skills: mockAvailableSkills.P9.slice(0, 1) },
    },
  });

  // Reset data when opening with different mode/data
  useEffect(() => {
    if (open) {
      if (initialData) {
        setMapData({
          id: initialData.id || `map-${Date.now()}`,
          positionName: initialData.positionName || "新建学习地图",
          levelRange: initialData.levelRange || { start: 5, end: 9 },
          version: initialData.version || "v1.0",
          status: initialData.status || "draft",
          levels: initialData.levels || {
            P5: { skills: mockAvailableSkills.P5.slice(0, 2) },
            P6: { skills: mockAvailableSkills.P6.slice(0, 2) },
            P7: { skills: mockAvailableSkills.P7.slice(0, 3) },
            P8: { skills: mockAvailableSkills.P8.slice(0, 2) },
            P9: { skills: mockAvailableSkills.P9.slice(0, 1) },
          },
        });
      } else if (isCreateMode) {
        // Reset to default for create mode
        setMapData({
          id: `map-${Date.now()}`,
          positionName: "新建学习地图",
          levelRange: { start: 5, end: 9 },
          version: "v1.0",
          status: "draft",
          levels: {},
        });
      }
      setSelectedLevel(5);
      setSelectedSkillId(null);
      setSkillConfigs({});
    }
  }, [open, mode, initialData, isCreateMode]);

  // Current selection state
  const [selectedLevel, setSelectedLevel] = useState<number>(5);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Skill configuration
  const [skillConfigs, setSkillConfigs] = useState<{ [skillId: string]: SkillConfig }>({});

  // All levels from P1 to P15
  const allLevels = Array.from({ length: 15 }, (_, i) => i + 1);

  // Get current level's skills
  const currentLevelKey = `P${selectedLevel}`;
  const currentSkills = mapData.levels[currentLevelKey]?.skills || [];
  const selectedSkill = currentSkills.find((s) => s.id === selectedSkillId);

  // Get or create skill config
  const getSkillConfig = (skillId: string): SkillConfig => {
    return (
      skillConfigs[skillId] || {
        learningMethods: [],
        courses: [],
        isRequired: true,
        verificationMethod: "",
      }
    );
  };

  const updateSkillConfig = (skillId: string, updates: Partial<SkillConfig>) => {
    if (isViewMode) return;
    setSkillConfigs((prev) => ({
      ...prev,
      [skillId]: { ...getSkillConfig(skillId), ...updates },
    }));
  };

  // Check if level is in range
  const isLevelInRange = (level: number) => {
    return level >= mapData.levelRange.start && level <= mapData.levelRange.end;
  };

  // Get level status
  const getLevelStatus = (level: number) => {
    if (!isLevelInRange(level)) return "disabled";
    const levelKey = `P${level}`;
    const skills = mapData.levels[levelKey]?.skills || [];
    if (skills.length === 0) return "empty";
    return "configured";
  };

  // Add skill to current level
  const handleAddSkill = () => {
    if (isViewMode) return;
    const availableSkills = mockAvailableSkills[currentLevelKey] || [];
    const existingIds = currentSkills.map((s) => s.id);
    const newSkill = availableSkills.find((s) => !existingIds.includes(s.id));

    if (newSkill) {
      setMapData((prev) => ({
        ...prev,
        levels: {
          ...prev.levels,
          [currentLevelKey]: {
            skills: [...currentSkills, { ...newSkill, order: currentSkills.length }],
          },
        },
      }));
    } else {
      message.warning("该职级下没有更多可添加的技能");
    }
  };

  // Remove skill from current level
  const handleRemoveSkill = (skillId: string) => {
    if (isViewMode) return;
    setMapData((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [currentLevelKey]: {
          skills: currentSkills
            .filter((s) => s.id !== skillId)
            .map((s, i) => ({ ...s, order: i })),
        },
      },
    }));
    if (selectedSkillId === skillId) {
      setSelectedSkillId(null);
    }
  };

  // Validate before publish
  const validateMap = (): string[] => {
    const errors: string[] = [];

    for (let level = mapData.levelRange.start; level <= mapData.levelRange.end; level++) {
      const levelKey = `P${level}`;
      const skills = mapData.levels[levelKey]?.skills || [];

      if (skills.length === 0) {
        errors.push(`${levelKey} 职级未配置任何技能`);
      }

      skills.forEach((skill) => {
        const config = getSkillConfig(skill.id);
        if (config.learningMethods.length === 0) {
          errors.push(`${levelKey} · ${skill.name}：未配置学习方式`);
        }
      });
    }

    return errors;
  };

  const handlePublish = () => {
    const errors = validateMap();
    if (errors.length > 0) {
      message.error({
        content: (
          <div>
            <div>发布校验失败：</div>
            {errors.slice(0, 3).map((e, i) => (
              <div key={i} style={{ fontSize: 12 }}>
                • {e}
              </div>
            ))}
            {errors.length > 3 && (
              <div style={{ fontSize: 12 }}>还有 {errors.length - 3} 个问题...</div>
            )}
          </div>
        ),
        duration: 5,
      });
      return;
    }

    const updatedData = { ...mapData, status: "published" as const };
    setMapData(updatedData);
    onPublish?.(updatedData);
    message.success("学习地图发布成功");
  };

  const handleDisable = () => {
    const updatedData = { ...mapData, status: "disabled" as const };
    setMapData(updatedData);
    onDisable?.(updatedData);
    message.success("学习地图已停用");
  };

  const handleSave = () => {
    onSave(mapData);
    message.success("学习地图已保存");
  };

  // Calculate position awareness
  const currentSkillIndex = selectedSkill
    ? currentSkills.findIndex((s) => s.id === selectedSkillId) + 1
    : 0;

  // Get drawer title based on mode
  const getDrawerTitle = () => {
    switch (mode) {
      case "view":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeOutlined />
            <span>查看学习地图</span>
          </div>
        );
      case "edit":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EditOutlined />
            <span>编辑学习地图</span>
          </div>
        );
      case "create":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PlusOutlined />
            <span>新建学习地图</span>
          </div>
        );
    }
  };

  // Render footer actions based on mode
  const renderFooterActions = () => {
    if (isViewMode) {
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={onClose}>关闭</Button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={onClose}>取消</Button>
        <Button icon={<SaveOutlined />} onClick={handleSave}>
          保存草稿
        </Button>
        {mapData.status === "published" ? (
          <Button danger icon={<StopOutlined />} onClick={handleDisable}>
            停用
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handlePublish}
          >
            发布
          </Button>
        )}
      </div>
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={getDrawerTitle()}
      width="90%"
      placement="right"
      zIndex={1000}
      footer={renderFooterActions()}
      styles={{
        body: { padding: 0, display: "flex", flexDirection: "column" },
        footer: { display: "flex", justifyContent: "flex-end", padding: "12px 24px" },
      }}
    >
      {/* Top: Global Info Bar */}
      <div
        style={{
          background: "#fafafa",
          borderBottom: "1px solid #e8e8e8",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={5} style={{ margin: 0 }}>
            {mapData.positionName}
          </Title>
          <Tag color="blue">
            P{mapData.levelRange.start} – P{mapData.levelRange.end}
          </Tag>
          <Tag>{mapData.version}</Tag>
          <Badge
            status={
              mapData.status === "draft"
                ? "warning"
                : mapData.status === "published"
                ? "success"
                : "default"
            }
            text={
              mapData.status === "draft"
                ? "草稿"
                : mapData.status === "published"
                ? "已发布"
                : "已停用"
            }
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Level Axis */}
        <div
          style={{
            width: 80,
            background: "#fafafa",
            borderRight: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 0",
            overflowY: "auto",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
            职级轴
          </Text>
          {allLevels
            .slice()
            .reverse()
            .map((level) => {
              const status = getLevelStatus(level);
              const isSelected = level === selectedLevel;
              const inRange = isLevelInRange(level);

              return (
                <div
                  key={level}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Tooltip
                    title={
                      !inRange
                        ? "不在职级范围内"
                        : status === "empty"
                        ? "未配置技能"
                        : "已配置"
                    }
                    placement="right"
                  >
                    <div
                      onClick={() => inRange && setSelectedLevel(level)}
                      style={{
                        width: 48,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                        cursor: inRange ? "pointer" : "not-allowed",
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: isSelected ? 14 : 12,
                        background: isSelected
                          ? "#1677ff"
                          : status === "configured"
                          ? "#e6f4ff"
                          : status === "empty"
                          ? "#fff7e6"
                          : "#f5f5f5",
                        color: isSelected
                          ? "#fff"
                          : !inRange
                          ? "#bfbfbf"
                          : status === "empty"
                          ? "#d46b08"
                          : "#1677ff",
                        border: isSelected
                          ? "none"
                          : inRange
                          ? "1px solid #d9d9d9"
                          : "1px dashed #d9d9d9",
                        transition: "all 0.2s",
                      }}
                    >
                      P{level}
                    </div>
                  </Tooltip>
                  {level > 1 && (
                    <div
                      style={{
                        width: 1,
                        height: 8,
                        background: inRange ? "#d9d9d9" : "#f0f0f0",
                      }}
                    />
                  )}
                </div>
              );
            })}
        </div>

        {/* Middle: Learning Path */}
        <div
          style={{
            flex: 1,
            maxWidth: 400,
            background: "#fff",
            borderRight: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Path Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Title level={5} style={{ margin: 0 }}>
                P{selectedLevel} 职级 · 学习路径
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                共 {currentSkills.length} 个技能节点
              </Text>
            </div>
            {!isViewMode && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddSkill}
              >
                添加技能
              </Button>
            )}
          </div>

          {/* Path Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
            }}
          >
            {currentSkills.length === 0 ? (
              <Empty
                description={
                  <span>
                    该职级暂无技能配置
                    <br />
                    {!isViewMode && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        点击上方"添加技能"开始配置学习路径
                      </Text>
                    )}
                  </span>
                }
                style={{ marginTop: 60 }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {currentSkills.map((skill, index) => {
                  const isSelected = selectedSkillId === skill.id;
                  const config = getSkillConfig(skill.id);
                  const isConfigured = config.learningMethods.length > 0;

                  return (
                    <div key={skill.id}>
                      {/* Skill Node */}
                      <div
                        onClick={() => setSelectedSkillId(skill.id)}
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        {/* Order Number */}
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: isSelected
                              ? "#1677ff"
                              : isConfigured
                              ? "#52c41a"
                              : "#faad14",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* Skill Card */}
                        <div
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            background: isSelected ? "#e6f4ff" : "#fafafa",
                            borderRadius: 8,
                            border: isSelected
                              ? "2px solid #1677ff"
                              : "1px solid #f0f0f0",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text strong>{skill.name}</Text>
                            <div style={{ display: "flex", gap: 4 }}>
                              {isConfigured && (
                                <CheckCircleOutlined
                                  style={{ color: "#52c41a", fontSize: 14 }}
                                />
                              )}
                              {!isViewMode && (
                                <Tooltip title="删除">
                                  <DeleteOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      fontSize: 14,
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSkill(skill.id);
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block", marginTop: 4 }}
                          >
                            {skill.description}
                          </Text>
                          {config.learningMethods.length > 0 && (
                            <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                              {config.learningMethods.map((m) => (
                                <Tag key={m} style={{ fontSize: 10, margin: 0 }}>
                                  {m === "course"
                                    ? "课程"
                                    : m === "practice"
                                    ? "陪练"
                                    : "实战"}
                                </Tag>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow Connector */}
                      {index < currentSkills.length - 1 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "8px 0",
                            marginLeft: 16,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 2,
                                height: 16,
                                background: "#d9d9d9",
                              }}
                            />
                            <ArrowDownOutlined
                              style={{ color: "#d9d9d9", fontSize: 12 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Skill Configuration Panel */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {selectedSkill ? (
            <>
              {/* Position Awareness */}
              <div
                style={{
                  padding: "12px 24px",
                  background: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Text style={{ color: "#8c8c8c", fontSize: 13 }}>
                  当前位置：
                  <Text strong style={{ color: "#1677ff" }}>
                    P{selectedLevel}
                  </Text>
                  {" · "}第{" "}
                  <Text strong style={{ color: "#1677ff" }}>
                    {currentSkillIndex}
                  </Text>{" "}
                  个技能 / 共 {currentSkills.length} 个技能
                </Text>
              </div>

              {/* Config Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {/* Skill Info */}
                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    技能信息
                  </Text>
                  <Title level={5} style={{ margin: "8px 0 4px" }}>
                    {selectedSkill.name}
                  </Title>
                  <Paragraph
                    type="secondary"
                    style={{ marginBottom: 0, fontSize: 13 }}
                  >
                    {selectedSkill.description}
                  </Paragraph>
                </div>

                <Divider style={{ margin: "16px 0" }} />

                {/* Learning Methods */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: "block", marginBottom: 12 }}>
                    学习方式 <span style={{ color: "#ff4d4f" }}>*</span>
                  </Text>
                  <Checkbox.Group
                    value={getSkillConfig(selectedSkill.id).learningMethods}
                    onChange={(values) =>
                      updateSkillConfig(selectedSkill.id, {
                        learningMethods: values as string[],
                      })
                    }
                    disabled={isViewMode}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Checkbox value="course">
                        <BookOutlined style={{ marginRight: 8 }} />
                        在线课程
                      </Checkbox>
                      <Checkbox value="practice">
                        <MessageOutlined style={{ marginRight: 8 }} />
                        AI 陪练
                      </Checkbox>
                      <Checkbox value="project">
                        <ProjectOutlined style={{ marginRight: 8 }} />
                        实战项目
                      </Checkbox>
                    </div>
                  </Checkbox.Group>
                </div>

                {/* Courses (only when course is selected) */}
                {getSkillConfig(selectedSkill.id).learningMethods.includes("course") && (
                  <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ display: "block", marginBottom: 12 }}>
                      推荐课程
                    </Text>
                    <Select
                      mode="multiple"
                      placeholder="搜索并选择课程..."
                      style={{ width: "100%" }}
                      value={getSkillConfig(selectedSkill.id).courses}
                      onChange={(values) =>
                        updateSkillConfig(selectedSkill.id, { courses: values })
                      }
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={mockCourses.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      disabled={isViewMode}
                    />
                  </div>
                )}

                <Divider style={{ margin: "16px 0" }} />

                {/* Is Required */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: "block", marginBottom: 12 }}>
                    是否必修
                  </Text>
                  <Select
                    value={getSkillConfig(selectedSkill.id).isRequired}
                    onChange={(value) =>
                      updateSkillConfig(selectedSkill.id, { isRequired: value })
                    }
                    style={{ width: 200 }}
                    options={[
                      { value: true, label: "是（必修）" },
                      { value: false, label: "否（选修）" },
                    ]}
                    disabled={isViewMode}
                  />
                </div>

                {/* Verification Method */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: "block", marginBottom: 12 }}>
                    验收方式
                  </Text>
                  <Select
                    value={getSkillConfig(selectedSkill.id).verificationMethod}
                    onChange={(value) =>
                      updateSkillConfig(selectedSkill.id, {
                        verificationMethod: value,
                      })
                    }
                    style={{ width: "100%" }}
                    placeholder="选择验收方式"
                    options={[
                      { value: "exam", label: "在线测评通过" },
                      { value: "practice", label: "AI 陪练达标" },
                      { value: "project", label: "实战项目完成" },
                    ]}
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    点击左侧学习路径中的技能节点
                    <br />
                    {isViewMode ? "查看详细配置" : "进行详细配置"}
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
