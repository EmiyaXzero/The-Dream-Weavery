import React from 'react'

interface Props {
  onSelect: () => void
}

export default function WorkspaceSelector({ onSelect }: Props) {
  return (
    <div className="workspace-selector">
      <div className="workspace-card">
        <div className="workspace-icon">📖</div>
        <h1>The Dream Weavery</h1>
        <p className="workspace-desc">
          多 AI Agent 协作的网络小说创作系统
        </p>
        <div className="workspace-features">
          <div className="feature-item">
            <span className="feature-icon">🌍</span>
            <span>世界观构建</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👤</span>
            <span>角色设计</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span>大纲规划</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✍️</span>
            <span>正文创作</span>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onSelect}>
          选择小说工作目录
        </button>
        <p className="workspace-hint">
          选择一个文件夹作为小说项目存放位置，所有创作的文件都将保存在此目录下
        </p>
      </div>
    </div>
  )
}
