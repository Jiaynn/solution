import { join } from 'path'
import { BrowserWindow, session, shell, app } from 'electron'
import cmd from 'node-cmd'

import { pageUrl } from './config'
import { EditorInfo } from '../preload/type'

import icon from '../../resources/logo2.png?asset'

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
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      webSecurity: false
    }
  })

  app.dock.setIcon(icon)
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
  mainWindow.loadURL(pageUrl, {
    extraHeaders: 'pragma: no-cache\n'
  })

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

export const callEditor = (platform: EditorInfo['platform'], dest: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    if (process.platform === 'darwin') {
      // 运行在 macOS 上
      if (platform === 'android') {
        cmd.run(`open -a /Applications/Android\\ Studio.app ${dest}`, (err, data) => {
          if (!err) {
            return resolve(data)
          }
          return reject(err)
        })
        return
      }
      if (platform === 'ios') {
        cmd.run(`open -a /Applications/Xcode.app ${dest}`, (err, data) => {
          if (!err) {
            return resolve(data)
          }
          return reject(err)
        })
      }
    }
    if (process.platform === 'win32') {
      // 运行在 Windows 上
      // ...
      return reject(new TypeError('暂不支持 Windows 平台'))
    }
    if (process.platform === 'linux') {
      // 运行在 Linux 上
      // ...
      return reject(new TypeError('暂不支持 Linux 平台'))
    }
    reject(new TypeError('暂不支持当前平台'))
  })
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
