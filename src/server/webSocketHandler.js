const express = require("express")
const { WebSocketServer } = require("ws")
const { networkInterfaces } = require('os');

class WebSocketHandler {
    constructor() {
        const expressApp = express()
        this.expressServer = expressApp.listen(4321, () => {})
        this.wss = new WebSocketServer({ server: this.expressServer })

        const nets = networkInterfaces();
        const results = Object.create(null); // Or just '{}', an empty object

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }

        this.ipAddress = results['en0'][0]
    }

    getIpAddress() {
        return this.ipAddress
    }

    getWebSocket() {
        return this.wss
    }

    stop() {
        this.wss.close()
        this.expressServer.close()
    }
}

module.exports = {
    WebSocketHandler: WebSocketHandler
}