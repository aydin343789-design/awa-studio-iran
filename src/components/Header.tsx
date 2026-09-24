import { AudioWaveform } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/40 px-5 py-3 backdrop-blur-xl">
        <AudioWaveform className="h-7 w-7 text-emerald-400" />
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">آوای ایران آزاد</h1>
      </div>
      <p className="max-w-md text-sm text-slate-400">
        تبدیل متن فارسی و انگلیسی به گفتار، کاملاً آفلاین و بدون نیاز به اینترنت یا سرویس‌های ابری
      </p>
    </header>
  );
}
