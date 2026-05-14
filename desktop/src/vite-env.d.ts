/// <reference types="vite/client" />

interface ElectronAPI {
  selectDirectory: () => Promise<string | null>
  getNovels: (dirPath: string) => Promise<any[]>
  startCreation: (settings: any) => Promise<{ success: boolean; error?: string }>
  onProgress: (callback: (data: any) => void) => () => void
}

interface Window {
  electronAPI: ElectronAPI
}
