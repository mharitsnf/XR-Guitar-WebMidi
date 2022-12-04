
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
}

const onOutputChange = () => {
    const outputSelect = document.getElementById("midiOutput")
    selectedMidiOutput = outputSelect.value
}

const onStartServer = async () => {
    try {
        const ipAddress = await websocket.initWebSocket(selectedMidiInput, selectedMidiOutput)

        const ipAddressHtml = document.getElementById("ipaddress")
        ipAddressHtml.removeAttribute("hidden")
        ipAddressHtml.innerHTML = `Server is listening on ${ipAddress}:4322`

        document.getElementById("midiInput").setAttribute("disabled", "")
        document.getElementById("midiOutput").setAttribute("disabled", "")

        document.getElementById("startServerButton").setAttribute("hidden", "")
        document.getElementById("stopServerButton").removeAttribute("hidden")
    } catch (error) {
        console.error(error)
    }
}

const onStopServer = () => {
    websocket.stopWebSocket()

    document.getElementById("ipaddress").setAttribute("hidden", "")

    document.getElementById("midiInput").removeAttribute("disabled")
    document.getElementById("midiOutput").removeAttribute("disabled")

    document.getElementById("startServerButton").removeAttribute("hidden")
    document.getElementById("stopServerButton").setAttribute("hidden", "")
}

initializeWebMidi()