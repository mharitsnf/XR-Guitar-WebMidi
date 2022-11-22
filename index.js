const { WebMidi } = require("webmidi")


WebMidi
    .enable()
    .then(onEnabled)
    .catch(err => console.error(err))

function onEnabled() {
    console.log("Webmidi enabled")

    console.log("Inputs -----")
    WebMidi.inputs.forEach(input => {
        console.log(input.name)
    })

    // console.log("Outputs -----")
    // WebMidi.outputs.forEach(output => {
    //     console.log(output.name)
    // })

    const input = WebMidi.getInputByName("Fishman TriplePlay TP Guitar")
    const output = WebMidi.getOutputByName("Apple DLS Synth")
    let pitchbends = [0, 0, 0, 0, 0, 0]

    input.addListener("pitchbend", e => {
        const channel = e.message.channel

        output.channels[channel].sendPitchBend(e.value * 10)
    })

    input.addListener("noteon", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const _attack = e.note.attack
        const channel = e.message.channel

        console.log(e)


        output.channels[channel].playNote(note, { attack: _attack })
    })

    input.addListener("noteoff", e => {
        const accidental = e.note.accidental
        const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
        const channel = e.message.channel

        output.channels[channel].stopNote(note)
    })


}

function noteOnListener(e) {
    const accidental = e.note.accidental
    const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
    const _attack = e.note.attack
    const channel = e.message.channel

    output.channels[channel].playNote(note, { attack: _attack })
}

function noteOffListener(e) {
    const accidental = e.note.accidental
    const note = accidental ? e.note.name + accidental + e.note.octave : e.note.name + e.note.octave
    const channel = e.message.channel

    output.channels[channel].stopNote(note)
}