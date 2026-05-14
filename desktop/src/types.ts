export interface NovelSettings {
  title: string
  workspace: string        // 工作目录
  genre: string            // 题材
  style: string            // 风格
  platform: string         // 目标平台
  length: string           // 预估长度
  special: string          // 特殊要求
}

export interface ProgressEvent {
  stage: string            // 当前阶段
  status: 'running' | 'done' | 'error'
  message: string
  progress: number         // 0-100
}

export interface NovelInfo {
  name: string
  path: string
  genre: string
  status: '未开始' | '世界观' | '角色' | '大纲' | '创作中' | '已完成'
  created?: string
  updated?: string
}
