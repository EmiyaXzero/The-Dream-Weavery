# The Dream Weavery — 多 Agent 网文创作系统

基于多 Agent 协作架构的网络小说创作系统。通过主 Agent 协调调度多个专业从 Agent，实现世界观构建、角色设计、大纲规划和正文创作的全流程自动化。

## 架构

```
┌─────────────────────────────────────────────┐
│          主 Agent（协调者）                  │
│        novel-coordinator / SKILL.md         │
│  - 需求解析                                │
│  - 任务分解                                │
│  - 调度子 Agent                            │
│  - 质量评估（节奏感/爽点密度/审核合规/文笔质量/逻辑一致性）                                │
│  - 逻辑检查协调                            │
│  - 错误处理                                │
│  - 整合结果                                │
└──────────────┬──────────────────────────────┘
               │ 串行：按依赖关系依次触发
               ▼
┌─────────────────────────────────────────────┐
│   从 Agent 1    │   从 Agent 2              │
│  worldview-agent│  character-agent          │
│  novel-worldview│  novel-character          │
│  / SKILL.md     │  / SKILL.md              │
│  references/     │  references/             │
│  (8个题材模板)  │  (人物塑造模板)           │
├─────────────────┼───────────────────────────┤
│   从 Agent 3    │   从 Agent 4              │
│  outline-agent  │  writing-agent            │
│  novel-outline  │  novel-writing            │
│  / SKILL.md     │  / SKILL.md              │
│  references/     │  references/             │
│  (节奏/爽点模板) │  (创作规则/格式/质量检查)   │
└─────────────────┴───────────────────────────┘
               │ 结果返回主 Agent
               ▼
┌─────────────────────────────────────────────┐
│          主 Agent（协调者）                  │
│  - 接收结果                                │
│  - 质量评估（5个维度）                                │
│  - 逻辑检查（5个方面）                                │
│  - 错误处理（重试策略）                                │
│  - 最终输出                                │
└─────────────────────────────────────────────┘
```

## 项目结构

```
├── agents/
│   ├── coordinator-agent.md      ← 主 Agent（协调者），约350行
│   ├── worldview-agent.md        ← 从 Agent：世界观构建，约300行
│   ├── character-agent.md        ← 从 Agent：角色设计，约250行
│   ├── outline-agent.md          ← 从 Agent：大纲规划，约300行
│   └── writing-agent.md          ← 从 Agent：正文创作，约350行
│
└── skills/
    ├── novel-coordinator/
    │   └── SKILL.md              ← 触发主 Agent 的 Skill，约150行
    ├── novel-worldview/
    │   ├── SKILL.md              ← 触发世界观 Agent 的 Skill，约100行
    │   └── references/           ← 题材世界观模板（8个文件）
    │       ├── genre_immortal.md   — 仙侠/修仙题材
    │       ├── genre_modern.md     — 都市题材
    │       ├── genre_scifi.md     — 科幻题材
    │       ├── genre_history.md    — 历史题材
    │       ├── genre_apocalypse.md — 末世题材（含原 web-novel-methods 末世案例）
    │       ├── genre_unlimited.md — 无限流题材
    │       ├── genre_game.md       — 游戏题材
    │       └── genre_mystery.md   — 悬疑题材
    ├── novel-character/
    │   ├── SKILL.md              ← 触发角色 Agent 的 Skill，约100行
    │   └── references/           ← 人物塑造参考模板
    │       └── character_templates.md — 主角/配角/反派/神秘角色模板
    ├── novel-outline/
    │   ├── SKILL.md              ← 触发大纲 Agent 的 Skill，约100行
    │   └── references/           ← 大纲规划参考模板
    │       ├── rhythm_templates.md  — 节奏曲线模板（通用/分平台/分题材）
    │       └── climax_matrix.md    — 爽点矩阵模板（通用/分题材）
    └── novel-writing/
        ├── SKILL.md              ← 触发正文 Agent 的 Skill，约100行
        └── references/           ← 正文创作参考模板
            ├── writing_rules.md     — 正文创作规则（黄金节奏/三秒法则/一章一事/标题设计/钩子设计）
            ├── format_specs.md      — 格式规范（禁止分隔符/场景切换方式/段落规范/对话规范）
            ├── quality_checklist.md — 质量检查清单（章节检查/卷末检查/逻辑检查/平台适配）
            └── technical_writing_specs.md — 技术描写规范（代码片段/硬件描写/编程思维比喻）
```

