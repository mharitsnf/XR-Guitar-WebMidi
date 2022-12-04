const { contextBridge, ipcRenderer } = require('electron')

const WebMidi = {
    initWebMidi: () => ipcRenderer.invoke("initwebmidi"),
}

const WebSocket = {
    initWebSocket: (inputMidi, outputMidi) => ipcRenderer.invoke("initwebsocket", inputMidi, outputMidi),
    stopWebSocket: () => ipcRenderer.send("stopwebsocket")
}

contextBridge.exposeInMainWorld('webmidi', WebMidi)
contextBridge.exposeInMainWorld('websocket', WebSocket)