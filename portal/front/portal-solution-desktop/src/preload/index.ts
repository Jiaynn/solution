import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI, IpcRendererEvent } from '@electron-toolkit/preload'

interface EditorInfo {
  /**
   * 平台
   */
  platform: 'Android' | 'iOS'
  /**
   * 文件路径
   */
  filePath: string
}

export interface ElectronBridgeApi {
  /**
   * 打开编辑器
   * @param info
   */
  openEditor: (info: EditorInfo) => Promise<unknown>
  /**
   * 获取下载路径
   */
  getDownloadsPath: () => Promise<string>
  /**
   * 获取下载状态
   * @param callback
   */
  getDownloadStatus: (
    callback: (
      event: IpcRendererEvent,
      result: {
        /**
         * 状态码
         * 0 下载中，1 下载完成
         */
        code: number
        /**
         * 消息
         */
        message: string
        data?: {
          fileName: string
          filePath: string
        } | null
      }
    ) => void
  ) => void
  /**
   * 解压
   * @param fileName
   * @param filePath
   */
  unzip: (fileName: string, filePath: string) => Promise<void>
  /**
   * 打开文件
   * @param filePath
   */
  openFile: (filePath: string) => Promise<string>
}

// Custom APIs for renderer
const electronBridgeApi: ElectronBridgeApi = {
  openEditor: (info) => ipcRenderer.invoke('openEditor', info),
  getDownloadsPath: () => ipcRenderer.invoke('getDownloadsPath'),
  getDownloadStatus: (callback) => ipcRenderer.on('downloadStatus', callback),
  unzip: (fileName, filePath) => ipcRenderer.invoke('unzip', fileName, filePath),
  openFile: (filePath) => ipcRenderer.invoke('openFile', filePath)
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
