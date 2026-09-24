// @ts-ignore -- lamejs ships without type declarations
import lamejs from 'lamejs';
import { audioBufferToPcm16 } from './wavEncoder';

/** Encodes an AudioBuffer into an MP3 Blob, fully on-device via lamejs (no network calls). */
export function audioBufferToMp3(buffer: AudioBuffer, kbps = 128): Blob {
  const { left, sampleRate } = audioBufferToPcm16(buffer);
  const channels = 1;
  const encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);

  const chunkSize = 1152;
  const mp3Chunks: Uint8Array[] = [];

  for (let i = 0; i < left.length; i += chunkSize) {
    const chunk = left.subarray(i, i + chunkSize);
    const encoded = encoder.encodeBuffer(chunk);
    if (encoded.length > 0) mp3Chunks.push(new Uint8Array(encoded));
  }
  const finalChunk = encoder.flush();
  if (finalChunk.length > 0) mp3Chunks.push(new Uint8Array(finalChunk));

  return new Blob(mp3Chunks as BlobPart[], { type: 'audio/mp3' });
}
