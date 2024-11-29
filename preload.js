const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    svenInputPreload: (data) => ipcRenderer.send('input', data),
});