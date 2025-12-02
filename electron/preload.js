const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("posSync", {
  syncNow: () => ipcRenderer.invoke("sync:now")
});


