import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface EditorInfo {
  platform: 'Android' | 'iOS'
  filePath: string
}

export interface ElectronBridgeApi {
  openEditor: (info: EditorInfo) => void
  download: (url: string) => void
  getDownloadsPath: () => Promise<string>
}

// Custom APIs for renderer
const electronBridgeApi: ElectronBridgeApi = {
  openEditor: (info) => ipcRenderer.send('openEditor', info),
  download: (url) => ipcRenderer.send('download', url),
  getDownloadsPath: () => ipcRenderer.invoke('getDownloadsPath')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronBridgeApi', electronBridgeApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.electronBridgeApi = electronBridgeApi
}
