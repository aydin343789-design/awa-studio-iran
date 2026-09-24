import { Baby, User, UserRound } from 'lucide-react';
import type { VoiceType } from '@/src/types';

const VOICES: { id: VoiceType; label: string; icon: typeof User }[] = [
  { id: 'male', label: 'مرد', icon: User },
  { id: 'female', label: 'زن', icon: UserRound },
  { id: 'child', label: 'کودک', icon: Baby },
];

interface VoiceSelectorProps {
  value: VoiceType;
  onChange: (voice: VoiceType) => void;
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-xl">
      <h3 className="mb-3 text-sm font-medium text-slate-300">نوع صدا</h3>
      <div className="grid grid-cols-3 gap-2">
        {VOICES.map(({ id, label, icon: Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition ${
                active
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700/50 bg-slate-950/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
