import { CONFIG } from '../config.js';
import { NOUNS } from './strings.js';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export const otherLang = (lang) => (lang === 'ar' ? 'en' : 'ar');

// Text for the current language, falling back to the other one so a
// half-translated field never shows up empty to visitors.
export function pick(value, lang, { fallback = true } = {}) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const own = value[lang];
  if (own && own.trim()) return own;
  return fallback ? value[otherLang(lang)] || '' : '';
}

export function digits(input, lang) {
  const s = String(input ?? '');
  if (lang !== 'ar' || !CONFIG.arabicDigits) return s;
  return s.replace(/[0-9]/g, (d) => AR_DIGITS[d]);
}

export function latinDigits(input) {
  return String(input ?? '')
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

export const pad2 = (n) => String(n).padStart(2, '0');

export function countLabel(n, noun, lang) {
  const forms = (NOUNS[noun] || NOUNS.piece)[lang];
  const cat = new Intl.PluralRules(lang).select(n);
  const tpl = forms[cat] ?? forms.other;
  return digits(tpl.replace('{n}', String(n)), lang);
}

const locale = (lang) =>
  lang === 'ar' ? (CONFIG.arabicDigits ? 'ar-u-nu-arab' : 'ar-u-nu-latn') : 'en-GB';

// "2024-04" -> "Apr 2024" / "أبريل ٢٠٢٤"
export function formatMonth(ym, lang) {
  if (!ym) return '';
  const [y, m] = String(ym).split('-').map(Number);
  if (!y) return '';
  if (!m) return digits(y, lang);
  return new Intl.DateTimeFormat(locale(lang), {
    month: lang === 'ar' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

export const yearOf = (ym) => (ym ? String(ym).slice(0, 4) : '');
