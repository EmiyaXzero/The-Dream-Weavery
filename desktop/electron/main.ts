import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { startNovelCreation } from './agent'

let mainWindow: BrowserWindow | null = null

// ===== 持久化配置管理 =====
function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'dream-weavery.json')
}

async function loadConfig(): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(getConfigPath(), 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

async function saveConfig(config: Record<string, string>): Promise<void> {
  const existing = await loadConfig()
  const merged = { ...existing, ...config }
  await fs.writeFile(getConfigPath(), JSON.stringify(merged, null, 2), 'utf-8')
}

// ===== 窗口创建 =====
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ===== IPC Handlers =====

// 工作目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: '选择小说工作目录',
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// 获取小说列表
ipcMain.handle('get-novels', async (_event, dirPath: string) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const novels = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const novelDir = path.join(dirPath, entry.name)
        const files = await fs.readdir(novelDir)
        const hasConfig = files.includes('novel.json')
        if (hasConfig) {
          const cfg = await fs.readFile(path.join(novelDir, 'novel.json'), 'utf-8')
          novels.push({ ...JSON.parse(cfg), path: novelDir })
        } else {
          novels.push({ name: entry.name, path: novelDir, genre: '未设定', status: '未开始' })
        }
      }
    }
    return novels
  } catch {
    return []
  }
})

// 配置读写
ipcMain.handle('get-config', async () => {
  return await loadConfig()
})

ipcMain.handle('save-config', async (_event, config: Record<string, string>) => {
  await saveConfig(config)
  return { success: true }
})

// 启动小说创作
ipcMain.handle('start-creation', async (event, settings: NovelSettings) => {
  try {
    const novelDir = path.join(settings.workspace, settings.title)
    await fs.mkdir(novelDir, { recursive: true })

    await fs.writeFile(
      path.join(novelDir, 'novel.json'),
      JSON.stringify({
        name: settings.title,
        genre: settings.genre,
        style: settings.style,
        platform: settings.platform,
        length: settings.length,
        status: '创作中',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }, null, 2),
      'utf-8'
    )

    // 加载配置中保存的 API Key + 模型配置，传给编排层
    const config = await loadConfig()
    const envOverrides: Record<string, string> = {}
    if (config.apiKey) {
      envOverrides.CODEBUDDY_API_KEY = config.apiKey
      envOverrides.CODEBUDDY_INTERNET_ENVIRONMENT = config.networkEnv || 'internal'
    }

    // 提取模型配置（允许用户按 Agent 指定不同模型）
    const modelConfig = {
      worldview: config.modelWorldview,
      character: config.modelCharacter,
      outline: config.modelOutline,
      writing: config.modelWriting,
    }

    const result = await startNovelCreation(settings, envOverrides, modelConfig, (progress) => {
      event.sender.send('creation-progress', progress)
    })

    if (result.success) {
      const cfgPath = path.join(novelDir, 'novel.json')
      const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf-8'))
      cfg.status = '已完成'
      cfg.updated = new Date().toISOString()
      await fs.writeFile(cfgPath, JSON.stringify(cfg, null, 2), 'utf-8')
    }

    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
