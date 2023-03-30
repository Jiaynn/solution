import { app, BrowserWindow, ipcMain, session } from 'electron'
import compressing from 'compressing'

import { callEditor, openFile } from './utils'

const registerWillDownload = (mainWindow: BrowserWindow): void => {
  session.defaultSession.on('will-download', (_, item) => {
    const fileName = item.getFilename()

    mainWindow.webContents.send('downloadStatus', {
      code: 0,
      message: `${fileName}下载中`,
      data: null
    })

    item.once('done', () => {
      console.log('done')
      mainWindow.webContents.send('downloadStatus', {
        code: 1,
        message: `${fileName}下载成功`,
        data: {
          fileName,
          filePath: item.getSavePath()
        }
      })
    })
  })
}

export const initIPC = (mainWindow: BrowserWindow): void => {
  registerWillDownload(mainWindow)

  ipcMain.handle('openEditor', (_, info) => {
    const { filePath, platform } = info
    return callEditor(platform, filePath)
  })

  ipcMain.handle('getDownloadsPath', async () => {
    return app.getPath('downloads')
  })

  ipcMain.handle('unzip', async (_, fileName, filePath) => {
    if (fileName.endsWith('.zip')) {
      return compressing.zip.uncompress(filePath, `${filePath.replace('/' + fileName, '')}`)
    }
    return Promise.reject(new TypeError(`不支持的文件类型：${filePath}`))
  })

  ipcMain.handle('openFile', async (_, filePath) => {
    return openFile(filePath)
  })
}
