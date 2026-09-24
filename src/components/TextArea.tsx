import type { Language } from '@/src/types';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  maxLength?: number;
}

export function TextArea({ value, onChange, language, maxLength = 2000 }: TextAreaProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300">
          {language === 'fa' ? 'فارسی تشخیص داده شد' : 'English detected'}
        </span>
        <span className={`text-xs ${value.length > maxLength ? 'text-rose-400' : 'text-slate-500'}`}>
          {value.length.toLocaleString('fa-IR')} / {maxLength.toLocaleString('fa-IR')}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        dir="auto"
        rows={6}
        placeholder="متن فارسی یا انگلیسی خود را اینجا بنویسید…"
        className="w-full resize-none rounded-xl bg-slate-950/60 p-4 text-base text-slate-100 placeholder:text-slate-600 outline-none ring-1 ring-slate-800 transition focus:ring-2 focus:ring-emerald-500/60"
      />
    </div>
  );
}
