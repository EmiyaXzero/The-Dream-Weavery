import React, { useState, useEffect } from 'react'
import type { NovelSettings, ProgressEvent } from '../types'

interface Props {
  workspace: string
  onClose: () => void
}

const GENRES = ['仙侠', '都市', '科幻', '历史', '末世', '无限流', '游戏', '悬疑']
const STYLES = ['轻松爽文', '深沉史诗', '热血竞技', '甜宠言情']
const PLATFORMS = ['番茄小说', '七猫小说', '起点中文网', '晋江文学城']
const LENGTHS = ['短篇(<50万字)', '中篇(50-150万字)', '长篇(>150万字)']

const STAGE_LABELS: Record<string, string> = {
  '初始化': '🚀 初始化',
  '世界观构建': '🌍 世界观构建',
  '角色设计': '👤 角色设计',
  '大纲规划': '📋 大纲规划',
  '正文创作': '✍️ 正文创作',
  '完成': '✅ 完成',
}

export default function Wizard({ workspace, onClose }: Props) {
  const [step, setStep] = useState<'settings' | 'generating' | 'done'>('settings')
  const [settings, setSettings] = useState<NovelSettings>({
    title: '',
    workspace,
    genre: '',
    style: '',
    platform: '',
    length: '',
    special: '',
  })
  const [progress, setProgress] = useState<ProgressEvent[]>([])
  const [error, setError] = useState('')

  function canStart() {
    return settings.title && settings.genre && settings.style && settings.platform && settings.length
  }

  async function handleStart() {
    setStep('generating')
    setError('')

    if (!window.electronAPI) {
      setError('无法连接到 Electron API')
      return
    }

    const cleanup = window.electronAPI.onProgress((data: ProgressEvent) => {
      setProgress(prev => {
        const exists = prev.find(p => p.stage === data.stage)
        if (exists) {
          return prev.map(p => p.stage === data.stage ? data : p)
        }
        return [...prev, data]
      })
    })

    try {
      const result = await window.electronAPI.startCreation(settings)
      if (result.success) {
        setStep('done')
      } else {
        setError(result.error || '创作流程出错')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      cleanup()
    }
  }

  function updateSetting(key: keyof NovelSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard">
        <div className="wizard-header">
          <h2>新建小说创作</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* 步骤1：设定填写 */}
        {step === 'settings' && (
          <div className="wizard-body">
            <div className="form-group">
              <label>小说名称 *</label>
              <input
                type="text"
                value={settings.title}
                onChange={e => updateSetting('title', e.target.value)}
                placeholder="输入小说名称"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>题材类型 *</label>
              <div className="option-grid">
                {GENRES.map(g => (
                  <button
                    key={g}
                    className={`option-btn ${settings.genre === g ? 'active' : ''}`}
                    onClick={() => updateSetting('genre', g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>风格偏好 *</label>
              <div className="option-grid">
                {STYLES.map(s => (
                  <button
                    key={s}
                    className={`option-btn ${settings.style === s ? 'active' : ''}`}
                    onClick={() => updateSetting('style', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>目标平台 *</label>
              <div className="option-grid">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    className={`option-btn ${settings.platform === p ? 'active' : ''}`}
                    onClick={() => updateSetting('platform', p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>预估长度 *</label>
              <div className="option-grid">
                {LENGTHS.map(l => (
                  <button
                    key={l}
                    className={`option-btn ${settings.length === l ? 'active' : ''}`}
                    onClick={() => updateSetting('length', l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>特殊要求（可选）</label>
              <textarea
                value={settings.special}
                onChange={e => updateSetting('special', e.target.value)}
                placeholder="例如：希望主角有系统金手指、不要虐心情节..."
                rows={3}
              />
            </div>

            <div className="wizard-actions">
              <button className="btn btn-secondary" onClick={onClose}>
                取消
              </button>
              <button
                className={`btn btn-primary ${canStart() ? '' : 'disabled'}`}
                onClick={handleStart}
                disabled={!canStart()}
              >
                开始创作 🚀
              </button>
            </div>
          </div>
        )}

        {/* 步骤2：生成中 */}
        {step === 'generating' && (
          <div className="wizard-body">
            <div className="progress-container">
              <div className="progress-stages">
                {['初始化', '世界观构建', '角色设计', '大纲规划', '正文创作'].map(stage => {
                  const p = progress.find(x => x.stage === stage)
                  const isActive = p?.status === 'running'
                  const isDone = p?.status === 'done'
                  return (
                    <div
                      key={stage}
                      className={`progress-stage ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                    >
                      <div className="stage-indicator">
                        {isDone ? '✅' : isActive ? '⏳' : '⏸️'}
                      </div>
                      <div className="stage-info">
                        <span className="stage-label">{STAGE_LABELS[stage]}</span>
                        {p && <span className="stage-msg">{p.message}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 进度条 */}
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progress.length > 0
                      ? Math.max(...progress.map(p => p.progress))
                      : 0}%`
                  }}
                />
              </div>
              <p className="progress-tip">AI 正在创作中，请稍候...</p>
            </div>
          </div>
        )}

        {/* 步骤3：完成 */}
        {step === 'done' && (
          <div className="wizard-body">
            <div className="done-container">
              <div className="done-icon">🎉</div>
              <h2>创作完成！</h2>
              <div className="done-summary">
                {progress.map(p => (
                  <div key={p.stage} className="done-item">
                    <span className="done-check">✅</span>
                    <span>{STAGE_LABELS[p.stage] || p.stage}</span>
                    <span className="done-time">{p.message}</span>
                  </div>
                ))}
              </div>
              <p className="done-path">
                文件保存位置：<code>{workspace}/{settings.title}/</code>
              </p>
              <button className="btn btn-primary" onClick={onClose}>
                返回小说列表
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="wizard-error">
            <span>❌</span>
            <span>{error}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setError('')}>
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
