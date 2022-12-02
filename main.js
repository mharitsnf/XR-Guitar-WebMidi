const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { WebMidiHandler } = require('./src/server/webmidihandler');

let webMidiHandler

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('index.html');
};

ipcMain.handle("initwebmidi", async () => {
    try {
        webMidiHandler = new WebMidiHandler()
        return await webMidiHandler.enable()
    } catch (error) {
        throw error
    }
})

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    webMidiHandler = null

    if (process.platform !== 'darwin') {
        app.quit();
    }
});