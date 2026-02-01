import { useState, useMemo } from "react";
import { Modal, Input, Tree, Empty, Tag, Checkbox, Button, Typography } from "antd";
import { SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";

const { Text } = Typography;

interface Skill {
  id: string;
  name: string;
  description: string;
  level?: string;
  category?: string;
}

interface SkillSelectModalProps {
  open: boolean;
  positionName: string;
  currentLevel: string;
  existingSkillIds: string[];
  onClose: () => void;
  onSelect: (skills: Skill[]) => void;
}

// Mock skills by position - in real app, this would come from the tag library
const mockPositionSkills: { [positionName: string]: { [level: string]: Skill[] } } = {
  "客户销售": {
    P1: [
      { id: "cs1-1", name: "公司产品知识", description: "熟悉公司全线产品及服务内容", level: "P1", category: "基础技能" },
      { id: "cs1-2", name: "客户沟通基础", description: "掌握基本的客户沟通技巧和话术", level: "P1", category: "基础技能" },
      { id: "cs1-3", name: "CRM 系统操作", description: "能够熟练使用公司CRM系统录入客户信息", level: "P1", category: "工具技能" },
      { id: "cs1-4", name: "商务礼仪规范", description: "掌握基本的商务礼仪和职业形象", level: "P1", category: "基础技能" },
    ],
    P2: [
      { id: "cs2-1", name: "需求挖掘技巧", description: "通过提问发现客户潜在需求", level: "P2", category: "销售技能" },
      { id: "cs2-2", name: "报价方案制作", description: "根据客户需求制作合理的报价方案", level: "P2", category: "销售技能" },
      { id: "cs2-3", name: "竞品分析能力", description: "了解主要竞争对手的产品和定价策略", level: "P2", category: "市场技能" },
      { id: "cs2-4", name: "客户跟进管理", description: "有效管理客户跟进节奏和记录", level: "P2", category: "销售技能" },
    ],
    P3: [
      { id: "cs3-1", name: "商务谈判技巧", description: "能够独立完成中小客户的商务谈判", level: "P3", category: "销售技能" },
      { id: "cs3-2", name: "客户关系维护", description: "建立并维护良好的客户关系", level: "P3", category: "关系管理" },
      { id: "cs3-3", name: "异议处理能力", description: "有效处理客户的价格和服务异议", level: "P3", category: "销售技能" },
    ],
    P4: [
      { id: "cs4-1", name: "大客户开发", description: "具备开发和维护大客户的能力", level: "P4", category: "高级销售" },
      { id: "cs4-2", name: "解决方案设计", description: "为客户设计定制化解决方案", level: "P4", category: "高级销售" },
    ],
    P5: [
      { id: "cs5-1", name: "区域市场分析", description: "能够分析区域市场特点和竞争格局", level: "P5", category: "市场技能" },
      { id: "cs5-2", name: "销售策略制定", description: "根据市场情况制定有效的销售策略", level: "P5", category: "策略管理" },
      { id: "cs5-3", name: "关键客户管理", description: "管理和维护区域内的关键客户资源", level: "P5", category: "关系管理" },
    ],
    P6: [
      { id: "cs6-1", name: "团队业绩管理", description: "设定团队目标并追踪业绩达成", level: "P6", category: "管理技能" },
      { id: "cs6-2", name: "销售培训辅导", description: "能够培训和辅导初级销售人员", level: "P6", category: "管理技能" },
    ],
    P7: [
      { id: "cs7-1", name: "战略客户开发", description: "开发和维护战略级大客户", level: "P7", category: "高级销售" },
      { id: "cs7-2", name: "行业解决方案", description: "针对特定行业设计专业方案", level: "P7", category: "高级销售" },
      { id: "cs7-3", name: "销售流程优化", description: "优化销售流程提升团队效率", level: "P7", category: "管理技能" },
    ],
    P8: [
      { id: "cs8-1", name: "销售战略规划", description: "制定区域或产品线的年度销售战略", level: "P8", category: "策略管理" },
      { id: "cs8-2", name: "高管关系建立", description: "与客户高层建立战略合作关系", level: "P8", category: "关系管理" },
    ],
    P9: [
      { id: "cs9-1", name: "商业模式创新", description: "探索新的销售模式和合作方式", level: "P9", category: "创新管理" },
      { id: "cs9-2", name: "团队建设管理", description: "建设高绩效销售团队", level: "P9", category: "管理技能" },
    ],
    P10: [
      { id: "cs10-1", name: "市场趋势洞察", description: "把握行业发展趋势和机会", level: "P10", category: "战略技能" },
      { id: "cs10-2", name: "业务增长策略", description: "制定可持续的业务增长策略", level: "P10", category: "战略技能" },
    ],
  },
  "客服顾问": {
    P1: [
      { id: "sa1-1", name: "服务礼仪规范", description: "掌握客服接待的基本礼仪和规范", level: "P1", category: "基础技能" },
      { id: "sa1-2", name: "系统操作能力", description: "熟练操作客服工单和知识库系统", level: "P1", category: "工具技能" },
      { id: "sa1-3", name: "产品基础知识", description: "了解公司产品和服务的基本信息", level: "P1", category: "基础技能" },
    ],
    P2: [
      { id: "sa2-1", name: "问题诊断能力", description: "快速准确诊断客户问题的根因", level: "P2", category: "服务技能" },
      { id: "sa2-2", name: "话术应用技巧", description: "灵活运用标准话术解决常见问题", level: "P2", category: "服务技能" },
      { id: "sa2-3", name: "情绪管理能力", description: "保持专业态度，管理自身情绪", level: "P2", category: "软技能" },
    ],
    P3: [
      { id: "sa3-1", name: "投诉处理能力", description: "妥善处理客户投诉并转化满意", level: "P3", category: "服务技能" },
      { id: "sa3-2", name: "复杂问题升级", description: "识别并正确升级复杂问题", level: "P3", category: "服务技能" },
    ],
    P4: [
      { id: "sa4-1", name: "服务质量监控", description: "监控团队服务质量并提出改进", level: "P4", category: "管理技能" },
      { id: "sa4-2", name: "知识库维护", description: "维护和更新客服知识库内容", level: "P4", category: "管理技能" },
    ],
    P5: [
      { id: "sa5-1", name: "新人带教辅导", description: "能够辅导新入职客服人员", level: "P5", category: "管理技能" },
      { id: "sa5-2", name: "话术脚本编写", description: "编写标准化的客服话术脚本", level: "P5", category: "专业技能" },
    ],
  },
  "药房药师": {
    P1: [
      { id: "ph1-1", name: "药品分类知识", description: "掌握处方药与非处方药的分类标准", level: "P1", category: "专业知识" },
      { id: "ph1-2", name: "药品陈列规范", description: "按规范进行药品陈列和库存管理", level: "P1", category: "操作技能" },
      { id: "ph1-3", name: "收银操作流程", description: "熟练掌握收银和发票开具流程", level: "P1", category: "操作技能" },
    ],
    P2: [
      { id: "ph2-1", name: "常见病症咨询", description: "能够回答常见病症的用药咨询", level: "P2", category: "专业知识" },
      { id: "ph2-2", name: "药品相互作用", description: "了解常见药品间的相互作用", level: "P2", category: "专业知识" },
    ],
    P3: [
      { id: "ph3-1", name: "处方审核能力", description: "能够初步审核处方的合理性", level: "P3", category: "专业技能" },
      { id: "ph3-2", name: "特殊药品管理", description: "掌握特殊管理药品的销售规范", level: "P3", category: "合规管理" },
      { id: "ph3-3", name: "不良反应上报", description: "识别并上报药品不良反应", level: "P3", category: "合规管理" },
    ],
  },
};

// Default skills for positions without specific data
const defaultSkills: { [level: string]: Skill[] } = {
  P1: [
    { id: "def1-1", name: "岗位基础知识", description: "了解岗位职责和工作流程", level: "P1", category: "基础技能" },
    { id: "def1-2", name: "工具使用能力", description: "熟练使用岗位相关工具和系统", level: "P1", category: "工具技能" },
  ],
  P2: [
    { id: "def2-1", name: "问题解决能力", description: "能够独立解决常见问题", level: "P2", category: "核心技能" },
    { id: "def2-2", name: "沟通协作能力", description: "与同事和客户有效沟通", level: "P2", category: "软技能" },
  ],
  P3: [
    { id: "def3-1", name: "专业技能提升", description: "深入掌握专业领域知识", level: "P3", category: "专业技能" },
  ],
};

export function SkillSelectModal({
  open,
  positionName,
  currentLevel,
  existingSkillIds,
  onClose,
  onSelect,
}: SkillSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Get available skills for this position and level
  const availableSkills = useMemo(() => {
    const positionSkills = mockPositionSkills[positionName];
    if (positionSkills && positionSkills[currentLevel]) {
      return positionSkills[currentLevel];
    }
    return defaultSkills[currentLevel] || [];
  }, [positionName, currentLevel]);

  // Filter out already added skills and apply search
  const filteredSkills = useMemo(() => {
    return availableSkills
      .filter((skill) => !existingSkillIds.includes(skill.id))
      .filter((skill) => 
        searchQuery === "" ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [availableSkills, existingSkillIds, searchQuery]);

  // Group skills by category
  const groupedSkills = useMemo(() => {
    const groups: { [category: string]: Skill[] } = {};
    filteredSkills.forEach((skill) => {
      const category = skill.category || "其他";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
    });
    return groups;
  }, [filteredSkills]);

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSkillIds.length === filteredSkills.length) {
      setSelectedSkillIds([]);
    } else {
      setSelectedSkillIds(filteredSkills.map((s) => s.id));
    }
  };

  const handleConfirm = () => {
    const selectedSkills = availableSkills.filter((s) =>
      selectedSkillIds.includes(s.id)
    );
    onSelect(selectedSkills);
    setSelectedSkillIds([]);
    setSearchQuery("");
    onClose();
  };

  const handleCancel = () => {
    setSelectedSkillIds([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      title={
        <div>
          <div>添加技能</div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {positionName} · {currentLevel} 职级可选技能
          </Text>
        </div>
      }
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText={`添加 ${selectedSkillIds.length} 个技能`}
      okButtonProps={{ disabled: selectedSkillIds.length === 0 }}
      cancelText="取消"
      width={600}
      zIndex={1001}
      styles={{ body: { maxHeight: 500, overflow: "auto" } }}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索技能名称、描述或分类..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />
      </div>

      {filteredSkills.length === 0 ? (
        <Empty
          description={
            existingSkillIds.length > 0 && availableSkills.length === existingSkillIds.length
              ? "该职级所有技能已添加"
              : "暂无匹配的技能"
          }
        />
      ) : (
        <>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text type="secondary">共 {filteredSkills.length} 个可选技能</Text>
            <Button type="link" size="small" onClick={handleSelectAll}>
              {selectedSkillIds.length === filteredSkills.length ? "取消全选" : "全选"}
            </Button>
          </div>

          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Tag color="blue">{category}</Tag>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {skills.map((skill) => {
                  const isSelected = selectedSkillIds.includes(skill.id);
                  return (
                    <div
                      key={skill.id}
                      onClick={() => handleToggleSkill(skill.id)}
                      style={{
                        padding: "12px 16px",
                        background: isSelected ? "#e6f4ff" : "#fafafa",
                        borderRadius: 8,
                        border: isSelected ? "1px solid #1677ff" : "1px solid #f0f0f0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        transition: "all 0.2s",
                      }}
                    >
                      <Checkbox checked={isSelected} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Text strong>{skill.name}</Text>
                          {isSelected && <CheckCircleOutlined style={{ color: "#1677ff" }} />}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {skill.description}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}
