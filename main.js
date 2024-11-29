require("dotenv").config();
const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const { Readable } = require("stream");
const assistant = require("./assistant/assistant.js");
const thread = require("./assistant/thread.js");

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
    const reply = await assistant(input, threadId);
    console.log(reply);
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
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });


  win.loadFile("index.html");
};

app.whenReady().then(() => {
  initializeApp();
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
  toAssistant(data);
})