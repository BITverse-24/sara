import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { TranscribeSession } from "../ipc/transcribe";

let mainWindow: BrowserWindow | null = null;
let session: TranscribeSession | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("transcribe:start", async (event) => {
  if (!mainWindow) return;
  if (session) {
    // Already running
    return;
  }
  session = new TranscribeSession(mainWindow);
  session.start().catch(err => {
    console.error("Transcribe error", err);
    session = null;
  });
});

ipcMain.on("transcribe:stop", () => {
  if (session) {
    session.close();
    session = null;
  }
});

// Receive audio chunks from renderer
ipcMain.on("transcribe:chunk", (event, chunk: ArrayBuffer) => {
  if (!session) return;
  session.pushChunk(Buffer.from(chunk));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
