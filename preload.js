const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widget', {
  openMenu: () => ipcRenderer.send('open-menu'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  onSettings: (cb) => ipcRenderer.on('settings', (_e, s) => cb(s)),
  fitHeight: (h) => ipcRenderer.send('fit-height', h)
});
