import type { SynthesisOptions } from '@/src/types';
import { PAUSE_SYMBOL, PHONEME_TABLE, TONE_PROFILES, VOICE_PROFILES } from './formants';
import { textToPhonemeSequence } from './persianDiacritics';

const SAMPLE_RATE = 44100;
const PAUSE_DURATION_SEC = 0.09;

function createNoiseBuffer(ctx: OfflineAudioContext, durationSec: number): AudioBuffer {
  const length = Math.max(1, Math.ceil(durationSec * SAMPLE_RATE));
  const buffer = ctx.createBuffer(1, length, SAMPLE_RATE);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * Renders text to an AudioBuffer entirely on-device using formant synthesis:
 * an OscillatorNode (voiced source) and a noise buffer (unvoiced/fricative source)
 * are each routed through three parallel BiquadFilter bandpass nodes tuned to the
 * phoneme's F1/F2/F3, summed, and shaped by a per-phoneme ADSR gain envelope.
 */
export async function synthesizeToAudioBuffer(options: SynthesisOptions): Promise<AudioBuffer> {
  const phonemes = textToPhonemeSequence(options.text, options.language);
  const voiceProfile = VOICE_PROFILES[options.voice];
  const toneProfile = TONE_PROFILES[options.tone];

  if (phonemes.length === 0) {
    const ctx = new OfflineAudioContext(1, Math.ceil(SAMPLE_RATE * 0.3), SAMPLE_RATE);
    return ctx.startRendering();
  }

  // Compute total duration up front so we can size the offline context.
  let totalSec = 0.05; // lead-in silence
  for (const symbol of phonemes) {
    if (symbol === PAUSE_SYMBOL) totalSec += PAUSE_DURATION_SEC * toneProfile.pauseScale;
    else totalSec += (PHONEME_TABLE[symbol]?.durationMs ?? 100) / 1000 / toneProfile.rate;
  }
  totalSec += 0.15; // tail for release/reverb-free decay

  const ctx = new OfflineAudioContext(1, Math.ceil(totalSec * SAMPLE_RATE), SAMPLE_RATE);

  // Voiced harmonic source.
  const harmonicOsc = ctx.createOscillator();
  harmonicOsc.type = 'sawtooth';

  // Vibrato (subtle pitch wobble), strength driven by the selected tone.
  const vibratoOsc = ctx.createOscillator();
  vibratoOsc.type = 'sine';
  vibratoOsc.frequency.value = 5.5;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = toneProfile.vibrato;
  vibratoOsc.connect(vibratoDepth).connect(harmonicOsc.frequency);

  // Unvoiced / fricative noise source.
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, totalSec);
  noiseSource.loop = false;

  const voicedGain = ctx.createGain();
  voicedGain.gain.value = 0;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0;
  harmonicOsc.connect(voicedGain);
  noiseSource.connect(noiseGain);

  const mixNode = ctx.createGain();
  mixNode.gain.value = 1;
  voicedGain.connect(mixNode);
  noiseGain.connect(mixNode);

  // Three parallel formant (bandpass) filters, each with its own relative gain.
  const filters = [ctx.createBiquadFilter(), ctx.createBiquadFilter(), ctx.createBiquadFilter()];
  const formantGains = [ctx.createGain(), ctx.createGain(), ctx.createGain()];
  const qValues = [6, 8, 10];
  filters.forEach((f, idx) => {
    f.type = 'bandpass';
    f.Q.value = qValues[idx];
    mixNode.connect(f);
    f.connect(formantGains[idx]);
  });

  const formantSum = ctx.createGain();
  formantGains.forEach((g) => g.connect(formantSum));

  const masterEnvelope = ctx.createGain();
  masterEnvelope.gain.value = 0.0001;
  formantSum.connect(masterEnvelope);
  masterEnvelope.connect(ctx.destination);

  harmonicOsc.start(0);
  vibratoOsc.start(0);
  noiseSource.start(0);

  let t = 0.05;
  for (const symbol of phonemes) {
    if (symbol === PAUSE_SYMBOL) {
      const dur = PAUSE_DURATION_SEC * toneProfile.pauseScale;
      masterEnvelope.gain.setValueAtTime(masterEnvelope.gain.value, t);
      masterEnvelope.gain.linearRampToValueAtTime(0.0001, t + Math.min(0.03, dur));
      t += dur;
      continue;
    }

    const def = PHONEME_TABLE[symbol];
    if (!def) continue;
    const durationSec = def.durationMs / 1000 / toneProfile.rate;

    const jitter = 1 + (Math.random() - 0.5) * 0.015; // tiny natural pitch jitter
    const f0 = voiceProfile.baseFrequency * toneProfile.pitchMultiplier * jitter;
    harmonicOsc.frequency.setTargetAtTime(f0, t, 0.02);

    filters[0].frequency.setTargetAtTime(def.f1 * voiceProfile.formantScale, t, 0.012);
    filters[1].frequency.setTargetAtTime(def.f2 * voiceProfile.formantScale, t, 0.012);
    filters[2].frequency.setTargetAtTime(def.f3 * voiceProfile.formantScale, t, 0.012);
    formantGains[0].gain.setTargetAtTime(def.gains[0], t, 0.01);
    formantGains[1].gain.setTargetAtTime(def.gains[1], t, 0.01);
    formantGains[2].gain.setTargetAtTime(def.gains[2], t, 0.01);

    voicedGain.gain.setTargetAtTime(def.voiced ? 1 : 0, t, 0.008);
    const noiseTarget = Math.max(def.frication, voiceProfile.breathiness * 0.3);
    noiseGain.gain.setTargetAtTime(noiseTarget, t, 0.008);

    // Per-phoneme ADSR envelope.
    const peak = toneProfile.amplitude;
    const attack = Math.max(0.008, durationSec * 0.18);
    const decay = durationSec * 0.15;
    const release = Math.max(0.008, durationSec * 0.22);
    const sustainLevel = peak * 0.82;
    const sustainStart = t + attack + decay;
    const releaseStart = Math.max(sustainStart, t + durationSec - release);

    masterEnvelope.gain.setValueAtTime(0.0001, t);
    masterEnvelope.gain.linearRampToValueAtTime(peak, t + attack);
    masterEnvelope.gain.linearRampToValueAtTime(sustainLevel, sustainStart);
    masterEnvelope.gain.setValueAtTime(sustainLevel, releaseStart);
    masterEnvelope.gain.linearRampToValueAtTime(0.0001, t + durationSec);

    t += durationSec;
  }

  const stopAt = t + 0.05;
  harmonicOsc.stop(stopAt);
  vibratoOsc.stop(stopAt);
  noiseSource.stop(stopAt);

  return ctx.startRendering();
}
