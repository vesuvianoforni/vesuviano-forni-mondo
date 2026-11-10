export function encodeCallWav(chunks: readonly Float32Array[], sampleRate: number): Blob {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new ArrayBuffer(44 + length * 2), view = new DataView(bytes);
  const tag = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
  tag(0, 'RIFF'); view.setUint32(4, 36 + length * 2, true); tag(8, 'WAVE'); tag(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); tag(36, 'data'); view.setUint32(40, length * 2, true);
  let offset = 44;
  for (const chunk of chunks) for (const value of chunk) {
    const sample = Math.max(-1, Math.min(1, value)); view.setInt16(offset, sample * (sample < 0 ? 32768 : 32767), true); offset += 2;
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

// Keeps the existing phone media untouched; both sources are mixed only into a silent recording graph.
export async function createCallRecorder(local: MediaStream, onPart: (file: File, ordinal: number, seconds: number) => void) {
  const context = new AudioContext(); await context.resume();
  const mix = context.createGain(); mix.gain.value = 0.5;
  const localSource = context.createMediaStreamSource(local); localSource.connect(mix);
  let remoteSource: MediaStreamAudioSourceNode | undefined, remoteId: string | undefined;
  const processor = context.createScriptProcessor(4096, 1, 1), silent = context.createGain(); silent.gain.value = 0;
  mix.connect(processor); processor.connect(silent); silent.connect(context.destination);
  let chunks: Float32Array[] = [], frames = 0, ordinal = 0, stopped = false, active = false;
  const flush = () => {
    if (!frames) return;
    const seconds = Math.max(1, Math.round(frames / context.sampleRate));
    const file = new File([encodeCallWav(chunks, context.sampleRate)], `conversation-${ordinal}.wav`, { type: 'audio/wav' });
    onPart(file, ordinal++, seconds); chunks = []; frames = 0;
  };
  processor.onaudioprocess = event => {
    if (!active || stopped) return;
    const chunk = new Float32Array(event.inputBuffer.getChannelData(0)); chunks.push(chunk); frames += chunk.length;
    if (frames >= context.sampleRate * 60) flush();
  };
  return {
    attachRemote(stream: MediaStream) {
      if (stream.id === remoteId || stopped || !stream.getAudioTracks().length) return;
      remoteSource?.disconnect(); remoteSource = context.createMediaStreamSource(stream); remoteSource.connect(mix); remoteId = stream.id;
    },
    start() { active = true; },
    async stop() {
      if (stopped) return ordinal;
      stopped = true; flush(); processor.onaudioprocess = null; processor.disconnect(); silent.disconnect(); localSource.disconnect(); remoteSource?.disconnect();
      await context.close(); return ordinal;
    },
  };
}