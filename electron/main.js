const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#F4F5FB",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  const url = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(url);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Start background sync worker
  require("./sync-worker");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("sync:now", async () => {
  const { runSyncOnce } = require("../lib/sync/syncClient.js");
  const apiBaseUrl = process.env.SYNC_API_BASE_URL || "https://your-vercel-app.vercel.app";
  const deviceId = app.getPath("userData");
  await runSyncOnce(apiBaseUrl, deviceId);
  return true;
});


