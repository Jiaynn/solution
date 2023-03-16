import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface OpenEditorInfo {
  editor: 'android' | 'ios'
  fileName: string
}

// Custom APIs for renderer
const api = {
  openEditor: (info: OpenEditorInfo): void => ipcRenderer.send('open-editor', info),
  download: (url: string): void => ipcRenderer.send('download', url)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
