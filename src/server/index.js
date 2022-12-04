const { WebMidi } = require("webmidi")
const { WebSocketServer } = require("ws")
const { WebMidiHandler } = require("./midi")
const express = require("express")


const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const pitchMultiplier = 8

const expressApp = express()
const expressServer = expressApp.listen(4321, () => {
    console.log("Express running on 4321")
})


const wss = new WebSocketServer({ server: expressServer })


wss.on("connection", async ws => {

    console.log("connected");

    ws.send(JSON.stringify({ note: "A4", channel: 1, attack: 0.5 }))

    let webMidiHandler = new WebMidiHandler()

    let setupRes = await webMidiHandler.setupWebMidi(ws)
    if (!setupRes) {
        console.log("WebMidi setup failed!")
        return
    }

    const input = webMidiHandler.getInput("Fishman TriplePlay TP Guitar")
    const output = webMidiHandler.getOutput("IAC Driver Bus 1")

    let bBendingValue = 0

    input.addListener("pitchbend", e => {
        const channel = e.message.channel

        if (channel == 2) {
            bBendingValue = e.value
            output.channels[channel].sendPitchBend(clamp(bBendingValue * pitchMultiplier, -1, 1))
        } else {
            output.channels[channel].sendPitchBend(clamp(e.value * pitchMultiplier, -1, 1))
        }

        console.log(channel, e.value);

        ws.send(JSON.stringify({
            type: "pitchbend",
            channel: channel,
            note: "",
            attack: 0,
            pitchValue: e.value * pitchMultiplier,
        }))
    })

    input.addListener("noteon", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const _attack = e.note.attack
        const channel = e.message.channel

        console.log(channel)

        output.channels[channel].playNote(note, { attack: _attack })

        ws.send(JSON.stringify({
            type: "noteon",
            channel: channel,
            note: note,
            attack: _attack,
            pitchValue: 0,
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

    ws.on("message", (message, isBinary) => {
        const msg = isBinary ? message : JSON.parse(message.toString())
        if (!msg) return

        switch (msg.type) {
            case "pitchbend":
                bBendingValue += msg.pitchValue
                console.log(msg.pitchValue, "and", bBendingValue)
                output.channels[msg.channel].sendPitchBend(clamp(bBendingValue, -1, 1))
                bBendingValue = 0
            default:
                console.log(msg)
        }
    })

    ws.on("close", () => {
        input.removeListener()
        webMidiHandler = null
    })
})

// WebMidi
//     .enable()
//     .then(onEnabled)
//     .catch(err => console.error(err))

// function onEnabled() {
//     console.log("Webmidi enabled")

//     WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name))
//     console.log("=====")
//     WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name))

//     const input = WebMidi.getInputByName("Fishman TriplePlay TP Guitar")
//     const output = WebMidi.getOutputByName("IAC Driver Bus 1")

//     input.addListener("pitchbend", e => {
//         const channel = e.message.channel

//         output.channels[channel].sendPitchBend(e.value * 8)
//     })

//     input.addListener("noteon", e => {
//         const accidental = e.note.accidental
//         const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
//         const _attack = e.note.attack
//         const channel = e.message.channel

//         console.log(e)
//         output.channels[channel].playNote(note, { attack: _attack })
//     })

//     input.addListener("noteoff", e => {
//         const accidental = e.note.accidental
//         const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
//         const channel = e.message.channel

//         output.channels[channel].stopNote(note)
//     })
// }