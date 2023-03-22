export {}

interface EditorInfo {
  platform: 'Android' | 'iOS',
  filePath: string,
}

interface ElectronBridgeApi {
  openEditor: (info: EditorInfo) => void
  download: (url: string) => void
  getDownloadsPath: () => Promise<string>
}

declare global {
  interface Window {
    electronBridgeApi: ElectronBridgeApi
  }
}
