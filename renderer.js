"use strict";

const loadingContainer = document.getElementById("loadingcontainer");
const speakButton = document.getElementById("speakButton");
const stopSpeechButton = document.getElementById("stopSpeechButton");

window.electronAPI.onInitialized(() => {
  console.log("called");
  loadingContainer.classList.add("hidden");
  speakButton.classList.remove("hidden");
  stopSpeechButton.classList.remove("hidden");
});

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

speakButton.addEventListener("click", async () => {
  try {

    speakButton.classList.add("disabled");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);

    const silenceThreshold = -50;
    let audioData = new Float32Array(analyser.fftSize);

    mediaRecorder.ondataavailable = async (event) => {
      let chunks = [];

      chunks.push(event.data);

      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });

      const arrayBuffer = await blob.arrayBuffer();

      console.log("Sending audio and waiting for assistant...");

      console.log(arrayBuffer);

       const replyBuffer = await window.electronAPI.askSven(arrayBuffer);
      console.log("Reply recieved");

      console.log("Processing audio");
      playReply(replyBuffer);
      console.log("Done!");

      speakButton.classList.remove("disabled");
    };

    function calculateDecibles(audioData) {
      const rms = Math.sqrt(
        audioData.reduce((sum, value) => sum + value ** 2, 0) / audioData.length
      );
      const decibels = 20 * Math.log10(rms);

      return decibels;
    }

    async function detectSilence() {

      async function detectSilenceMechanism(){
        analyser.getFloatTimeDomainData(audioData);
        console.log("Detecting silence");
  

        const check = calculateDecibles(audioData)
  
        console.log(check);
  
        if(check < silenceThreshold && check != '-Infinity'){
          await new Promise((resolve) => setTimeout(resolve, 1000));
  
          analyser.getFloatTimeDomainData(audioData);
          const newCheck = calculateDecibles(audioData);

          console.log("New check ", newCheck);
  
          if(newCheck < silenceThreshold && newCheck != '-Infinity'){
            console.log("Silence detected, stopping recording...");
            mediaRecorder.stop();
          }
        }
  
        if (mediaRecorder.state === "recording") {
          requestAnimationFrame(detectSilenceMechanism);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      detectSilenceMechanism();

    }

    mediaRecorder.start();

    console.log(mediaRecorder.state);
    console.log("Recorder started");

    detectSilence();

    stopSpeechButton.addEventListener("click", () => {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("Recorder stopped");
    });
  } catch (error) {
    console.error("An error occured", error);
  }
});
