require("dotenv").config();
const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const { Readable } = require("stream");
const assistant = require("./assistant/assistant.js");
const thread = require("./assistant/thread.js");
const speechToText = require('./utils/speechToText.js');

let globalThreadId = null;

const currentThread = async () => {
  try {
    const result = await thread();
    return result.id;
  } catch (error) {
    console.error("Error fetching the current thread:", error);
    throw error;
  }
};

async function toAssistant(input) {
  try {
    const threadId = globalThreadId;
    const replyBuffer = await assistant(input, threadId)
    return replyBuffer;
  } catch (error) {
    console.error("Error getting reply:", error);
  }
}


const createWindow = () => {
  const window = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });


  window.loadFile("index.html");

  return window;
};

const initializeApp = async (window) => {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  while(true){
  try{
    globalThreadId = await currentThread();

    window.webContents.send('initialized');

    return;
  }catch(error){
    console.error("Error initializing:", error)
    await sleep(3000);
  }
}
}

app.whenReady().then(async () => {

  ipcMain.handle('askSven', async (event, data) => {
    try{
      console.log('Speech recieved on back-end');

      const transcription = await speechToText(data);

      if(transcription){
        console.log('Sending transcription to assistant');
  
        const replyBuffer = await toAssistant(transcription);

        return replyBuffer;
      }else{
        console.log('No input detected.')

        return null;
      }
    }catch(error){
      return error;
    }
  });

  const window = createWindow();

  initializeApp(window);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});