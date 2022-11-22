const { WebMidi } = require("webmidi")
const { WebSocketServer } = require("ws")
const { WebMidiHandler } = require("./midi")
const express = require("express")

const expressApp = express()
const expressServer = expressApp.listen(4321, () => {
    console.log("Express running on 4321")
})

const wss = new WebSocketServer({ server: expressServer })


wss.on("connection", async ws => {

    ws.send(JSON.stringify({ note: "A4", channel: 1, attack: 0.5 }))

    let webMidiHandler = new WebMidiHandler()

    let setupRes = await webMidiHandler.setupWebMidi(ws)
    if (!setupRes) {
        console.log("WebMidi setup failed!")
        return
    }

    const input = webMidiHandler.getInput("Fishman TriplePlay TP Guitar")
    const output = webMidiHandler.getOutput("Apple DLS Synth")

    input.addListener("pitchbend", e => {
        const channel = e.message.channel
        output.channels[channel].sendPitchBend(e.value * 8)

        ws.send(JSON.stringify({
            type: "pitchbend",
            channel: channel,
            note: "",
            attack: 0,
            pitchValue: e.value * 8,
        }))
    })

    input.addListener("noteon", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const _attack = e.note.attack
        const channel = e.message.channel
        console.log(e)

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

        console.log(msg)

        // switch (msg.type) {
        //     default:
        //         console.log(msg)
        //         break
        // }
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

//     const input = WebMidi.getInputByName("Fishman TriplePlay TP Guitar")
//     const output = WebMidi.getOutputByName("Apple DLS Synth")

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