import type { Language } from '@/src/types';

const PERSIAN_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Detects whether the given text is predominantly Persian (Arabic-script) or English.
 * Counts script-bearing characters only; falls back to English when the text is empty
 * or contains no letters from either script.
 */
export function detectLanguage(text: string): Language {
  let persianCount = 0;
  let latinCount = 0;

  for (const char of text) {
    if (PERSIAN_RANGE.test(char)) {
      persianCount++;
    } else if (/[A-Za-z]/.test(char)) {
      latinCount++;
    }
  }

  if (persianCount === 0 && latinCount === 0) return 'fa';
  return persianCount >= latinCount ? 'fa' : 'en';
}
