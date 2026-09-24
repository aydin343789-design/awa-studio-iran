import { Download, FileAudio, Loader2, Play, Square } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  isBusy: boolean;
  disabled: boolean;
  onPlay: () => void;
  onStop: () => void;
  onDownloadWav: () => void;
  onDownloadMp3: () => void;
}

export function Controls({ isPlaying, isBusy, disabled, onPlay, onStop, onDownloadWav, onDownloadMp3 }: ControlsProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPlay}
          disabled={disabled || isBusy}
          className="relative flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying && <span className="absolute inset-0 rounded-xl bg-emerald-400/40 animate-pulse-ring" />}
          {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
          <span className="relative">پخش</span>
        </button>

        <button
          type="button"
          onClick={onStop}
          disabled={!isPlaying}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-5 py-3 font-medium text-slate-200 transition hover:border-rose-500/60 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square className="h-4 w-4" />
          توقف
        </button>

        <div className="mx-1 h-8 w-px bg-slate-700/60" />

        <button
          type="button"
          onClick={onDownloadWav}
          disabled={disabled || isBusy}
          className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 font-medium text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          WAV
        </button>

        <button
          type="button"
          onClick={onDownloadMp3}
          disabled={disabled || isBusy}
          className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileAudio className="h-4 w-4" />
          MP3
        </button>
      </div>
    </div>
  );
}
