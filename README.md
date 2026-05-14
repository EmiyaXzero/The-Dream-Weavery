# The Dream Weavery — 多 Agent 网文创作系统

基于多 Agent 协作架构的网络小说创作系统。通过主 Agent 协调调度多个专业从 Agent，实现世界观构建、角色设计、大纲规划和正文创作的全流程自动化。

## 架构

```
┌─────────────────────────────────────────────┐
│          主 Agent（协调者）                  │
│        novel-coordinator / SKILL.md         │
│  - 任务分解                                │
│  - 调度子 Agent                            │
│  - 整合结果                                │
└──────────────┬──────────────────────────────┘
               │ 通过输出结构化指令触发
               ▼
┌─────────────────────────────────────────────┐
│   从 Agent 1    │   从 Agent 2              │
│  worldview-agent│  character-agent          │
│  novel-worldview│  novel-character          │
│  / SKILL.md     │  / SKILL.md              │
├─────────────────┼───────────────────────────┤
│   从 Agent 3    │   从 Agent 4              │
│  outline-agent  │  writing-agent            │
│  novel-outline  │  novel-writing            │
│  / SKILL.md     │  / SKILL.md              │
└─────────────────┴───────────────────────────┘
               │ 结果返回主 Agent
               ▼
┌─────────────────────────────────────────────┐
│          主 Agent（协调者）                  │
│  - 接收结果                                │
│  - 质量评估                                │
│  - 最终输出                                │
└─────────────────────────────────────────────┘
```

## 项目结构

```
├── agents/
│   ├── coordinator-agent.md      ← 主 Agent（协调者）
│   ├── worldview-agent.md        ← 从 Agent：世界观构建
│   ├── character-agent.md        ← 从 Agent：角色设计
│   ├── outline-agent.md          ← 从 Agent：大纲规划
│   └── writing-agent.md          ← 从 Agent：正文创作
│
└── skills/
    ├── novel-coordinator/
    │   └── SKILL.md              ← 触发主 Agent 的 Skill
    ├── novel-worldview/
    │   └── SKILL.md              ← 触发世界观 Agent 的 Skill
    ├── novel-character/
    │   └── SKILL.md              ← 触发角色 Agent 的 Skill
    ├── novel-outline/
    │   └── SKILL.md              ← 触发大纲 Agent 的 Skill
    └── novel-writing/
        └── SKILL.md              ← 触发正文 Agent 的 Skill
```

## 工作流程

1. **任务分解** — 主 Agent 将创作任务拆解为世界观、角色、大纲等子任务
2. **调度执行** — 通过结构化指令触发从 Agent 并行或串行执行
3. **结果整合** — 从 Agent 返回结果后，主 Agent 进行质量评估并输出最终内容

## 从 Agent 职责

| Agent | 职责 |
|-------|------|
| **worldview-agent** | 世界观设定、力量体系、地理历史 |
| **character-agent** | 角色设计、人物弧光、关系网络 |
| **outline-agent** | 剧情大纲、章节规划、节奏设计 |
| **writing-agent** | 正文撰写、文风把控、爽点布局 |

## 快速开始

```bash
# 待补充
```

## 项目状态

早期开发阶段。
