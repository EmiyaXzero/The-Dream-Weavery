import React from 'react'
import type { NovelInfo } from '../types'

interface Props {
  novels: NovelInfo[]
  workspace: string
  onRefresh: () => void
  onCreate: () => void
  onSwitchWorkspace: () => void
}

const STATUS_COLORS: Record<string, string> = {
  '未开始': '#6b7280',
  '世界观': '#3b82f6',
  '角色': '#8b5cf6',
  '大纲': '#f59e0b',
  '创作中': '#10b981',
  '已完成': '#059669',
}

export default function Dashboard({ novels, workspace, onRefresh, onCreate, onSwitchWorkspace }: Props) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>小说列表</h2>
          <p className="dashboard-path">工作目录：{workspace}</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" onClick={onSwitchWorkspace}>
            切换目录
          </button>
          <button className="btn btn-primary" onClick={onCreate}>
            + 新建小说
          </button>
        </div>
      </div>

      {novels.length === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-icon">📚</div>
          <p>还没有小说项目</p>
          <p className="empty-hint">点击"新建小说"开始你的创作之旅</p>
        </div>
      ) : (
        <div className="novel-grid">
          {novels.map((novel, i) => (
            <div
              key={i}
              className="novel-card"
              onClick={() => {
                // TODO: 打开小说详情页面
              }}
            >
              <div className="novel-card-header">
                <h3>{novel.name}</h3>
                <span
                  className="novel-status"
                  style={{
                    backgroundColor: STATUS_COLORS[novel.status] || '#6b7280',
                  }}
                >
                  {novel.status}
                </span>
              </div>
              <div className="novel-card-body">
                <span className="novel-genre">{novel.genre}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
