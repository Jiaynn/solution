import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain, session } from 'electron'
import compressing from 'compressing'

import { callEditor } from './utils'

export const initRendererToMain = (mainWindow: BrowserWindow): void => {
  ipcMain.on('download', (_, url) => {
    mainWindow.webContents.downloadURL(url)
  })
  session.defaultSession.on('will-download', (_, item) => {
    const fileName = item.getFilename()
    const filePath = join(app.getPath('downloads'), fileName)
    console.log('will-download filePath', filePath)
    item.setSavePath(filePath)
    item.once('done', () => {
      console.log('will-download download done.')
      const suffix = fileName.split('.').pop()
      if (suffix === 'zip') {
        compressing.zip
          .uncompress(filePath, filePath.replace(`.${suffix}`, ''))
          .then(() => {
            console.log('compressing.zip.uncompress success')
            return dialog.showMessageBox({ message: `${fileName}下载完成` })
          })
          .catch((err) => {
            console.log('compressing.zip.uncompress error', err)
            return dialog.showMessageBox({ message: `${fileName}下载失败` })
          })
        return
      }
      dialog.showMessageBox({ message: '不支持的格式' })
    })
  })

  ipcMain.on('openEditor', (_, info) => {
    const { filePath, platform } = info
    console.log('openEditor', info)
    callEditor(platform, filePath)
  })

  ipcMain.on('getDownloadsPath', (_, value) => {
    console.log('getDownloadPath', value)
  })
  ipcMain.handle('getDownloadsPath', async () => {
    return app.getPath('downloads')
  })
}
