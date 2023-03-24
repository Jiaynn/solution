import { join } from 'path'
import { BrowserWindow, dialog, session, shell } from 'electron'
import cmd from 'node-cmd'

import { pageUrl } from './config'
import { ElectronBridgeApi } from '../preload'

import icon from '../../resources/logo.png?asset'

export const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const minWidth = 1024
  const minHeight = 768
  const mainWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    }
  })

  mainWindow.center()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  mainWindow.loadURL(pageUrl)

  return mainWindow
}

export const persistentCookie = (): void => {
  session.defaultSession.cookies.on('changed', (_, cookie) => {
    if (cookie.session && cookie.name === 'PORTAL_SESSION') {
      session.defaultSession.cookies.set({
        url: pageUrl,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
        sameSite: cookie.sameSite
      })
    }
  })
}

type Platform = Parameters<ElectronBridgeApi['openEditor']>[0]['platform']
export const callEditor = (platform: Platform, dest: string): void => {
  if (process.platform === 'darwin') {
    // 运行在 macOS 上
    if (platform === 'Android') {
      cmd.run(`open -a /Applications/Android\\ Studio.app ${dest}`)
      return
    }
    if (platform === 'iOS') {
      cmd.run(`open -a /Applications/Xcode.app ${dest}`)
      return
    }
  }
  if (process.platform === 'win32') {
    // 运行在 Windows 上
    // ...
    return
  }
  if (process.platform === 'linux') {
    // 运行在 Linux 上
    // ...
  }
  dialog.showMessageBox({ message: '打开失败，请检查编辑器是否安装或项目是否存在' })
}
