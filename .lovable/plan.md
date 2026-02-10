

# 四大功能详细实施计划

---

## 一、知识库（新增菜单）

### 目标
提供一个集中管理培训资料的模块，用户可上传 PDF/PPT/Word/文本等文件，AI 自动提取摘要和知识点，供后续 AI 制课时引用。

### 菜单配置
- 路由：`/knowledge-base`
- 菜单名称：知识库
- 图标：`DatabaseOutlined`
- 位置：侧边栏「角色配置」下方

### 数据库设计
新建 `knowledge_documents` 表：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 主键 |
| organization_id | uuid | 所属组织 |
| title | text | 文档标题 |
| description | text | 文档描述 |
| file_url | text | 存储路径 |
| file_name | text | 原始文件名 |
| file_type | text | MIME 类型 |
| file_size | integer | 文件大小(bytes) |
| ai_summary | text | AI 生成的摘要 |
| ai_key_points | jsonb | AI 提取的知识点列表 |
| category | text | 分类(话术/流程/产品/方法论) |
| tags | jsonb | 标签数组 |
| status | text | draft/processing/ready/error |
| created_by | uuid | 上传人 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

RLS 策略：同组织可读，管理员可增删改。

### 前端页面结构

```text
+------------------------------------------+
| 知识库                       [上传资料]    |
+------------------------------------------+
| 筛选：[分类下拉] [状态下拉] [搜索框]      |
+------------------------------------------+
| 文档列表（Table）                         |
| 标题 | 分类 | 状态 | 知识点数 | 上传时间  |
| ─────────────────────────────────────     |
| 点击行 -> 右侧抽屉查看详情               |
|   - 文档预览                              |
|   - AI 摘要                               |
|   - 提取的知识点列表（可编辑）            |
|   - 关联的培训计划                        |
+------------------------------------------+
```

### 后端函数
新建 Edge Function `ai-parse-document`：
- 接收文件 URL，调用 Lovable AI (gemini-2.5-flash) 提取摘要和知识点
- 返回结构化的 `{ summary, keyPoints: [{ title, content, category }] }`
- 文档上传后自动触发解析，状态从 `processing` 变为 `ready`

### 新增文件
- `src/pages/knowledge-base/KnowledgeBase.tsx` — 主页面
- `src/components/knowledge-base/KnowledgeDocDrawer.tsx` — 文档详情抽屉
- `src/components/knowledge-base/UploadDocModal.tsx` — 上传弹窗
- `supabase/functions/ai-parse-document/index.ts` — AI 解析函数

### 修改文件
- `src/App.tsx` — 添加路由
- `src/components/layout/DashboardLayout.tsx` — 添加菜单项

---

## 二、AI 制课（新增菜单）

### 目标
用户从知识库选取资料，AI 自动生成课程大纲、教案和讲稿，未来可对接数字人录课。

### 菜单配置
- 路由：`/ai-courseware`
- 菜单名称：AI 制课
- 图标：`VideoCameraOutlined`
- 位置：侧边栏「知识库」下方

### 数据库设计
新建 `ai_courseware` 表：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 主键 |
| organization_id | uuid | 所属组织 |
| title | text | 课件标题 |
| description | text | 课件描述 |
| source_documents | jsonb | 引用的知识库文档 ID 列表 |
| outline | jsonb | AI 生成的大纲结构 |
| scripts | jsonb | 各章节的讲稿内容 |
| status | text | draft/generating/ready/published |
| character_id | uuid | 关联的数字人角色(可选) |
| video_urls | jsonb | 生成的视频 URL 列表 |
| created_by | uuid | 创建人 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 前端页面结构（三步工作流）

```text
步骤1: 选择知识 ──> 步骤2: AI生成大纲 ──> 步骤3: 编辑与录制

[步骤1 - 选择知识]
+------------------------------------------+
| 从知识库选择资料              [新建课件]   |
+------------------------------------------+
| 左侧：知识库文档列表（勾选）             |
| 右侧：已选文档 + 额外指令输入框          |
|        [开始生成大纲]                     |
+------------------------------------------+

[步骤2 - AI 生成大纲]
+------------------------------------------+
| 课件大纲编辑器                            |
+------------------------------------------+
| 章节树形结构（可拖拽排序）               |
| 每个章节：标题 / 时长 / 知识点 / 讲稿    |
| [重新生成] [手动添加章节] [下一步]       |
+------------------------------------------+

[步骤3 - 讲稿与录制]
+------------------------------------------+
| 左侧：章节列表                           |
| 右侧：当前章节讲稿（可编辑）            |
|        [选择数字人] [生成视频(预留)]      |
+------------------------------------------+
```

### 后端函数
新建 Edge Function `ai-generate-courseware`：
- 接收知识文档内容 + 用户指令
- 调用 Lovable AI (gemini-2.5-pro) 生成大纲和讲稿
- 返回 `{ outline: [...chapters], scripts: { chapterId: scriptContent } }`

### 新增文件
- `src/pages/ai-courseware/AICourseware.tsx` — 主列表页
- `src/components/ai-courseware/CoursewareCreator.tsx` — 三步创建工作流
- `src/components/ai-courseware/KnowledgeSelector.tsx` — 知识库选择器
- `src/components/ai-courseware/OutlineEditor.tsx` — 大纲编辑器
- `src/components/ai-courseware/ScriptEditor.tsx` — 讲稿编辑器
- `supabase/functions/ai-generate-courseware/index.ts` — AI 生成函数

### 修改文件
- `src/App.tsx` — 添加路由
- `src/components/layout/DashboardLayout.tsx` — 添加菜单项

