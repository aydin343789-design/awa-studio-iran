import { useCallback, useRef, useState } from 'react';
import type { SynthesisOptions } from '@/src/types';
import { synthesizeToAudioBuffer } from '@/src/utils/audioExporter';

export interface UseSpeechSynthesisResult {
  isPlaying: boolean;
  isSynthesizing: boolean;
  error: string | null;
  play: (options: SynthesisOptions) => Promise<void>;
  stop: () => void;
  renderForExport: (options: SynthesisOptions) => Promise<AudioBuffer>;
}

/**
 * Primary layer: window.speechSynthesis (built into the browser/WebView, no network).
 * Fallback layer: our own on-device formant synthesizer (audioExporter), used when
 * SpeechSynthesis is unavailable/empty, and always used for WAV/MP3 export since
 * SpeechSynthesis exposes no raw audio buffer.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        /* already stopped */
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playViaFallback = useCallback(async (options: SynthesisOptions) => {
    setIsSynthesizing(true);
    try {
      const buffer = await synthesizeToAudioBuffer(options);
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      sourceRef.current = source;
      setIsPlaying(true);
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      source.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تولید صدا');
      setIsPlaying(false);
    } finally {
      setIsSynthesizing(false);
    }
  }, []);

  const play = useCallback(
    async (options: SynthesisOptions) => {
      setError(null);
      if (!options.text.trim()) return;
      stop();

      const supportsSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
      const voices = supportsSpeechSynthesis ? window.speechSynthesis.getVoices() : [];
      const hasMatchingVoice = voices.some((v) =>
        options.language === 'fa' ? v.lang?.toLowerCase().startsWith('fa') : v.lang?.toLowerCase().startsWith('en'),
      );

      if (supportsSpeechSynthesis && hasMatchingVoice) {
        try {
          const utterance = new SpeechSynthesisUtterance(options.text);
          utterance.lang = options.language === 'fa' ? 'fa-IR' : 'en-US';
          const match = voices.find((v) =>
            options.language === 'fa' ? v.lang?.toLowerCase().startsWith('fa') : v.lang?.toLowerCase().startsWith('en'),
          );
          if (match) utterance.voice = match;
          utterance.rate = options.tone === 'excited' ? 1.2 : options.tone === 'sad' ? 0.85 : 1;
          utterance.pitch = options.voice === 'child' ? 1.6 : options.voice === 'female' ? 1.2 : 1;
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => {
            setIsPlaying(false);
            playViaFallback(options);
          };
          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          return;
        } catch {
          await playViaFallback(options);
          return;
        }
      }

      await playViaFallback(options);
    },
    [playViaFallback, stop],
  );

  const renderForExport = useCallback((options: SynthesisOptions) => synthesizeToAudioBuffer(options), []);

  return { isPlaying, isSynthesizing, error, play, stop, renderForExport };
}
