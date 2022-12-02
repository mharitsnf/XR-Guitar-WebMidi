const { WebMidi } = require("webmidi")


class WebMidiHandler {
    constructor() {
        this.ws = null;
    }

    async setupWebMidi(ws) {
        try {
            this.ws = ws
            await WebMidi.enable()

            WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name))
            WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name))

            return true
        } catch (error) {
            console.error(error)
            return false
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