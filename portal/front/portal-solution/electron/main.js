const { app, BrowserWindow, session, dialog, ipcMain } = require("electron");
const path = require("path");
const compressing = require("compressing");
const cmd = require("node-cmd");

const env = process.env.NODE_ENV || "dev";

const baseUrlMap = {
  dev: "http://localhost:3000",
  staging: "http://portalv4.dev.qiniu.io",
  prod: "https://portal.qiniu.com"
};

const pageUrl = `${baseUrlMap[env]}/solutions/lowcode`;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL(pageUrl);

  session.defaultSession.on("will-download", (_, item) => {
    const fileName = item.getFilename();
    const filePath = path.join(app.getPath("downloads"), fileName);
    console.log("will-download filePath", filePath);
    item.setSavePath(filePath);
    item.once("done", () => {
      console.log("will-download download done.");
      dialog.showMessageBox({ message: `${fileName}下载完成` });
    });
  });

  ipcMain.on("download", (_, url) => {
    win.webContents.downloadURL(url);
  });

  ipcMain.on("open-editor", (_, info) => {
    const { fileName, editor } = info;
    const downloadsPath = app.getPath("downloads");
    const filePath = path.join(downloadsPath, fileName);
    const dest = path.join(downloadsPath, fileName.replace(".zip", ""));
    console.log("open-editor info", info);
    compressing.zip.uncompress(filePath, dest).then(() => {
      console.log("open-editor unzip done.", dest, process.platform);
      if (editor === "android") {
        return cmd.run(`open -a /Applications/Android\\ Studio.app ${dest}`);
      }
      if (editor === "iOS") {
        return cmd.run(`open -a /Applications/Xcode.app ${dest}`);
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  session.defaultSession.cookies.on("changed", (event, cookie, cause, removed) => {
    if (cookie.session && cookie.name === "PORTAL_SESSION") {
      session.defaultSession.cookies.set({
        url: pageUrl,
        ...cookie,
        expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
      });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
