// Type definitions for Electron IPC and other global extensions
declare global {
  interface Window {
    // Transcribe API for speech-to-text
    transcribeAPI: {
      onText: (callback: (text: string) => void) => void;
      sendChunk: (chunk: ArrayBuffer) => void;
      start: () => void;
      stop: () => void;
    };

    // Electron IPC Renderer
    electron: {
      // Example IPC methods - add more as needed
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (
          channel: string, 
          listener: (event: any, ...args: any[]) => void
        ) => () => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        removeAllListeners: (channel: string) => void;
      };
      
      // Add other Electron APIs as needed
      // e.g., app, shell, dialog, etc.
    };

    // Add other global window extensions here
  }
}

// This file doesn't export anything since it's augmenting the global scope
export {};
