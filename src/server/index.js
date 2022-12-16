const { WebMidi } = require("webmidi")
const { WebSocketServer } = require("ws")
const { WebMidiHandler } = require("./midi")
const express = require("express")


// ========================= USING WEBSOCKET =========================

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const pitchMultiplier = 8

const expressApp = express()
const expressServer = expressApp.listen(4321, () => {
    console.log("Express running on 4321")
})


const wss = new WebSocketServer({ server: expressServer })


wss.on("connection", async ws => {

    console.log("connected");

    // Sending test data to Unity
    ws.send(JSON.stringify({
        type: "noteon",
        channel: 1,
        note: "A4",
        attack: 0,
        pitchValue: 0,
    }))

    let webMidiHandler = new WebMidiHandler()

    let setupRes = await webMidiHandler.setupWebMidi(ws)
    if (!setupRes) {
        console.log("WebMidi setup failed!")
        return
    }

    const input = webMidiHandler.getInput("Fishman TriplePlay TP Guitar")
    const outputs = {
        bus1: WebMidi.getOutputByName("IAC Driver Bus 1"),
        bus2: WebMidi.getOutputByName("IAC Driver Bus 2"),
        bus3: WebMidi.getOutputByName("IAC Driver Bus 3"),
        bus4: WebMidi.getOutputByName("IAC Driver Bus 4"),
        bus5: WebMidi.getOutputByName("IAC Driver Bus 5"),
        bus6: WebMidi.getOutputByName("IAC Driver Bus 6"),
    }

    let bBendingValue = 0

    // Listener for pitchbending
    input.addListener("pitchbend", e => {
        const channel = e.message.channel

        console.log("bending channel: ", channel)

        if (channel == 2) {
            bBendingValue = e.value
            outputs[`bus${channel}`].sendPitchBend(clamp(bBendingValue * pitchMultiplier, -1, 1))
        } else {
            outputs[`bus${channel}`].sendPitchBend(clamp(e.value * pitchMultiplier, -1, 1))
        }

        ws.send(JSON.stringify({
            type: "pitchbend",
            channel: channel,
            note: "",
            attack: 0,
            pitchValue: e.value * pitchMultiplier,
        }))
    })

    // Listener for note on
    input.addListener("noteon", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const _attack = e.note.attack
        const channel = e.message.channel

        console.log("noteon on channel: ", channel)

        outputs[`bus${channel}`].playNote(note, { attack: _attack })

        ws.send(JSON.stringify({
            type: "noteon",
            channel: channel,
            note: note,
            attack: _attack,
            pitchValue: 0,
        }))
    })

    // Listener for note off
    input.addListener("noteoff", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const channel = e.message.channel

        console.log("noteon on channel: ", channel)

        outputs[`bus${channel}`].stopNote(note)

        ws.send(JSON.stringify({
            type: "noteoff",
            channel: channel,
            note: note,
            attack: 0,
            pitchValue: 0,
        }))
    })

    // Process data sent by the VR 
    ws.on("message", (message, isBinary) => {
        const msg = isBinary ? message : JSON.parse(message.toString())
        if (!msg) return

        switch (msg.type) {
            case "pitchbend":
                bBendingValue += msg.pitchValue
                outputs[`bus2`].sendPitchBend(clamp(bBendingValue, -1, 1))
                bBendingValue = 0
                break
            default:
                break
        }
    })

    ws.on("close", () => {
        input.removeListener()
        webMidiHandler = null
    })
})

// ========================= WITHOUT WEBSOCKET =========================

// WebMidi
//     .enable()
//     .then(onEnabled)
//     .catch(err => console.error(err))

// function onEnabled() {
//     console.log("Webmidi enabled")

//     // Printing out the list of inputs and outputs
//     // WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name))
//     // console.log("=====")
//     // WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name))

//     const input = WebMidi.getInputByName("Fishman TriplePlay TP Guitar")
//     const outputs = {
//         bus1: WebMidi.getOutputByName("IAC Driver Bus 1"),
//         bus2: WebMidi.getOutputByName("IAC Driver Bus 2"),
//         bus3: WebMidi.getOutputByName("IAC Driver Bus 3"),
//         bus4: WebMidi.getOutputByName("IAC Driver Bus 4"),
//         bus5: WebMidi.getOutputByName("IAC Driver Bus 5"),
//         bus6: WebMidi.getOutputByName("IAC Driver Bus 6"),
//     }

//     input.addListener("pitchbend", e => {
//         const channel = e.message.channel

//         console.log(channel)
        
//         outputs[`bus${channel}`].sendPitchBend(e.value * 8)
//     })

//     input.addListener("noteon", e => {
//         const accidental = e.note.accidental
//         const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
//         const _attack = e.note.attack
//         const channel = e.message.channel

//         outputs[`bus${channel}`].playNote(note, { attack: _attack })
//     })

//     input.addListener("noteoff", e => {
//         const accidental = e.note.accidental
//         const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
//         const channel = e.message.channel

//         outputs[`bus${channel}`].stopNote(note)
//     })
// }