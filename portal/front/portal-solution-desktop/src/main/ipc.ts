import { ipcMain, session, shell } from 'electron'
import compressing from 'compressing'

import { callEditor, openFile } from './utils'
import { DownloadFileResult } from '../preload/type'

const setUpDownload = (): void => {
  const downloadMap = new Map<
    string,
    {
      resolve: (value: DownloadFileResult) => void
      reject: (reason?: unknown) => void
    }
  >()
  ipcMain.handle('downloadFile', async (_, url) => {
    session.defaultSession.downloadURL(url)
    return new Promise((resolve, reject) => {
      downloadMap.set(url, {
        resolve,
        reject
      })
    })
  })

  session.defaultSession.on('will-download', (_, item) => {
    const fileName = item.getFilename()

    item.once('done', (_, result) => {
      if (result === 'completed') {
        downloadMap.get(item.getURL())?.resolve({
          fileName,
          filePath: item.getSavePath()
        })
        return
      }

      if (result === 'cancelled' || result === 'interrupted') {
        downloadMap.get(item.getURL())?.reject(new Error(result))
        return
      }
    })
  })
}

export const initIPC = (): void => {
  setUpDownload()

  ipcMain.handle('openEditor', (_, info) => {
    const { filePath, platform } = info
    return callEditor(platform, filePath)
  })

  ipcMain.handle('unzip', async (_, fileName, filePath) => {
    if (fileName.endsWith('.zip')) {
      return compressing.zip.uncompress(filePath, `${filePath.replace('/' + fileName, '')}`)
    }
    return Promise.reject(new TypeError(`不支持的文件类型：${filePath}`))
  })

  ipcMain.handle('openFile', async (_, filePath) => {
    return shell.openPath(filePath)
  })
}
