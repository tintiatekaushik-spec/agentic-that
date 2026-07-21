const api = window.publishingCompanion;
const byId = id => document.getElementById(id);

async function refreshStatus() {
  const status = await api.status();
  byId("version").textContent = status.version;
  byId("username").textContent = status.username;
  byId("password").textContent = status.password;
  byId("auto-start").checked = status.autoStart;
  byId("service-check").textContent = status.connected ? "Connected" : "Offline";
  byId("chrome-check").textContent = status.chromeInstalled ? "Installed" : "Required";
  byId("scheduler-check").textContent = status.connected ? "Running" : "Stopped";
  byId("status-dot").className = status.automationReady ? "ready" : "error";
  byId("status-title").textContent = status.automationReady ? "Ready to publish" : status.connected ? "Google Chrome is required" : "Companion needs attention";
  byId("status-detail").textContent = status.automationReady
    ? "Uploads, schedules and saved account sessions are available."
    : status.connected
      ? "Install Google Chrome, then restart this app."
      : status.error || "The local scheduler could not start.";
}

byId("refresh").addEventListener("click", refreshStatus);
byId("open-dashboard").addEventListener("click", () => api.openDashboard());
byId("install-chrome").addEventListener("click", () => api.installChrome());
byId("open-data").addEventListener("click", () => api.openData());
byId("open-logs").addEventListener("click", () => api.openLogs());
byId("copy-credentials").addEventListener("click", async event => {
  await api.copyCredentials();
  const button = event.currentTarget;
  button.textContent = "Copied";
  setTimeout(() => { button.textContent = "Copy login"; }, 1400);
});
byId("auto-start").addEventListener("change", event => api.setAutoStart(event.currentTarget.checked));
api.onStatusChanged(refreshStatus);
void refreshStatus();
setInterval(refreshStatus, 5000);