## 工作流程

1. **需求解析** — 主 Agent 主动询问用户创作意图、风格偏好、目标平台，输出《创作需求确认单》
2. **任务分解** — 主 Agent 将创作任务科学分解为世界观、角色、大纲、正文等子任务
3. **调度执行** — 按依赖关系有序触发从 Agent 串行执行（世界观→角色→大纲→正文）
4. **结果整合** — 从 Agent 返回结果后，主 Agent 收集所有输出文件
5. **质量评估** — 主 Agent 评估5个维度：节奏感/爽点密度/审核合规/文笔质量/逻辑一致性
6. **逻辑检查** — 主 Agent 协调各 Agent 进行5个方面检查：时间线/章节衔接/人物行为/修炼进度/派系关系
7. **错误处理** — 从 Agent 执行失败时自动重试一次，质量不达标时输出改进建议
8. **最终输出** — 主 Agent 生成《创作成果汇总报告》，包含所有生成文件的路径和摘要

## 从 Agent 职责

| Agent | 主要职责 | 输出文件 |
|-------|----------|----------|
| **worldview-agent** | 世界观设定、力量体系、地理历史、势力分布、金手指设计、权力架构 | `world_setting.json` + `world_setting.md` |
| **character-agent** | 角色设计、人物弧光、关系网络、主角/配角/反派/神秘角色塑造 | `characters.json` + `characters.md` |
| **outline-agent** | 剧情大纲、章节规划、节奏设计、爽点矩阵、伏笔埋设、断章钩子 | `outline.json` + `outline.md` |
| **writing-agent** | 正文撰写、文风把控、爽点布局、格式规范、逻辑检查 | `chapter_*.md` |

## 题材子技能参考

按题材拆分了8个世界观参考模板，存放在 `skills/novel-worldview/references/` 目录下：

| 题材 | 参考文件 | 核心要素 |
|------|----------|----------|
| 仙侠/修仙 | `genre_immortal.md` | 修炼体系、仙界架构、法宝体系、宗门势力 |
| 都市 | `genre_modern.md` | 商业体系、社会阶层、特殊能力、隐秘组织 |
| 科幻 | `genre_scifi.md` | 科技树、星际政治、外星种族、AI意识 |
| 历史 | `genre_history.md` | 朝代体系、军事制度、文化礼仪、官场架构 |
| 末世 | `genre_apocalypse.md` | 废土势力、生存资源、变异体系、智械危机（含原 web-novel-methods 末世案例） |
| 无限流 | `genre_unlimited.md` | 副本世界、主神空间、轮回规则、跨世界能力 |
| 游戏 | `genre_game.md` | 游戏系统、职业体系、副本机制、装备掉落 |
| 悬疑 | `genre_mystery.md` | 犯罪体系、侦查手段、心理分析、真相反转 |

## 质量检查流程

### 质量评估维度（5个）

1. **节奏感** — 是否符合目标平台的节奏要求（番茄极快/起点可慢热）
2. **爽点密度** — 是否达到目标平台的爽点分布要求
3. **审核合规** — 是否触发审核红线
4. **文笔质量** — 是否符合目标风格（轻松爽文/深沉史诗/甜宠言情）
5. **逻辑一致性** — 时间线/人物行为/修炼进度/派系关系是否一致

### 逻辑检查方面（5个）

