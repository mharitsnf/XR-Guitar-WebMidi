const { WebMidi } = require("webmidi")
const { WebSocketServer } = require("ws")
const { WebMidiHandler } = require("./midi")
const express = require("express")


// const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

// const pitchMultiplier = 8

// const expressApp = express()
// const expressServer = expressApp.listen(4321, () => {
//     console.log("Express running on 4321")
// })


// const wss = new WebSocketServer({ server: expressServer })


// wss.on("connection", async ws => {

//     console.log("connected");

//     ws.send(JSON.stringify({
//         type: "noteon",
//         channel: 1,
//         note: "A4",
//         attack: 0,
//         pitchValue: 0,
//     }))

//     let webMidiHandler = new WebMidiHandler()

//     let setupRes = await webMidiHandler.setupWebMidi(ws)
//     if (!setupRes) {
//         console.log("WebMidi setup failed!")
//         return
//     }

//     const input = webMidiHandler.getInput("Fishman TriplePlay TP Guitar")
//     const outputs = {
//         bus1: WebMidi.getOutputByName("IAC Driver Bus 1"),
//         bus2: WebMidi.getOutputByName("IAC Driver Bus 2"),
//         bus3: WebMidi.getOutputByName("IAC Driver Bus 3"),
//         bus4: WebMidi.getOutputByName("IAC Driver Bus 4"),
//         bus5: WebMidi.getOutputByName("IAC Driver Bus 5"),
//         bus6: WebMidi.getOutputByName("IAC Driver Bus 6"),
//     }

//     let bBendingValue = 0

//     input.addListener("pitchbend", e => {
//         const channel = e.message.channel

//         console.log("bending channel: ", channel)

//         if (channel == 2) {
//             bBendingValue = e.value
//             outputs[`bus${channel}`].sendPitchBend(clamp(bBendingValue * pitchMultiplier, -1, 1))
//         } else {
//             outputs[`bus${channel}`].sendPitchBend(clamp(e.value * pitchMultiplier, -1, 1))
//         }

//         ws.send(JSON.stringify({
//             type: "pitchbend",
//             channel: channel,
//             note: "",
//             attack: 0,
//             pitchValue: e.value * pitchMultiplier,
//         }))
//     })

//     input.addListener("noteon", e => {
//         const accidental = e.note.accidental
//         const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
//         const _attack = e.note.attack
//         const channel = e.message.channel

//         console.log("noteon on channel: ", channel)

//         outputs[`bus${channel}`].playNote(note, { attack: _attack })

//         ws.send(JSON.stringify({
//             type: "noteon",
//             channel: channel,
//             note: note,
//             attack: _attack,
//             pitchValue: 0,
//         }))
//     })

//     input.addListener("noteoff", e => {
//         const accidental = e.note.accidental
//         const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
//         const channel = e.message.channel

//         console.log("noteon on channel: ", channel)

//         outputs[`bus${channel}`].stopNote(note)

//         ws.send(JSON.stringify({
//             type: "noteoff",
//             channel: channel,
//             note: note,
//             attack: 0,
//             pitchValue: 0,
//         }))
//     })

//     ws.on("message", (message, isBinary) => {
//         const msg = isBinary ? message : JSON.parse(message.toString())
//         if (!msg) return

//         switch (msg.type) {
//             case "pitchbend":
//                 bBendingValue += msg.pitchValue
//                 outputs[`bus2`].sendPitchBend(clamp(bBendingValue, -1, 1))
//                 bBendingValue = 0
//                 break
//             default:
//                 break
//         }
//     })

//     ws.on("close", () => {
//         input.removeListener()
//         webMidiHandler = null
//     })
// })

WebMidi
    .enable()
    .then(onEnabled)
    .catch(err => console.error(err))

function onEnabled() {
    console.log("Webmidi enabled")

    // WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name))
    // console.log("=====")
    WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name))

    const input = WebMidi.getInputByName("Fishman TriplePlay TP Guitar")
    const outputs = {
        bus1: WebMidi.getOutputByName("IAC Driver Bus 1"),
        bus2: WebMidi.getOutputByName("IAC Driver Bus 2"),
        bus3: WebMidi.getOutputByName("IAC Driver Bus 3"),
        bus4: WebMidi.getOutputByName("IAC Driver Bus 4"),
        bus5: WebMidi.getOutputByName("IAC Driver Bus 5"),
        bus6: WebMidi.getOutputByName("IAC Driver Bus 6"),
    }

    // console.log(output.channels[1])

    // output.channels[1].playNote("C4")
    // output.channels[2].playNote("E4")
    // outputs['bus1'].playNote("G4")
    // output.channels[3].sendPitchBend(1, { time: 1 })
    // output.channels[3].sendPitchBend(0.5, { time: "+500" })

    // const bendListener = (event) => {
    //     const channel = event.message.channel
    //     output.channels[channel].sendPitchBend(event.value * 8)
    // }

    // input.channels[1].addListener("pitchbend", bendListener)
    // input.channels[2].addListener("pitchbend", bendListener)
    // input.channels[3].addListener("pitchbend", bendListener)
    // input.channels[4].addListener("pitchbend", bendListener)
    // input.channels[5].addListener("pitchbend", bendListener)
    // input.channels[6].addListener("pitchbend", bendListener)

    input.addListener("pitchbend", e => {
        const channel = e.message.channel

        console.log(channel)
        
        outputs[`bus${channel}`].sendPitchBend(e.value * 8)
    })

    input.addListener("noteon", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const _attack = e.note.attack
        const channel = e.message.channel

        outputs[`bus${channel}`].playNote(note, { attack: _attack })
    })

    input.addListener("noteoff", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const channel = e.message.channel

        outputs[`bus${channel}`].stopNote(note)
    })
}

let midi = null;  // global MIDIAccess object
function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
}

function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
}

function onMidiMessage(event) {
    const noteOnMessage = [0x90, 60, 0x7f]
    output.send(noteOnMessage)
}


navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure)
    .then(() => {
        let input = midi.inputs.get("Fishman TriplePlay TP Guitar")
        let output = midi.outputs.get("IAC Driver Bus 1")
        // output.send([0x90, 60, 0x7f])

        input.onmidimessage = event => {
            data = [event.data[0].toString(), event.data[1], event.data[2]]
            console.log(data);
            output.send(data)
        }
    })