const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getClassData: () => ipcRenderer.invoke('get-class-data'),
    readExcel: (filePath) => ipcRenderer.invoke('read-excel', filePath),
    ttsSpeakText: (text) => ipcRenderer.invoke('tts-speak', text)
});
