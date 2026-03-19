

# AI 对话练习/考试系统 - 实施计划

## 概述

基于知识库自动生成结构化对话流程，支持管理员编辑对话轮次、要点与解析，并将其打包为练习或考试计划。一期聚焦**练习模式**。

## 系统架构

```text
知识库文档 ──→ AI 生成对话大纲 ──→ AI 生成话术 ──→ 管理员编辑 ──→ 发布为练习计划
                (Step 1)          (Step 2)       (Step 3)         (Step 4)
```

## 数据库变更

### 新建表: `dialog_scripts` (对话剧本)

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| organization_id | uuid FK | 组织隔离 |
| title | text | 剧本标题 |
| description | text | 场景描述 |
| knowledge_base_id | uuid | 关联知识库 |
| knowledge_doc_ids | jsonb | 选用的文档ID列表 |
| assessment_model | jsonb | 评估维度与权重 |
| character_id | uuid | 虚拟对话者 |
| voice_style | text | 声音风格 |
| dialog_turns | jsonb | 对话轮次数组(见下方结构) |
| mode | text | 'practice' / 'exam' / 'practice_then_exam' |
| practice_config | jsonb | 练习配置(每轮最大尝试次数等) |
| exam_config | jsonb | 考试配置(通关分数等) |
| status | text | draft/published |
| created_by | uuid | |
| created_at / updated_at | timestamptz | |

### `dialog_turns` JSONB 结构

```json
[
  {
    "id": "turn_1",
    "type": "companion_says",  // 陪练者说 / 学员说
    "speaker": "companion",    // companion | trainee
    "content": "你最近总觉得肚子胀...",
    "standard_answer": "标准话术内容",
    "key_points": [
      { "id": "kp1", "content": "主动自我介绍建立专业形象", "required": false }
    ],
    "analysis": "先共情顾客...",
    "flow_condition": { "type": "hit_any", "min_points": 1 },
    "max_attempts": 3,
    "sort_order": 0
  }
]
```

### 修改表: `practice_sessions`

添加 `dialog_script_id` (uuid, nullable) 外键关联 `dialog_scripts`，使练习计划可引用对话剧本。

## 前端新增页面与组件

### 1. 新路由: `/dialog-scripts`

侧边栏新增"AI 对话"菜单项，进入对话剧本管理列表页。

### 2. 对话剧本创建 - 三步流程 (Drawer)

**Step 1 - 填写基本信息:**
- 剧本标题、场景描述
- 选择知识库 + 勾选文档
- 选择评估模型(维度+权重)
- 选择虚拟对话者(复用 `ai_characters`)与声音
- 选择模式: 练习 / 考试 / 先考后练

**Step 2 - 生成对话大纲:**
- 调用 Edge Function，基于知识库文档内容 AI 生成对话大纲
- 展示大纲(轮次数、角色分配)，支持调整后重新生成

**Step 3 - 生成 & 编辑话术:**
- AI 生成每轮对话的完整话术、要点、解析
- 展示为卡片列表(参考图2样式)，每张卡片显示:
  - 角色标签(陪/学)
  - 对话内容
  - 要点列表(可增删，最多10个)
  - 解析文本
- 支持勾选/取消轮次
- 底部"导入已选话术"按钮确认

### 3. 对话流程编辑器 (独立页面)

参考图1但采用更简洁的 Ant Design 风格:

- **左栏 - 素材组件:** 可拖入的节点类型(旁白、话术示范、陪练者问学员、学员问陪练者、结束)
- **中栏 - 流程画布:** 纵向排列的对话节点卡片，支持拖拽排序、添加/删除
- **右栏 - 节点属性:** 选中节点后编辑:
  - 节点名称、标准话术
  - 要点列表(增删改，上限10个)
  - 解析文本
  - 流转条件(命中任意N个要点 / 命中部分要点)
  - 练习模式下: 最大回答次数配置

### 4. 练习模式配置

- 每个对话环节可配置最大回答次数(1-5)
- 达到最大次数未答对: 展示答案和解析，自动进入下一轮
- 全局通过分数配置

## Edge Function

### `generate-dialog-script`

输入: 知识文档内容 + 场景描述 + 评估维度
输出: 结构化对话轮次(含要点、解析、标准话术)

使用 `google/gemini-2.5-flash` 模型，通过详细 prompt 生成符合 `dialog_turns` 结构的 JSON。

## 实施分批

由于功能量大，建议分3批实施:

**第1批(本次):** 数据库建表 + 剧本列表页 + 三步创建流程(基本信息→AI生成大纲→AI生成话术) + Edge Function
**第2批:** 对话流程编辑器(左中右三栏布局) + 节点属性编辑
**第3批:** 练习模式运行时(学员端对话界面) + 与练习计划关联

## 技术要点

- 所有表启用 RLS，按 organization_id 隔离
- 复用现有 `useActiveAICharacters` hook 获取虚拟角色
- 复用知识库文档选择组件 `KnowledgeSelector`
- Edge Function 处理 429/402 错误并返回友好提示
- 侧边栏使用 `MessageSquare` 图标(或新图标)区分

