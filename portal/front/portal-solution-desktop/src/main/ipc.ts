import { join } from 'path'
import { app, BrowserWindow, ipcMain, session } from 'electron'
import compressing from 'compressing'

import { callEditor } from './utils'

const unzip = (fileName: string, filePath: string, suffix: string): Promise<void> => {
  if (suffix === '.zip') {
    const source = `${filePath}/${fileName}${suffix}`
    console.log('unzip dest', source)
    return compressing.zip.uncompress(source, filePath)
  }
  return Promise.reject(new TypeError(`不支持的文件类型：${suffix}`))
}

const registerWillDownload = (mainWindow: BrowserWindow): void => {
  session.defaultSession.on('will-download', (_, item) => {
    const fileName = item.getFilename()
    const filePath = join(app.getPath('downloads'), fileName)
    item.setSavePath(filePath)

    mainWindow.webContents.send('downloadStatus', {
      code: 0,
      message: `${fileName}下载中`
    })

    item.once('done', () => {
      mainWindow.webContents.send('downloadStatus', {
        code: 1,
        message: `${fileName}下载成功`
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

  ipcMain.handle('unzip', async (_, fileName, filePath, suffix) => {
    return unzip(fileName, filePath, suffix)
  })
}
