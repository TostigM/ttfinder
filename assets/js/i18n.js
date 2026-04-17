// TTFinder — Internationalisation (i18n)
// Loads locale JSON on demand; provides t() for all UI strings.

export const SUPPORTED_LANGS = ['en', 'fr', 'de', 'es', 'ja', 'pt', 'it', 'sv'];

const LANG_LABELS = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  ja: '日本語',
  pt: 'Português',
  it: 'Italiano',
  sv: 'Svenska',
};

const base = window.TTFinder?.base ?? '';

let _locale  = 'en';
let _strings = {};

async function loadLocale(lang) {
  const res = await fetch(`${base}/assets/locales/${lang}.json`);
  if (!res.ok) throw new Error(`Locale not found: ${lang}`);
  _strings = await res.json();
  _locale  = lang;
  document.documentElement.lang = lang;
}

/** Call once at app startup before any rendering. */
export async function initI18n() {
  let lang = 'en';
  const user = window.TTFinder?.user;
  if (user?.ui_language && SUPPORTED_LANGS.includes(user.ui_language)) {
    lang = user.ui_language;
  } else {
    const saved = localStorage.getItem('ttfinder_lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) lang = saved;
  }
  await loadLocale(lang);
}

/**
 * Switch locale, persist preference, optionally re-render.
 * The caller is responsible for triggering a page re-render afterwards.
 */
export async function setLocale(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem('ttfinder_lang', lang);
  await loadLocale(lang);
  if (window.TTFinder?.user) {
    fetch(`${base}/api/user/set-language.php`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body:        JSON.stringify({ language: lang }),
    }).catch(() => {});
  }
}

/**
 * Look up a translation key. Supports {variable} interpolation.
 * Falls back to the key itself if not found, so missing keys are visible.
 */
export function t(key, vars = {}) {
  let str = _strings[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}

export function currentLocale() { return _locale; }
export function langLabel(code) { return LANG_LABELS[code] ?? code; }
