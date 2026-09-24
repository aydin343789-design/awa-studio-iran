import type { ToneProfile, ToneType, VoiceProfile, VoiceType } from '@/src/types';

export interface PhonemeDef {
  /** First, second, third formant center frequencies in Hz (adult male reference). */
  f1: number;
  f2: number;
  f3: number;
  /** Relative gain of each formant band, 0..1. */
  gains: [number, number, number];
  /** true = driven by the harmonic (voiced) source, false = driven by noise (unvoiced). */
  voiced: boolean;
  /** For fricative/noisy sounds: extra high-frequency noise emphasis, 0..1. */
  frication: number;
  /** Base duration in milliseconds at a neutral speaking rate. */
  durationMs: number;
}

export const PAUSE_SYMBOL = '·';

/** Base phoneme table. Frequencies are reference (adult male); scaled per-voice at render time. */
export const PHONEME_TABLE: Record<string, PhonemeDef> = {
  // ---- Persian long & short vowels ----
  'a': { f1: 700, f2: 1300, f3: 2500, gains: [1, 0.7, 0.3], voiced: true, frication: 0, durationMs: 130 }, // فتحه/آ کوتاه
  'aa': { f1: 750, f2: 1150, f3: 2400, gains: [1, 0.65, 0.25], voiced: true, frication: 0, durationMs: 200 }, // ا (آ)
  'e': { f1: 500, f2: 1900, f3: 2600, gains: [0.9, 0.8, 0.3], voiced: true, frication: 0, durationMs: 120 }, // کسره
  'i': { f1: 300, f2: 2300, f3: 3000, gains: [0.8, 0.9, 0.35], voiced: true, frication: 0, durationMs: 180 }, // ی
  'o': { f1: 500, f2: 900, f3: 2400, gains: [0.9, 0.6, 0.25], voiced: true, frication: 0, durationMs: 120 }, // ضمه
  'u': { f1: 320, f2: 700, f3: 2300, gains: [0.85, 0.55, 0.2], voiced: true, frication: 0, durationMs: 180 }, // و (بلند)
  // ---- Persian consonants ----
  'b': { f1: 200, f2: 1100, f3: 2200, gains: [0.6, 0.5, 0.2], voiced: true, frication: 0.05, durationMs: 70 },
  'p': { f1: 200, f2: 1100, f3: 2200, gains: [0.3, 0.3, 0.15], voiced: false, frication: 0.15, durationMs: 80 },
  't': { f1: 250, f2: 1700, f3: 2600, gains: [0.3, 0.4, 0.25], voiced: false, frication: 0.2, durationMs: 70 },
  'd': { f1: 250, f2: 1700, f3: 2600, gains: [0.6, 0.5, 0.25], voiced: true, frication: 0.05, durationMs: 65 },
  'k': { f1: 300, f2: 1900, f3: 2700, gains: [0.35, 0.4, 0.2], voiced: false, frication: 0.2, durationMs: 80 },
  'g': { f1: 300, f2: 1900, f3: 2700, gains: [0.6, 0.5, 0.2], voiced: true, frication: 0.05, durationMs: 70 },
  'q': { f1: 350, f2: 900, f3: 1800, gains: [0.55, 0.45, 0.2], voiced: true, frication: 0.1, durationMs: 85 }, // ق (uvular plosive/fricative)
  'gh': { f1: 350, f2: 950, f3: 1900, gains: [0.5, 0.45, 0.25], voiced: true, frication: 0.35, durationMs: 90 }, // غ (uvular fricative)
  'kh': { f1: 400, f2: 1300, f3: 2100, gains: [0.25, 0.35, 0.3], voiced: false, frication: 0.55, durationMs: 100 }, // خ (velar/uvular fricative)
  'f': { f1: 300, f2: 1200, f3: 2600, gains: [0.15, 0.3, 0.4], voiced: false, frication: 0.6, durationMs: 100 },
  'v': { f1: 300, f2: 1200, f3: 2400, gains: [0.4, 0.4, 0.25], voiced: true, frication: 0.3, durationMs: 85 },
  's': { f1: 300, f2: 1500, f3: 4000, gains: [0.1, 0.2, 0.6], voiced: false, frication: 0.75, durationMs: 110 },
  'z': { f1: 300, f2: 1500, f3: 3600, gains: [0.4, 0.4, 0.4], voiced: true, frication: 0.4, durationMs: 90 },
  'sh': { f1: 300, f2: 1800, f3: 3600, gains: [0.15, 0.3, 0.65], voiced: false, frication: 0.75, durationMs: 120 }, // ش
  'zh': { f1: 300, f2: 1800, f3: 3400, gains: [0.4, 0.4, 0.4], voiced: true, frication: 0.4, durationMs: 95 }, // ژ
  'ch': { f1: 300, f2: 1900, f3: 3500, gains: [0.2, 0.3, 0.55], voiced: false, frication: 0.65, durationMs: 110 }, // چ
  'j': { f1: 300, f2: 1900, f3: 3300, gains: [0.45, 0.4, 0.4], voiced: true, frication: 0.35, durationMs: 90 },
  'h': { f1: 400, f2: 1400, f3: 2400, gains: [0.2, 0.25, 0.2], voiced: false, frication: 0.4, durationMs: 80 },
  'm': { f1: 250, f2: 1100, f3: 2200, gains: [0.7, 0.4, 0.15], voiced: true, frication: 0, durationMs: 90 },
  'n': { f1: 250, f2: 1500, f3: 2500, gains: [0.7, 0.4, 0.15], voiced: true, frication: 0, durationMs: 90 },
  'l': { f1: 350, f2: 1200, f3: 2700, gains: [0.6, 0.5, 0.2], voiced: true, frication: 0, durationMs: 80 },
  'r': { f1: 400, f2: 1500, f3: 2000, gains: [0.55, 0.5, 0.2], voiced: true, frication: 0.1, durationMs: 60 },
  'w': { f1: 300, f2: 700, f3: 2200, gains: [0.5, 0.35, 0.15], voiced: true, frication: 0, durationMs: 70 },
  'y': { f1: 280, f2: 2200, f3: 2900, gains: [0.5, 0.5, 0.2], voiced: true, frication: 0, durationMs: 70 },
  '\'': { f1: 500, f2: 1200, f3: 2000, gains: [0.2, 0.15, 0.1], voiced: false, frication: 0.1, durationMs: 40 }, // ع/ء glottal stop
};

