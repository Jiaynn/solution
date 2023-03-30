export {}

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

interface ElectronBridgeApi {
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

declare global {
  interface Window {
    electronBridgeApi: ElectronBridgeApi
  }
}
