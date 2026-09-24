import type { ToneType } from '@/src/types';

const TONES: { id: ToneType; label: string }[] = [
  { id: 'normal', label: 'معمولی' },
  { id: 'news', label: 'خبری' },
  { id: 'emotional', label: 'احساسی' },
  { id: 'happy', label: 'شاد' },
  { id: 'sad', label: 'غمگین' },
  { id: 'excited', label: 'هیجان‌زده' },
];

interface ToneSelectorProps {
  value: ToneType;
  onChange: (tone: ToneType) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-xl">
      <h3 className="mb-3 text-sm font-medium text-slate-300">لحن بیان</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TONES.map(({ id, label }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                active
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                  : 'border-slate-700/50 bg-slate-950/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
