const { WebMidi } = require("webmidi")


class WebMidiHandler {
    constructor() {
        this.ws = null;
    }

    async setupWebMidi(ws) {
        try {
            this.ws = ws
            let enableRes = await WebMidi.enable()
            return enableRes
        } catch (error) {
            console.error(error)
            return null
        }
    }

    getInput(name) {
        return WebMidi.getInputByName(name)
    }

    getOutput(name) {
        return WebMidi.getOutputByName(name)
    }


}

module.exports = {
    WebMidiHandler: WebMidiHandler
}