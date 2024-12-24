"use strict";

function bufferToLink(buffer) {
  const blob = new Blob([buffer], { type: "audio/mp3" });
  return URL.createObjectURL(blob);
}

function playReply(buffer) {
  const audioLink = bufferToLink(buffer);
  const audio = new Audio(audioLink);

  audio.play();
  audio.onended = () => URL.revokeObjectURL(audioLink);
}

const speakButton = document.getElementById("speakButton");

speakButton.addEventListener("click", async () => {
  try {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();

    console.log(mediaRecorder.state);
    console.log("Recorder started");

    const stopSpeechButton = document.getElementById("stopSpeechButton");

    stopSpeechButton.addEventListener("click", () => {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("Recorder stopped");
    });

    mediaRecorder.ondataavailable = async (event) => {
      let chunks = [];

      chunks.push(event.data);

      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });

      const arrayBuffer = await blob.arrayBuffer();

      console.log('Sending audio and waiting for assistant...');

      console.log(arrayBuffer);

      const replyBuffer = await window.electronAPI.askSven(arrayBuffer);
      console.log('Reply recieved')

      console.log("Processing audio");
      playReply(replyBuffer);
      console.log("Done!");
    };


  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
});