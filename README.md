# The Dream Weavery — 多 Agent 网文创作系统

基于 **CodeBuddy Agent SDK** 的多 Agent 协作网络小说创作系统。通过协调者 Agent 以 **Task 委派模式** 调度 4 个专业子 Agent，实现世界观构建 → 角色设计 → 大纲规划 → 正文创作的全流程自动化。

🎯 **参赛项目**：[腾讯云黑客松 · AI 智能体挑战赛](https://tch.cloud.tencent.com/claw)（AI CAN DO IT）

---

## 三层架构

```
┌──────────────────────────────────────────────────────────┐
│                   展示层 · Electron 桌面端                │
│  desktop/                                                │
│  ├── 选择工作目录 → 新建小说 → 填写设定                  │
│  ├── 实时进度展示（初始化→世界观→角色→大纲→正文）       │
│  └── 完成后查看所有生成文件                              │
├──────────────────────────────────────────────────────────┤
│                   编排层 · SDK Task 委派                  │
│  desktop/electron/agent/index.ts                         │
│  ├── 协调者 Agent（allowedTools: ['Task']）              │
│  │   ├── Task("worldview-agent")   ← 传入题材/风格等     │
│  │   ├── Task("character-agent")   ← 依赖世界观完成      │
│  │   ├── Task("outline-agent")     ← 依赖前置完成        │
│  │   └── Task("writing-agent")     ← 依赖全部前置        │
│  └── 流式输出 → 实时解析阶段标记 → 更新 UI 进度         │
├──────────────────────────────────────────────────────────┤
│                   知识层 · Agents & Skills               │
│  agents/        ← Agent 方法论文档（markdown）           │
│  skills/        ← 题材知识库（8个世界观模板 + 创作规则） │
└──────────────────────────────────────────────────────────┘
```

### 协作模式

```
用户打开桌面端 → 填写创作需求
        ↓
协调者 Agent 接收需求（1 次 query() 启动）
        ↓  Task
┌─── 世界观 Agent ──→ 输出 world_setting.json / .md
        ↓  Task
┌─── 角色 Agent ────→ 读取世界观 → 输出 characters.json / .md
        ↓  Task
┌─── 大纲 Agent ────→ 读取前置 → 输出 outline.json / .md
        ↓  Task
┌─── 正文 Agent ────→ 读取全部 → 输出 chapter_01~03.md
        ↓
协调者总结报告 ← 所有子 Agent 结果返回
```

---

## 项目结构

```
The-Dream-Weavery/
│
├── agents/                              ← 📚 Agent 方法论文档
│   ├── coordinator-agent.md              ─ 协调者：任务分解/质量评估/错误处理
│   ├── worldview-agent.md               ─ 世界观 Agent：力量体系/势力/金手指
│   ├── character-agent.md               ─ 角色 Agent：人物塑造/弧光/关系网络
│   ├── outline-agent.md                 ─ 大纲 Agent：节奏/爽点/伏笔/断章
│   └── writing-agent.md                 ─ 正文 Agent：创作规则/格式规范/逻辑检查
│
├── skills/                              ← 📚 题材知识库
│   ├── novel-worldview/references/      ─ 8个题材世界观模板
│   │   ├── genre_immortal.md             ─ 仙侠/修仙
│   │   ├── genre_modern.md              ─ 都市
│   │   ├── genre_scifi.md               ─ 科幻
│   │   ├── genre_history.md             ─ 历史
│   │   ├── genre_apocalypse.md          ─ 末世（含原 web-novel-methods 案例）
│   │   ├── genre_unlimited.md           ─ 无限流
│   │   ├── genre_game.md                ─ 游戏
│   │   └── genre_mystery.md             ─ 悬疑
│   ├── novel-character/references/       ─ 人物塑造模板
│   ├── novel-outline/references/         ─ 节奏曲线 & 爽点矩阵
│   ├── novel-writing/references/         ─ 创作规则/格式/质量检查/技术描写
│   ├── novel-coordinator/SKILL.md
│   ├── novel-worldview/SKILL.md
│   ├── novel-character/SKILL.md
│   ├── novel-outline/SKILL.md
│   └── novel-writing/SKILL.md
│
├── desktop/                             ← 💻 Electron 桌面端（SDK 编排 + UI）
│   ├── package.json                      ─ 依赖：Electron + React + @tencent-ai/agent-sdk
│   ├── vite.config.ts                    ─ Vite + Electron 构建配置
│   ├── tsconfig.json                     ─ TypeScript 配置
│   ├── index.html                        ─ HTML 入口
│   ├── electron/
│   │   ├── main.ts                       ─ 主进程：窗口管理 + IPC + 目录管理
│   │   ├── preload.ts                    ─ 预加载：安全暴露 API
│   │   └── agent/
│   │       └── index.ts                  ─ ⭐ SDK 编排核心（Task 委派模式）
│   ├── src/
│   │   ├── main.tsx                      ─ React 入口
│   │   ├── App.tsx                       ─ 主应用：路由状态管理
│   │   ├── types.ts                      ─ 类型定义
│   │   ├── components/
│   │   │   ├── WorkspaceSelector.tsx      ─ 选择工作目录（首次启动）
│   │   │   ├── Dashboard.tsx             ─ 小说列表管理
│   │   │   └── Wizard.tsx                ─ 创作向导（设定→进度→完成）
│   │   └── styles/
│   │       └── global.css                ─ 深色主题样式
│   └── dist/                             ─ 构建产物（.gitignore）
│
└── README.md
```

---

## 快速开始

### 前置条件

1. 已安装 [CodeBuddy CLI](https://www.codebuddy.cn) 并完成登录
2. Node.js >= 18.20

### 运行桌面端

```bash
cd desktop
npm install
npm run dev
```

### 使用流程

```
1. 启动应用 → 选择小说工作目录
2. 点击「新建小说」→ 填写创作需求
   ├─ 小说名称、题材（8种）、风格、目标平台、长度
3. 点击「开始创作」→ 自动执行
   ├─ 🌍 世界观构建（Task → worldview-agent）
   ├─ 👤 角色设计（Task → character-agent）
   ├─ 📋 大纲规划（Task → outline-agent）
   └─ ✍️ 正文创作（Task → writing-agent）
4. 完成后查看生成文件
   └─ {工作目录}/{小说名}/
       ├── world_setting.json / .md
       ├── characters.json / .md
       ├── outline.json / .md
       └── chapter_01~03.md
```

---

## 子 Agent 职责

| Agent | 核心能力 | 输出文件 | 使用的知识库 |
|-------|----------|----------|-------------|
| **worldview-agent** | 力量/修炼体系、金手指、地理历史、势力分布、权力架构 | `world_setting.json` + `.md` | 8个题材世界观模板 + 通用方法论 |
| **character-agent** | 主角/配角/反派/神秘角色、人物弧光、关系网络 | `characters.json` + `.md` | 人物塑造模板 |
| **outline-agent** | 卷级结构、节奏曲线、爽点矩阵、章节细纲、伏笔、黄金三章 | `outline.json` + `.md` | 节奏曲线模板 + 爽点矩阵模板 |
| **writing-agent** | 正文创作、格式规范、逻辑检查、技术描写 | `chapter_*.md` | 创作规则 + 格式规范 + 质量检查清单 |

---

## SDK 编排核心（Task 委派模式）

```typescript
// desktop/electron/agent/index.ts

const options = {
  allowedTools: ['Task'],           // 协调者只能用 Task 委派
  agents: {
    'worldview-agent': {             // 子 Agent 有独立域知识 + 工具集
      description: '构建小说世界观框架...',
      prompt: '你是一位资深的世界观架构师...',
      tools: ['Glob', 'Read', 'Write', 'Bash'],
    },
    'character-agent': { ... },      // 角色设计
    'outline-agent': { ... },        // 大纲规划
    'writing-agent': { ... },        // 正文创作
  },
}

const q = query({ prompt: coordinatorPrompt, options })
// 协调者 Agent 自动按依赖关系依次 Task 调用子 Agent
```

---

## 质量体系

### 评估维度

| 维度 | 说明 |
|------|------|
| 节奏感 | 是否符合目标平台要求（番茄极快/起点可慢热） |
| 爽点密度 | 是否达到目标平台标准 |
| 审核合规 | 是否触发红线 |
| 文笔质量 | 是否符合目标风格 |
| 逻辑一致性 | 时间线/人物/修炼/派系 |

### 平台适配

| 平台 | 节奏 | 爽点密度 | 章节字数 | 风格 |
|------|------|----------|----------|------|
| 番茄小说 | 极快，开局即高潮 | 每章≥1个 | 2000-2500 | 轻松爽文 |
| 七猫小说 | 快，开局要hook | 每章1个 | 2000-3000 | 轻松/甜宠 |
| 起点中文网 | 可慢热 | 每3章1个 | 3000-3500 | 深度剧情 |
| 晋江文学城 | 可慢热，重感情线 | 感情线为主 | 2000-3000 | 甜宠/虐恋 |

---

## 参赛信息

参赛项目：**The Dream Weavery** · AI CAN DO IT 腾讯云黑客松·AI 智能体挑战赛

### 评审契合点

| 维度 | 权重 | 体现 |
|------|------|------|
| **场景价值** | 30% | 解决网文作者/工作室的内容产出效率问题，将写作周期从月缩短到天 |
| **功能完整性** | 25% | 完整的桌面端 GUI + 多Agent流水线 + 文件管理系统 |
| **创新与深度** | 25% | Task 委派模式多Agent协作、Skills 知识库深度应用、Electron 封装 |
| **效能提升** | 20% | AI 驱动全流程，替代传统人工创作的多环节 |

### 使用的腾讯云产品

- **CodeBuddy** — `@tencent-ai/agent-sdk`（TS SDK）实现多 Agent 编排

---

## 项目状态

- [x] Agent 方法论文档（5个 agents/*.md）
- [x] 题材知识库（14个 references/ 参考文件）
- [x] SDK Task 委派编排（desktop/electron/agent/index.ts）
- [x] Electron 桌面端（React UI + IPC 通信）
- [x] 已推送到 GitHub

### 计划中

- [ ] 完善子 Agent 的 Skill 集成（加载题材模板到子 Agent 上下文）
- [ ] 长篇小说续写功能
- [ ] 批量章节生成
- [ ] 导出 EPUB/PDF 格式

---

> **原 web-novel-methods 单文件技能已完全拆解为多 Agent 架构**，不再保留独立技能文件。所有方法论已整合到 agents/ 和 skills/ 目录中。
