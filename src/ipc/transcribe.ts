// main/transcribe.ts
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  TranscriptEvent,
  LanguageCode,
  MediaEncoding,
} from "@aws-sdk/client-transcribe-streaming";
import { ipcMain, BrowserWindow } from "electron";
import { Readable } from "stream";

const REGION = process.env.AWS_REGION || "ap-south-1";

const transcribeClient = new TranscribeStreamingClient({
  region: REGION,
  // For production, use a proper credential provider or Cognito
});

type Chunk = Buffer;

export class TranscribeSession {
  private chunkQueue: Chunk[] = [];
  private waitingResolvers: ((value: IteratorResult<any>) => void)[] = [];
  private closed = false;

  constructor(private win: BrowserWindow) {}

  pushChunk(chunk: Chunk) {
    if (this.closed) return;
    if (this.waitingResolvers.length) {
      const resolve = this.waitingResolvers.shift()!;
      resolve({ value: { AudioEvent: { AudioChunk: chunk } }, done: false });
    } else {
      this.chunkQueue.push(chunk);
    }
  }

  close() {
    this.closed = true;
    while (this.waitingResolvers.length) {
      const resolve = this.waitingResolvers.shift()!;
      resolve({ value: undefined, done: true });
    }
  }

  private async *audioStream() {
    while (!this.closed) {
      if (this.chunkQueue.length) {
        const chunk = this.chunkQueue.shift()!;
        yield { AudioEvent: { AudioChunk: chunk } };
      } else {
        // Wait for next chunk through a promise
        const value = await new Promise<IteratorResult<any>>(resolve => {
          this.waitingResolvers.push(resolve);
        });
        if (value.done) return;
        yield value.value;
      }
    }
  }

  async start() {
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: LanguageCode.EN_US,
      MediaEncoding: MediaEncoding.PCM,
      MediaSampleRateHertz: 16000,
      AudioStream: this.audioStream(),
    });

    const response = await transcribeClient.send(command);

    for await (const event of response.TranscriptResultStream ?? []) {
      const transcriptEvent = event as TranscriptEvent;
      const results = transcriptEvent.Transcript?.Results ?? [];
      for (const result of results) {
        if (!result.IsPartial && result.Alternatives && result.Alternatives.length > 0) {
          const text = result.Alternatives[0].Transcript ?? "";
          if (text.trim().length > 0) {
            this.win.webContents.send("transcribe:text", text);
          }
        }
      }
    }
  }
}
