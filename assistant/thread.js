const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

function thread() {
  return new Promise ( async (resolve, reject) => {
    console.log("Creating a new thread...");
    try{
        const thread = await openai.beta.threads.create();
        console.log("Thread created with ID:", thread.id);
        resolve(thread)
    }catch(error){
      reject(error)
    }
  })
};

module.exports = thread;
