require("dotenv").config();
const fs = require('fs')
const path = require('path')
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

async function createSpeech(input) {
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'onyx',
            input: input
        })
        const buffer = Buffer.from(await mp3.arrayBuffer());
        return buffer;
}

module.exports = createSpeech;