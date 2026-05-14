import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 工作目录
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getNovels: (dirPath: string) => ipcRenderer.invoke('get-novels', dirPath),

  // 配置读写
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: Record<string, string>) => ipcRenderer.invoke('save-config', config),

  // 创作流程
  startCreation: (settings: any) => ipcRenderer.invoke('start-creation', settings),
  onProgress: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('creation-progress', handler)
    return () => ipcRenderer.removeListener('creation-progress', handler)
  },
})