---

## 三、学习中心（新增菜单）

### 目标
通过排行榜、打卡、成就徽章和部门 PK 等游戏化机制，提升学员参与度。

### 菜单配置
- 路由：`/learning-center`
- 菜单名称：学习中心
- 图标：`TrophyOutlined`
- 位置：侧边栏「数据看板」上方

### 数据库设计
新建 3 张表：

**`learning_streaks`** — 打卡记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 主键 |
| user_id | uuid | 学员 |
| check_in_date | date | 打卡日期 |
| duration_minutes | integer | 当日学习时长 |
| activities | jsonb | 完成的活动列表 |
| created_at | timestamptz | 创建时间 |

**`achievements`** — 成就定义

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 主键 |
| organization_id | uuid | 所属组织 |
| name | text | 成就名称 |
| description | text | 描述 |
| icon | text | 图标标识 |
| category | text | 分类(学习/练习/考核/社交) |
| condition | jsonb | 达成条件 |
| points | integer | 积分值 |

**`user_achievements`** — 用户已获成就

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 主键 |
| user_id | uuid | 学员 |
| achievement_id | uuid FK | 成就 |
| earned_at | timestamptz | 获得时间 |

### 前端页面结构（Tabs 切换）

```text
+------------------------------------------+
| 学习中心                                  |
+------------------------------------------+
| [排行榜] [学习打卡] [成就墙] [部门PK]    |
+------------------------------------------+

排行榜 Tab:
| 排名 | 学员 | 部门 | 练习分 | 学习时长 | 进步值 |
| 支持：本周/本月/总榜 筛选

学习打卡 Tab:
| 日历热力图（类似 GitHub 贡献图）          |
| 连续打卡天数 / 本月学习天数 / 总时长      |

成就墙 Tab:
| 已解锁徽章网格 + 未解锁灰色徽章           |
| 点击查看达成条件和进度                     |

部门PK Tab:
| 部门对比柱状图（完成率/平均分/参与率）    |
| 本月冠军部门展示                           |
```

### 新增文件
- `src/pages/learning-center/LearningCenter.tsx` — 主页面
- `src/components/learning-center/Leaderboard.tsx` — 排行榜
- `src/components/learning-center/CheckInCalendar.tsx` — 打卡日历
- `src/components/learning-center/AchievementWall.tsx` — 成就墙
- `src/components/learning-center/DepartmentPK.tsx` — 部门 PK

### 修改文件
- `src/App.tsx` — 添加路由
- `src/components/layout/DashboardLayout.tsx` — 添加菜单项

---

## 四、AI 能力诊断与智能推荐（改造数据看板）

### 目标
在学员档案抽屉中新增 AI 诊断面板，自动分析练习数据，映射成长地图差距，生成推荐学习路径。

### 改造位置
不新增菜单，改造现有数据看板中的 `StudentProfileDrawer.tsx`。

### 前端改造结构

```text
现有学员档案抽屉中，在「AI 综合评价」下方新增：

+------------------------------------------+
| AI 能力诊断报告              [重新诊断]   |
+------------------------------------------+
| 诊断时间：2026-02-10 14:30               |
+------------------------------------------+
| 薄弱维度排名                              |
| 1. 异议处理  当前65分 标准80分  差距-15   |
| 2. 产品知识  当前72分 标准85分  差距-13   |
+------------------------------------------+
| 成长地图定位                              |
| 当前职级：P2  目标职级：P3               |
| 缺口技能：[SPIN提问法] [竞品分析]        |
+------------------------------------------+
| 智能推荐学习路径                          |
| Step1: 产品知识精讲(课程) -> 匹配度92%   |
| Step2: 异议处理实战(练习) -> 匹配度88%   |
| Step3: 综合能力测验(考核) -> 匹配度85%   |
|              [一键指派全部]               |
+------------------------------------------+
```

### 后端函数
新建 Edge Function `ai-diagnostic`：
- 接收学员的练习历史数据、雷达图数据、成长地图技能要求
- 调用 Lovable AI (gemini-2.5-flash) 分析并生成诊断报告
- 返回 `{ weakDimensions, growthGap, recommendedPath }`

### 新增文件
- `src/components/analytics/AIDiagnosticPanel.tsx` — AI 诊断面板组件
- `supabase/functions/ai-diagnostic/index.ts` — AI 诊断函数

### 修改文件
- `src/components/analytics/StudentProfileDrawer.tsx` — 嵌入诊断面板

---

## 侧边栏菜单最终顺序

```text
首页
培训计划
练习计划
角色配置
知识库          <- 新增
AI 制课         <- 新增
学习地图
成长地图
学习中心        <- 新增
数据看板
```

---

## 实施顺序建议

| 阶段 | 功能 | 预计工作量 | 依赖 |
|------|------|-----------|------|
| 第1步 | 知识库 | 数据库 + 页面 + Edge Function | 无 |
| 第2步 | AI 制课 | 页面 + Edge Function | 依赖知识库 |
| 第3步 | AI 能力诊断 | 组件 + Edge Function | 无 |
| 第4步 | 学习中心 | 数据库 + 4个组件 | 无 |

建议先实现知识库（第1步），因为 AI 制课依赖它。第3步和第4步可并行。

---

## 技术要点

- 所有 AI 调用使用 Lovable AI 内置模型，无需额外 API Key
- 知识库文件上传复用现有 `training-attachments` 存储桶
- 所有新表均配置 RLS 策略，按组织隔离数据
- 所有新增抽屉/弹窗的 zIndex 统一设为 1000
- UI 风格保持 Ant Design 默认样式，不做自定义覆盖

