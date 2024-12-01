require("dotenv").config();
const textToSpeech = require('./speech')
const { OpenAI } = require("openai");
const assistant_id = process.env.ASSISTANT_ID;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function reply(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId)
  return messages.data[0].content[0].text.value;
}

async function main(userInput, threadId) {
  try {
    console.log("Adding user message...");
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userInput,
    });

    console.log("Running assistant...");
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistant_id,
    });

    console.log("Assistant replying...")
    const response = await reply(threadId)
    console.log(`Assistant replied with: ${response}`)

    console.log("Getting speech...")
    try{
      const speech = await textToSpeech(response);
      console.log("Sending speech to main...")
      return speech;
    }catch(error){
      console.error("Could not process speech.")
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = main;