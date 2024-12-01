"use strict"
const svenInput = document.getElementById('svenInput')

svenInput.addEventListener('submit', async (event) => {
    event.preventDefault();
    svenInput.classList.add("disabled");
    document.activeElement.blur()

    const formData = new FormData(svenInput);

    const data = Object.fromEntries(formData)

    console.log ('Waiting for assisstant...')
   const replyBuffer = await window.electronAPI.askSven(data.input)

   console.log("Processing audio")
   playReply(replyBuffer);
   console.log("Done!")
   svenInput.classList.remove("disabled");
})

function bufferToLink(buffer) {
    const blob = new Blob([buffer], { type: 'audio/mp3'});
    return URL.createObjectURL(blob);
};

function playReply(buffer) { 
    const audioLink = bufferToLink(buffer)
    const audio = new Audio(audioLink)

    audio.play();
    audio.onended = () => URL.revokeObjectURL(audioLink)
}