/** Base voice acoustic profiles. */
export const VOICE_PROFILES: Record<VoiceType, VoiceProfile> = {
  male: { baseFrequency: 120, formantScale: 1.0, breathiness: 0.06 },
  female: { baseFrequency: 220, formantScale: 1.18, breathiness: 0.08 },
  child: { baseFrequency: 300, formantScale: 1.35, breathiness: 0.1 },
};

/** Tone/emotion-driven prosody profiles. */
export const TONE_PROFILES: Record<ToneType, ToneProfile> = {
  normal: { rate: 1.0, pitchMultiplier: 1.0, amplitude: 0.85, vibrato: 0, pauseScale: 1.0 },
  news: { rate: 1.08, pitchMultiplier: 1.0, amplitude: 0.9, vibrato: 0, pauseScale: 0.85 },
  emotional: { rate: 0.9, pitchMultiplier: 1.03, amplitude: 0.85, vibrato: 4, pauseScale: 1.25 },
  happy: { rate: 1.12, pitchMultiplier: 1.15, amplitude: 0.95, vibrato: 5, pauseScale: 0.9 },
  sad: { rate: 0.82, pitchMultiplier: 0.9, amplitude: 0.65, vibrato: 2, pauseScale: 1.4 },
  excited: { rate: 1.22, pitchMultiplier: 1.22, amplitude: 1.0, vibrato: 7, pauseScale: 0.75 },
};
