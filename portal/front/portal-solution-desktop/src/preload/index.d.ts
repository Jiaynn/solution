import { ElectronAPI } from '@electron-toolkit/preload'

import { ElectronBridgeApi } from '.'

declare global {
  interface Window {
    electron: ElectronAPI
    electronBridgeApi: ElectronBridgeApi
  }
}
