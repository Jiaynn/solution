import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ElectronBridgeApi } from './type'

// Custom APIs for renderer
const electronBridgeApi: ElectronBridgeApi = {
  openEditor: (info) => ipcRenderer.invoke('openEditor', info),
  unzip: (fileName, filePath) => ipcRenderer.invoke('unzip', fileName, filePath),
  openFile: (filePath) => ipcRenderer.invoke('openFile', filePath),
  downloadFile: (url) => ipcRenderer.invoke('downloadFile', url)
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
