// Type definitions for global window extensions
declare global {
  interface Window {
    // Transcribe API for speech-to-text
    transcribeAPI: {
      onText: (callback: (text: string) => void) => void;
      sendChunk: (chunk: ArrayBuffer) => void;
      start: () => void;
      stop: () => void;
    };
  }
}

export {};