1. **时间线一致性** — 章节之间的时间跨度是否合理
2. **章节衔接检查** — 上章钩子与本章开头是否衔接
3. **人物行为逻辑** — 人物行为是否符合性格和立场
4. **修炼进度/能力提升合理性** — 是否符合力量体系的设定
5. **派系关系一致性** — 派系关系是否符合设定

### 章节发布前检查（11项）

- [ ] 时间线是否与前后章节一致
- [ ] 人物行为是否符合性格
- [ ] 修炼进度/能力提升是否合理
- [ ] 派系关系是否正确
- [ ] 是否有爽点（至少1个）
- [ ] 结尾是否有钩子
- [ ] 标题是否包含看点
- [ ] 技术描写是否简洁真实
- [ ] 格式是否规范（无单独成行的"——"）
- [ ] 场景切换是否规范
- [ ] 每章是否只干了一件事（一章一事原则）

## 快速开始

```bash
# 触发主 Agent，开始创作
请调用 /novel-coordinator Skill，创作一部网络小说。

# 或者直接触发某个从 Agent
请调用 /novel-worldview Skill，构建世界观。
请调用 /novel-character Skill，设计角色。
请调用 /novel-outline Skill，规划大纲。
请调用 /novel-writing Skill，创作正文。
```

## 平台适配指南

| 平台 | 节奏要求 | 爽点密度 | 章节字数 | 风格偏好 |
|------|----------|----------|----------|----------|
| 番茄小说 | 极快，开局即高潮 | 极高（每章至少1个爽点） | 2000-2500字 | 轻松爽文，不要太虐 |
| 七猫小说 | 快，开局要有hook | 高（每章1个爽点） | 2000-3000字 | 轻松爽文/甜宠 |
| 起点中文网 | 可慢热，前期铺垫OK | 中（每3章1个爽点） | 3000-3500字 | 深度剧情，逻辑要硬 |
| 晋江文学城 | 可慢热，注重感情线 | 中（感情线为主） | 2000-3000字 | 甜宠/虐恋/BE美学 |

## 原 web-novel-methods 拆解说明

原有的单文件技能 `web-novel-methods/SKILL.md` 已完全拆解为多Agent架构：

| 原 web-novel-methods 章节 | 拆解目标 |
|----------|----------|
| 世界观构建 | `worldview-agent.md` + `novel-worldview/SKILL.md` + 8个题材参考文件 |
| 大纲规划 | `outline-agent.md` + `novel-outline/SKILL.md` + 节奏/爽点参考文件 |
| 章节详细规划 | `outline-agent.md`（章节细纲部分） |
| 正文创作 | `writing-agent.md` + `novel-writing/SKILL.md` + 创作规则/格式/质量检查参考文件 |
| 核心规则 | `writing-agent.md`（黄金节奏/三秒法则/一章一事/标题设计/钩子设计） |
| 格式规范 | `writing-agent.md` + `format_specs.md` |
| 技术描写规范 | `writing-agent.md` + `technical_writing_specs.md` |
| 人物塑造模板 | `character-agent.md` + `character_templates.md` |
| 逻辑检查 | `writing-agent.md` + `coordinator-agent.md` + `quality_checklist.md` |
| 常见错误及修正 | 各相关Agent正文（分散到对应Agent） |
| 质量检查清单 | `coordinator-agent.md` + `quality_checklist.md` |

**原文件已不再保留独立技能**，所有方法论已完全整合到多Agent架构中。

## 项目状态

已完成拆分方案实施：
- [x] 增强 worldview-agent.md 和 novel-worldview/SKILL.md，创建8个题材参考文件
- [x] 增强 character-agent.md 和 novel-character/SKILL.md，创建人物模板参考文件
- [x] 增强 outline-agent.md 和 novel-outline/SKILL.md，创建大纲规划参考文件
- [x] 增强 writing-agent.md 和 novel-writing/SKILL.md，创建正文创作参考文件
- [x] 增强 coordinator-agent.md 和 novel-coordinator/SKILL.md，整合质量评估和错误处理流程
