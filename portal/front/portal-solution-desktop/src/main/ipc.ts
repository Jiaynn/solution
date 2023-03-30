import { app, ipcMain, session } from 'electron'
import compressing from 'compressing'

import { callEditor, openFile } from './utils'

const setUpDownload = (): void => {
  const downloadMap = new Map()
  ipcMain.handle('downloadFile', async (_, url) => {
    session.defaultSession.downloadURL(url)
    return new Promise((resolve) => {
      downloadMap.set(url, resolve)
    })
  })

  session.defaultSession.on('will-download', (_, item) => {
    const fileName = item.getFilename()

    item.once('done', () => {
      downloadMap.get(item.getURL())({
        fileName,
        filePath: item.getSavePath()
      })
    })
  })
}

export const initIPC = (): void => {
  setUpDownload()

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
