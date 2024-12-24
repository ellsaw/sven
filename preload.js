const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    askSven: (data) => ipcRenderer.invoke('askSven', data),
});

