const speech = require('@google-cloud/speech');
require("dotenv").config();


const client = new speech.SpeechClient();

function blobToBase64(blob) {
    const buffer = Buffer.from(blob);
    return buffer.toString('base64');
}

module.exports = async (blob) => {

    console.log('Speech recieved in STT')

    const base64Audio = blobToBase64(blob);

    const config = {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'sv-SE',
      };

    const request = {
        audio: {
            content: base64Audio,
        },
        config: config,
    }

    console.log('Sending speech to Cloud STT')

    const [response] = await client.recognize(request);

    console.log('API Response:', JSON.stringify(response)); 

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);

  return transcription;
    
};

