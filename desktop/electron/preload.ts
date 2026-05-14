import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getNovels: (dirPath: string) => ipcRenderer.invoke('get-novels', dirPath),
  startCreation: (settings: any) => ipcRenderer.invoke('start-creation', settings),
  onProgress: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('creation-progress', handler)
    return () => ipcRenderer.removeListener('creation-progress', handler)
  },
})
