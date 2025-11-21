const SAMPLE_RATE = 16000;

// Audio worklet processor code as a string to be registered
const workletCode = `
  class AudioProcessor extends AudioWorkletProcessor {
    process(inputs: Float32Array[][]) {
      const input = inputs[0];
      if (input && input[0]) {
        const pcmBuffer = new Int16Array(input[0].length);
        for (let i = 0; i < input[0].length; i++) {
          const sample = Math.max(-1, Math.min(1, input[0][i]));
          pcmBuffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        this.port.postMessage(pcmBuffer.buffer, [pcmBuffer.buffer]);
      }
      return true;
    }
  }
  registerProcessor('audio-processor', AudioProcessor);
`;

// Create a blob URL for the worklet code
const workletBlob = new Blob([workletCode], { type: 'application/javascript' });
const workletUrl = URL.createObjectURL(workletBlob);

export async function startMicStreaming(onText: (text: string) => void) {
  // Set up the text callback
  window.transcribeAPI.onText(onText);

  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        sampleRate: SAMPLE_RATE,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });

    // Create audio context with the desired sample rate
    const audioContext = new AudioContext({
      sampleRate: SAMPLE_RATE,
      latencyHint: 'interactive'
    });

    // Add the worklet module
    try {
      await audioContext.audioWorklet.addModule(workletUrl);
    } catch (error) {
      console.error('Failed to load worklet module:', error);
      throw new Error('Audio processing initialization failed');
    }

    // Create a source node from the microphone stream
    const source = audioContext.createMediaStreamSource(stream);
    
    // Create an AudioWorkletNode
    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor', {
      channelCount: 1,
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: {}
    });

    // Handle messages from the worklet
    workletNode.port.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        window.transcribeAPI.sendChunk(event.data);
      }
    };

    // Connect the audio processing chain
    source.connect(workletNode);
    
    // Connect to destination to avoid errors (but we could also connect to a GainNode with gain 0)
    const destination = audioContext.createGain();
    destination.gain.value = 0; // Mute the output
    workletNode.connect(destination);
    destination.connect(audioContext.destination);

    // Start the audio context if it's in the suspended state
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Start the transcription
    window.transcribeAPI.start();

    // Return a cleanup function
    return () => {
      workletNode.disconnect();
      source.disconnect();
      destination.disconnect();
      stream.getTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(console.error);
      }
      window.transcribeAPI.stop();
    };
  } catch (error) {
    console.error('Error initializing audio:', error);
    throw error;
  }
}
