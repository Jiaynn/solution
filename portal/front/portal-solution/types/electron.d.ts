export {}

interface EditorInfo {
  editor: 'android' | 'iOS',
  fileName: string
}

interface Api {
  openEditor: (info: EditorInfo) => void,
  download: (url: string) => void
}

declare global {
  interface Window {
    api: Api
  }
}
