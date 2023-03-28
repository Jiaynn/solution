import { join } from 'path'
import { BrowserWindow, dialog, session, shell } from 'electron'
import cmd from 'node-cmd'

import { pageUrl } from './config'
import { ElectronBridgeApi } from '../preload'

import icon from '../../resources/logo.png?asset'

export const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const minWidth = 1280
  const minHeight = 800
  const mainWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    show: false,
    autoHideMenuBar: true,
    title: '七牛低代码平台',
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

export const setUpResponseHeader = (): void => {
  session.defaultSession.webRequest.onHeadersReceived(
    {
      urls: [
        'https://portal.qiniu.com/*',
        'https://sso.qiniu.com/*',
        'https://developer.qiniu.com/*',
        'https://segmentfault.com/*'
      ]
    },
    (details, callback) => {
      const resHeadersStr = JSON.stringify(Object.keys(details.responseHeaders || {}))
      const removeHeaders = ['X-Frame-Options', 'Content-Security-Policy'] // 在这里把你想要移除的header头部添加上，代码中已经实现了忽略大小了，所以不用担心匹配不到大小写的问题
      removeHeaders.forEach((header) => {
        const regPattern = new RegExp(header, 'ig')
        const matchResult = resHeadersStr.match(regPattern)
        if (matchResult && matchResult.length) {
          matchResult.forEach((i) => {
            delete details.responseHeaders?.[i]
          })
        }
      })
      callback({ cancel: false, responseHeaders: details.responseHeaders })
    }
  )
}
