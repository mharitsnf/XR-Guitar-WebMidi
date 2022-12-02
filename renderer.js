
let selectedMidiInput = document.getElementById("midiInput").value
let selectedMidiOutput = document.getElementById("midiOutput").value

const initializeWebMidi = async () => {
    const midiIO = await webmidi.initWebMidi()

    const inputSelect = document.getElementById("midiInput")
    const outputSelect = document.getElementById("midiOutput")

    midiIO.inputs.forEach(element => {
        let option = document.createElement('option')
        option.text = element
        option.value = element
        inputSelect.add(option)
    });

    midiIO.outputs.forEach(element => {
        let option = document.createElement('option')
        option.text = element
        option.value = element
        outputSelect.add(option)
    });
}

const onInputChange = () => {
    const inputSelect = document.getElementById("midiInput")
    selectedMidiInput = inputSelect.value
    console.log(selectedMidiInput)
}

const onOutputChange = () => {
    const outputSelect = document.getElementById("midiOutput")
    selectedMidiOutput = outputSelect.value
    console.log(selectedMidiOutput)
}

initializeWebMidi()