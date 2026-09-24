import { History, Play, Trash2 } from 'lucide-react';
import type { HistoryEntry } from '@/src/types';

const VOICE_LABEL: Record<string, string> = { male: 'مرد', female: 'زن', child: 'کودک' };
const TONE_LABEL: Record<string, string> = {
  normal: 'معمولی', news: 'خبری', emotional: 'احساسی', happy: 'شاد', sad: 'غمگین', excited: 'هیجان‌زده',
};

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onReplay: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryPanel({ entries, onReplay, onClear }: HistoryPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <History className="h-4 w-4" />
          تاریخچه پخش
        </h3>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            پاک کردن
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-600">هنوز صدایی تولید نشده است</p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{entry.text}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {VOICE_LABEL[entry.voice]} · {TONE_LABEL[entry.tone]} · {entry.durationSec.toFixed(1)} ثانیه
                </p>
              </div>
              <button
                type="button"
                onClick={() => onReplay(entry)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 transition hover:bg-emerald-500/25"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
