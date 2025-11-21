import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { TranscribeSession } from "../ipc/transcribe";


let mainWindow: BrowserWindow | null = null;
let session: TranscribeSession | null = null;


const isDev = process.env.NODE_ENV === 'development';

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

  if (isDev) {
    // In development, load from Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

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
