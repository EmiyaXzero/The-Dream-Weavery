import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { startNovelCreation } from './agent'

let mainWindow: BrowserWindow | null = null

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

// 选择小说工作目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: '选择小说工作目录',
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// 获取小说目录列表（扫描已存在的小说）
ipcMain.handle('get-novels', async (_event, dirPath: string) => {
  const fs = await import('fs/promises')
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const novels = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const novelDir = path.join(dirPath, entry.name)
        const files = await fs.readdir(novelDir)
        const hasConfig = files.includes('novel.json')
        if (hasConfig) {
          const config = await fs.readFile(path.join(novelDir, 'novel.json'), 'utf-8')
          novels.push({ ...JSON.parse(config), path: novelDir })
        } else {
          novels.push({
            name: entry.name,
            path: novelDir,
            genre: '未设定',
            status: '未开始',
          })
        }
      }
    }
    return novels
  } catch {
    return []
  }
})

// 启动小说创作流程（Task 委派模式）
ipcMain.handle('start-creation', async (event, settings: NovelSettings) => {
  try {
    // 预先创建小说工作目录
    const fs = await import('fs/promises')
    const novelDir = path.join(settings.workspace, settings.title)
    await fs.mkdir(novelDir, { recursive: true })

    // 保存 novel.json 配置
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

    // 执行 Task 委派编排
    const result = await startNovelCreation(settings, (progress) => {
      event.sender.send('creation-progress', progress)
    })

    // 更新小说状态为已完成
    if (result.success) {
      const configPath = path.join(novelDir, 'novel.json')
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))
      config.status = '已完成'
      config.updated = new Date().toISOString()
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
    }

    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
