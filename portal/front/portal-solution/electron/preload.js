const { contextBridge, ipcRenderer } = require('electron')

// Custom APIs for renderer
const api = {
  openEditor: info => ipcRenderer.send('open-editor', info),
  download: url => ipcRenderer.send('download', url)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
