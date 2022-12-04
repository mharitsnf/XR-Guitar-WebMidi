const { WebMidi } = require("webmidi")

class WebMidiHandler {
    constructor() {
        this.bBendingValue = 0
        this.pitchMultiplier = 8
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

    clamp(num, min, max) {
        Math.min(Math.max(num, min), max)
    }

    startListening(wss, inputName, outputName) {
        wss.on("connection", async ws => {
            const input = WebMidi.getInputByName(inputName)
            const output = WebMidi.getOutputByName(outputName)

            input.addListener("noteon", e => {
                const accidental = e.note.accidental
                const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
                const _attack = e.note.attack
                const channel = e.message.channel

                output.channels[channel].playNote(note, { attack: _attack })

                ws.send(JSON.stringify({
                    type: "noteon",
                    channel: channel,
                    note: note,
                    attack: _attack,
                    pitchValue: 0,
                }))
            })

            input.addListener("pitchbend", e => {
                const channel = e.message.channel

                if (channel == 2) {
                    this.bBendingValue = e.value
                    output.channels[channel].sendPitchBend(clamp(bBendingValue * this.pitchMultiplier, -1, 1))
                } else {
                    output.channels[channel].sendPitchBend(clamp(e.value * this.pitchMultiplier, -1, 1))
                }

                ws.send(JSON.stringify({
                    type: "pitchbend",
                    channel: channel,
                    note: "",
                    attack: 0,
                    pitchValue: e.value * 8,
                }))
            })

            input.addListener("noteoff", e => {
                const accidental = e.note.accidental
                const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
                const channel = e.message.channel

                output.channels[channel].stopNote(note)

                ws.send(JSON.stringify({
                    type: "noteoff",
                    channel: channel,
                    note: note,
                    attack: 0,
                    pitchValue: 0,
                }))
            })

            ws.on("close", () => {
                input.removeListener()
            })
        })
    }
}

module.exports = {
    WebMidiHandler: WebMidiHandler
}