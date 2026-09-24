import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Header } from '@/src/components/Header';
import { TextArea } from '@/src/components/TextArea';
import { VoiceSelector } from '@/src/components/VoiceSelector';
import { ToneSelector } from '@/src/components/ToneSelector';
import { Controls } from '@/src/components/Controls';
import { HistoryPanel } from '@/src/components/HistoryPanel';
import { useSpeechSynthesis } from '@/src/hooks/useSpeechSynthesis';
import { detectLanguage } from '@/src/utils/languageDetect';
import { audioBufferToWav } from '@/src/utils/wavEncoder';
import { audioBufferToMp3 } from '@/src/utils/mp3Encoder';
import { base64ToBlob, blobToBase64, clearHistory, loadHistory, saveHistoryEntry } from '@/src/utils/history';
import type { HistoryEntry, ToneType, VoiceType } from '@/src/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceType>('male');
  const [tone, setTone] = useState<ToneType>('normal');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const { isPlaying, isSynthesizing, error, play, stop, renderForExport } = useSpeechSynthesis();

  const language = useMemo(() => detectLanguage(text), [text]);
  const canAct = text.trim().length > 0;

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const options = { text, language, voice, tone } as const;

  const handlePlay = async () => {
    if (!canAct) return;
    await play(options);

    try {
      const buffer = await renderForExport(options);
      const wavBlob = audioBufferToWav(buffer);
      const base64 = await blobToBase64(wavBlob);
      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        text,
        language,
        voice,
        tone,
        createdAt: Date.now(),
        durationSec: buffer.duration,
        wavBase64: base64,
      };
      setHistory(saveHistoryEntry(entry));
    } catch {
      // History logging is best-effort; playback itself already happened.
    }
  };

  const handleDownload = async (format: 'wav' | 'mp3') => {
    if (!canAct) return;
    setIsExporting(true);
    try {
      const buffer = await renderForExport(options);
      const blob = format === 'wav' ? audioBufferToWav(buffer) : audioBufferToMp3(buffer);
      downloadBlob(blob, `avaye-iran-azad.${format}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReplay = (entry: HistoryEntry) => {
    const blob = base64ToBlob(entry.wavBase64, 'audio/wav');
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Header />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <TextArea value={text} onChange={setText} language={language} />
        </motion.div>

        <VoiceSelector value={voice} onChange={setVoice} />
        <ToneSelector value={tone} onChange={setTone} />

        <Controls
          isPlaying={isPlaying}
          isBusy={isSynthesizing || isExporting}
          disabled={!canAct}
          onPlay={handlePlay}
          onStop={stop}
          onDownloadWav={() => handleDownload('wav')}
          onDownloadMp3={() => handleDownload('mp3')}
        />

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <HistoryPanel entries={history} onReplay={handleReplay} onClear={handleClearHistory} />

        <footer className="pt-4 text-center text-xs text-slate-600">
          تمامی پردازش‌ها به‌صورت کامل روی دستگاه شما و بدون اتصال به اینترنت انجام می‌شود
        </footer>
      </div>
    </div>
  );
}
