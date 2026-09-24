import type { Language } from '@/src/types';
import { PAUSE_SYMBOL, PHONEME_TABLE } from './formants';

/** Direct Persian letter -> phoneme table key. Persian's "special" letters
 * (خ ش چ ژ ق غ) are single Unicode characters, so no digraph handling is needed. */
const PERSIAN_CHAR_MAP: Record<string, string> = {
  'ا': 'aa', 'آ': 'aa', 'أ': 'aa', 'إ': 'aa',
  'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z',
  'ط': 't', 'ظ': 'z', 'ع': '\'', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g',
  'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'u',
  'ه': 'h', 'ی': 'i', 'ء': '\'',
};

/** Short-vowel diacritics attach a vowel phoneme to the preceding consonant. */
const DIACRITIC_MAP: Record<string, string> = {
  '\u064E': 'a', // فتحه
  '\u0650': 'e', // کسره
  '\u064F': 'o', // ضمه
};
const SHADDA = '\u0651'; // تشدید (gemination) — repeats the preceding consonant
const SUKUN = '\u0652'; // سکون — explicit "no vowel"
const TANWIN = new Set(['\u064B', '\u064C', '\u064D']);

/** A small dictionary of common words / names whose natural pronunciation
 * differs from a naive letter-by-letter reading. Keys are normalized (no diacritics). */
const PERSIAN_EXCEPTIONS: Record<string, string[]> = {
  'خدا': ['kh', 'o', 'd', 'aa'],
  'ایران': ['i', 'r', 'aa', 'n'],
  'آزاد': ['aa', 'z', 'aa', 'd'],
  'سلام': ['s', 'e', 'l', 'aa', 'm'],
  'ممنون': ['m', 'a', 'm', 'n', 'u', 'n'],
  'متشکرم': ['m', 'o', 't', 'e', 'sh', 'a', 'k', 'k', 'e', 'r', 'a', 'm'],
  'خیلی': ['kh', 'e', 'i', 'l', 'i'],
  'خوب': ['kh', 'u', 'b'],
  'بله': ['b', 'a', 'l', 'e'],
  'نه': ['n', 'a'],
  'صبح': ['s', 'o', 'b', 'h'],
  'بخیر': ['b', 'e', 'kh', 'e', 'i', 'r'],
};

export function normalizePersian(text: string): string {
  return text
    .replace(/\u0640/g, '') // remove tatweel
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200C\u200F\u200E]/g, ' ') // ZWNJ / directional marks -> space
    .trim();
}

function stripDiacritics(word: string): string {
  return word.replace(/[\u064B-\u0652]/g, '');
}

function persianWordToPhonemes(word: string): string[] {
  const bare = stripDiacritics(word);
  if (PERSIAN_EXCEPTIONS[bare]) return [...PERSIAN_EXCEPTIONS[bare]];

  const phonemes: string[] = [];
  const chars = Array.from(word);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch in DIACRITIC_MAP || ch === SHADDA || ch === SUKUN || TANWIN.has(ch)) continue; // handled via lookahead below
    const base = PERSIAN_CHAR_MAP[ch];
    if (!base) continue; // unknown symbol, skip silently

    const next = chars[i + 1];
    if (next === SHADDA) {
      phonemes.push(base, base); // gemination: pronounce consonant twice
      const afterShadda = chars[i + 2];
      if (afterShadda && DIACRITIC_MAP[afterShadda]) phonemes.push(DIACRITIC_MAP[afterShadda]);
      continue;
    }
    phonemes.push(base);
    if (next && DIACRITIC_MAP[next]) {
      phonemes.push(DIACRITIC_MAP[next]);
    }
  }
  return phonemes;
}

/** Very small English grapheme-to-phoneme approximator: common digraphs first,
 * then single letters. Good enough for intelligible rule-based (non-AI) synthesis. */
const ENGLISH_DIGRAPHS: [RegExp, string[]][] = [
  [/^sh/i, ['sh']], [/^ch/i, ['ch']], [/^th/i, ['s']], [/^ph/i, ['f']],
  [/^ng/i, ['n']], [/^qu/i, ['k', 'w']], [/^ee/i, ['i']], [/^oo/i, ['u']],
  [/^ea/i, ['i']], [/^ai/i, ['e', 'i']], [/^ay/i, ['e', 'i']],
  [/^ou/i, ['aa', 'u']], [/^ow/i, ['aa', 'u']], [/^oy/i, ['o', 'i']],
  [/^oi/i, ['o', 'i']], [/^ck/i, ['k']],
];
const ENGLISH_LETTER_MAP: Record<string, string> = {
  a: 'a', e: 'e', i: 'i', o: 'o', u: 'u',
  b: 'b', c: 'k', d: 'd', f: 'f', g: 'g', h: 'h', j: 'j', k: 'k',
  l: 'l', m: 'm', n: 'n', p: 'p', q: 'k', r: 'r', s: 's', t: 't',
  v: 'v', w: 'w', x: 's', y: 'i', z: 'z',
};

function englishWordToPhonemes(word: string): string[] {
  const phonemes: string[] = [];
  let i = 0;
  const lower = word.toLowerCase();
  while (i < lower.length) {
    const rest = lower.slice(i);
    const digraph = ENGLISH_DIGRAPHS.find(([re]) => re.test(rest));
    if (digraph) {
      phonemes.push(...digraph[1]);
      const matchLen = rest.match(digraph[0])?.[0].length ?? 2;
      i += matchLen;
      continue;
    }
    const letter = lower[i];
    const mapped = ENGLISH_LETTER_MAP[letter];
    if (mapped) phonemes.push(mapped);
    i += 1;
  }
  return phonemes;
}

/** Splits raw input into words and punctuation-driven pauses, then converts
 * each word to a flat phoneme symbol sequence (symbols index into PHONEME_TABLE),
 * using PAUSE_SYMBOL for silence between words/sentences. */
export function textToPhonemeSequence(rawText: string, language: Language): string[] {
  const text = language === 'fa' ? normalizePersian(rawText) : rawText.trim();
  const tokens = text.split(/(\s+|[.,،؛;:!؟?]+)/u).filter((t) => t.length > 0);

  const sequence: string[] = [];
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      sequence.push(PAUSE_SYMBOL);
      continue;
    }
    if (/^[.,،؛;:!؟?]+$/.test(token)) {
      sequence.push(PAUSE_SYMBOL, PAUSE_SYMBOL); // longer pause at punctuation
      continue;
    }
    const wordPhonemes = language === 'fa' ? persianWordToPhonemes(token) : englishWordToPhonemes(token);
    sequence.push(...wordPhonemes.filter((p) => p in PHONEME_TABLE));
  }
  // Collapse runs of pauses and trim leading/trailing silence.
  const collapsed: string[] = [];
  for (const s of sequence) {
    if (s === PAUSE_SYMBOL && collapsed[collapsed.length - 1] === PAUSE_SYMBOL) continue;
    collapsed.push(s);
  }
  while (collapsed[0] === PAUSE_SYMBOL) collapsed.shift();
  while (collapsed[collapsed.length - 1] === PAUSE_SYMBOL) collapsed.pop();
  return collapsed;
}
