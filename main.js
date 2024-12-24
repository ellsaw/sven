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

const initializeApp = async () => {
  try{
    globalThreadId = await currentThread();
  }catch(error){
    console.error("Error initializing")
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });


  win.loadFile("index.html");
};

app.whenReady().then(() => {
  initializeApp();

  ipcMain.handle('askSven', async (event, data) => {
    try{
      console.log('Speech recieved on back-end');

      const transcription = await speechToText(data);

      console.log('Sending transcription to assistant');

      const replyBuffer = await toAssistant(transcription);

      return replyBuffer;
    }catch(error){
      return error;
    }
  });



  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


ipcMain.on('input', (event, data) => {
  console.log(`Recieved input ${data}`)
  toAssistant(data);
})