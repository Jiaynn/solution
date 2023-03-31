export interface EditorInfo {
  /**
   * 平台
   */
  platform: 'android' | 'ios'
  /**
   * 文件路径
   */
  filePath: string
}

export interface DownloadFileResult {
  /**
   * 文件名
   */
  fileName: string
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
  /**
   * 下载文件
   * @param url
   */
  downloadFile: (url: string) => Promise<DownloadFileResult>
}
