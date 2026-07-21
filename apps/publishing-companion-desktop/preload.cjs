const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("publishingCompanion", {
  status: () => ipcRenderer.invoke("companion:status"),
  openDashboard: () => ipcRenderer.invoke("companion:open-dashboard"),
  installChrome: () => ipcRenderer.invoke("companion:install-chrome"),
  openData: () => ipcRenderer.invoke("companion:open-data"),
  openLogs: () => ipcRenderer.invoke("companion:open-logs"),
  copyCredentials: () => ipcRenderer.invoke("companion:copy-credentials"),
  setAutoStart: enabled => ipcRenderer.invoke("companion:set-auto-start", enabled),
  onStatusChanged: callback => ipcRenderer.on("companion:status-changed", callback),
});
