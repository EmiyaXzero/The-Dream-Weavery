# Novel Coordinator Skill

触发主 Agent（coordinator-agent）进行网文创作全流程协调。

## 触发词

网文创作、写小说、创作小说、写书

## 行为

1. 加载 coordinator-agent.md
2. 将用户需求分解为子任务
3. 依次/并行触发 worldview / character / outline / writing Agent
4. 整合结果并输出最终创作成果
