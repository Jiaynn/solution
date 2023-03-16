import { app, shell, BrowserWindow, session, dialog, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import compressing from 'compressing'
import cmd from 'node-cmd'

import icon from '../../resources/icon.png?asset'

const pageUrl = `${import.meta.env.MAIN_VITE_BASE_URL}/solutions/lowcode`

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

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

  ipcMain.on('download', (_, url) => {
    mainWindow.webContents.downloadURL(url)
  })

  ipcMain.on('open-editor', (_, info) => {
    const { fileName, editor } = info
    const downloadsPath = app.getPath('downloads')
    const filePath = path.join(downloadsPath, fileName)
    const dest = path.join(downloadsPath, fileName.replace('.zip', ''))
    console.log('open-editor info', info)
    compressing.zip.uncompress(filePath, dest).then(() => {
      console.log('open-editor unzip done.', dest, process.platform)
      if (editor === 'android') {
        return cmd.run(`open -a /Applications/Android\\ Studio.app ${dest}`)
      }
      if (editor === 'ios') {
        return cmd.run(`open -a /Applications/Xcode.app ${dest}`)
      }
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  session.defaultSession.on('will-download', (_, item) => {
    const fileName = item.getFilename()
    const filePath = path.join(app.getPath('downloads'), fileName)
    console.log('will-download filePath', filePath)
    item.setSavePath(filePath)
    item.once('done', () => {
      console.log('will-download download done.')
      dialog.showMessageBox({ message: `${fileName}下载完成` })
    })
  })

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
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
