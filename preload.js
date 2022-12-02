const { contextBridge, ipcRenderer } = require('electron')

const WebMidi = {
    initWebMidi: () => ipcRenderer.invoke("initwebmidi")
}

contextBridge.exposeInMainWorld('webmidi', WebMidi)