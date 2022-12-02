const { WebMidi } = require("webmidi")


class WebMidiHandler {
    constructor() {
        this.ws = null;
    }

    async enable() {
        try {
            await WebMidi.enable()

            return {
                inputs: WebMidi.inputs.map(val => val.name),
                outputs: WebMidi.outputs.map(val => val.name)
            }
        } catch (error) {
            throw error
        }
    }

    setWebSocket(ws) {
        this.ws = ws
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