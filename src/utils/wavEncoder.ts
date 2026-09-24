/** Encodes an AudioBuffer into a 16-bit PCM WAV Blob at its native sample rate. */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function audioBufferToPcm16(buffer: AudioBuffer): { left: Int16Array; right: Int16Array | null; sampleRate: number } {
  const left = new Int16Array(buffer.length);
  const chData0 = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, chData0[i]));
    left[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  let right: Int16Array | null = null;
  if (buffer.numberOfChannels > 1) {
    right = new Int16Array(buffer.length);
    const chData1 = buffer.getChannelData(1);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, chData1[i]));
      right[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  }
  return { left, right, sampleRate: buffer.sampleRate };
}
