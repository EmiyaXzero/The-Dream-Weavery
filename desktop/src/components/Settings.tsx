import React, { useState, useEffect } from 'react'

interface Props {
  onClose: () => void
}

const AGENT_LABELS: Record<string, string> = {
  modelWorldview: '🌍 世界观构建',
  modelCharacter: '👤 角色设计',
  modelOutline: '📋 大纲规划',
  modelWriting: '✍️ 正文创作',
}

function buildDefaultModels(): Record<string, string> {
  return {
    modelWorldview: '',
    modelCharacter: '',
    modelOutline: '',
    modelWriting: '',
  }
}

export default function Settings({ onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [networkEnv, setNetworkEnv] = useState('internal')
  const [models, setModels] = useState<Record<string, string>>(buildDefaultModels())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    if (window.electronAPI) {
      const cfg = await window.electronAPI.getConfig()
      if (cfg.apiKey) setApiKey(cfg.apiKey)
      if (cfg.networkEnv) setNetworkEnv(cfg.networkEnv)
      // 加载每个 Agent 的模型配置
      const defaults = buildDefaultModels()
      const loaded: Record<string, string> = {}
      for (const key of Object.keys(defaults)) {
        loaded[key] = cfg[key] || defaults[key]
      }
      setModels(loaded)
    }
  }

  function updateModel(key: string, value: string) {
    setModels(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (window.electronAPI) {
      await window.electronAPI.saveConfig({
        apiKey: apiKey.trim(),
        networkEnv,
        ...models,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleClear() {
    const defaults = buildDefaultModels()
    setApiKey('')
    setNetworkEnv('internal')
    setModels(defaults)
    if (window.electronAPI) {
      await window.electronAPI.saveConfig({ apiKey: '', networkEnv: 'internal', ...defaults })
    }
  }

  return (
    <div className="wizard-overlay">
      <div className="settings-panel">
        <div className="wizard-header">
          <h2>⚙️ 设置</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="wizard-body">
          {/* API Key */}
          <div className="form-group">
            <label>CodeBuddy API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="留空则使用本地 CLI 登录态"
            />
            <p className="form-hint">
              开启后系统将使用 API Key 连接 CodeBuddy，<strong>不消耗个人 CLI 额度</strong>。
              从 <a href="#" onClick={e => { e.preventDefault(); navigator.clipboard?.writeText('https://www.codebuddy.cn/profile') }}>CodeBuddy 设置页</a> 获取 API Key。
            </p>
          </div>

          {/* 网络环境 */}
          <div className="form-group">
            <label>网络环境</label>
            <div className="option-grid option-grid-3">
              {[
                { value: 'internal', label: '🇨🇳 中国版' },
                { value: '', label: '🌐 海外版' },
                { value: 'ioa', label: '🏢 企业 iOA' },
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`option-btn ${networkEnv === opt.value ? 'active' : ''}`}
                  onClick={() => setNetworkEnv(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 模型配置 */}
          <div className="form-group">
            <label>子 Agent 模型分配（留空则用 CodeBuddy 默认模型）</label>
            <p className="form-hint" style={{ marginBottom: 8 }}>
              设计/规划（世界观/角色/大纲）建议用推理型模型，正文生成用快速模型。
              填入你在 CodeBuddy 中可用的模型名称，例如：<code>deepseek-v4-pro</code>、<code>deepseek-r1</code>、<code>gpt-4o</code> 等。
            </p>
            {Object.keys(AGENT_LABELS).map(key => (
              <div key={key} className="model-row">
                <span className="model-label">{AGENT_LABELS[key]}</span>
                <input
                  type="text"
                  className="model-input"
                  value={models[key]}
                  onChange={e => updateModel(key, e.target.value)}
                  placeholder="默认模型"
                />
              </div>
            ))}
          </div>

          {/* 当前状态 */}
          <div className="settings-status">
            <div className="status-row">
              <span>连接方式：</span>
              <span className={apiKey ? 'status-key' : 'status-cli'}>
                {apiKey ? '🔑 API Key 模式' : '💻 本地 CLI 模式'}
              </span>
            </div>
            {apiKey && (
              <div className="status-row">
                <span>网络环境：</span>
                <span>{networkEnv || '海外版'}</span>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            <button className="btn btn-secondary" onClick={handleClear}>
              清除配置
            </button>
            <button className={`btn btn-primary ${saved ? 'btn-success' : ''}`} onClick={handleSave}>
              {saved ? '✅ 已保存' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
