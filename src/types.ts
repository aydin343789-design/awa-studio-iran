export type VoiceType = 'male' | 'female' | 'child';

export type ToneType = 'normal' | 'news' | 'emotional' | 'happy' | 'sad' | 'excited';

export type Language = 'fa' | 'en';

export interface ToneProfile {
  rate: number; // relative speech speed multiplier
  pitchMultiplier: number; // multiplier applied to voice base frequency
  amplitude: number; // 0..1
  vibrato: number; // Hz of pitch wobble, 0 = none
  pauseScale: number; // multiplier on inter-word / punctuation pauses
}

export interface VoiceProfile {
  baseFrequency: number; // Hz, fundamental (F0)
  formantScale: number; // scales formant frequencies (head size proxy)
  breathiness: number; // 0..1 noise mix
}

export interface HistoryEntry {
  id: string;
  text: string;
  language: Language;
  voice: VoiceType;
  tone: ToneType;
  createdAt: number;
  durationSec: number;
  wavBase64: string;
}

export interface SynthesisOptions {
  text: string;
  language: Language;
  voice: VoiceType;
  tone: ToneType;
}
