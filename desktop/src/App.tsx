import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Wizard from './components/Wizard'
import WorkspaceSelector from './components/WorkspaceSelector'
import './styles/global.css'

type Page = 'workspace' | 'dashboard' | 'wizard'

interface NovelInfo {
  name: string
  path: string
  genre: string
  status: string
}

export default function App() {
  const [page, setPage] = useState<Page>('workspace')
  const [workspace, setWorkspace] = useState<string>('')
  const [novels, setNovels] = useState<NovelInfo[]>([])
  const [showWizard, setShowWizard] = useState(false)

  // 尝试从 localStorage 恢复工作目录
  useEffect(() => {
    const saved = localStorage.getItem('novel-workspace')
    if (saved) {
      setWorkspace(saved)
      setPage('dashboard')
      loadNovels(saved)
    }
  }, [])

  async function loadNovels(dir: string) {
    if (window.electronAPI) {
      const list = await window.electronAPI.getNovels(dir)
      setNovels(list)
    }
  }

  async function handleSelectDirectory() {
    if (window.electronAPI) {
      const dir = await window.electronAPI.selectDirectory()
      if (dir) {
        setWorkspace(dir)
        localStorage.setItem('novel-workspace', dir)
        await loadNovels(dir)
        setPage('dashboard')
      }
    }
  }

  function handleStartNovel() {
    setShowWizard(true)
  }

  function handleWizardClose() {
    setShowWizard(false)
    if (workspace) loadNovels(workspace)
  }

  return (
    <div className="app">
      {/* 标题栏 */}
      <div className="titlebar">
        <div className="titlebar-drag">
          <span className="titlebar-title">The Dream Weavery</span>
          <span className="titlebar-subtitle">多 Agent 网文创作系统</span>
        </div>
        <div className="titlebar-info">
          {workspace && (
            <span className="workspace-badge" title={workspace}>
              📁 {workspace.split('/').pop() || workspace.split('\\').pop()}
            </span>
          )}
        </div>
      </div>

      {/* 页面内容 */}
      <div className="content">
        {page === 'workspace' && (
          <WorkspaceSelector onSelect={handleSelectDirectory} />
        )}

        {page === 'dashboard' && (
          <Dashboard
            novels={novels}
            workspace={workspace}
            onRefresh={() => loadNovels(workspace)}
            onCreate={handleStartNovel}
            onSwitchWorkspace={() => {
              localStorage.removeItem('novel-workspace')
              setPage('workspace')
              setWorkspace('')
            }}
          />
        )}

        {showWizard && workspace && (
          <Wizard
            workspace={workspace}
            onClose={handleWizardClose}
          />
        )}
      </div>
    </div>
  )
}
