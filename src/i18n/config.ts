
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Only import Italian eagerly (fallback/default)
import it from './locales/it.json';

const loadedLanguages = new Set(['it']);

const resources: Record<string, { translation: Record<string, unknown> }> = {
  it: { translation: it }
};

// Lazy load other languages on demand
const languageLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./locales/en.json'),
  fr: () => import('./locales/fr.json'),
  de: () => import('./locales/de.json'),
  es: () => import('./locales/es.json'),
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    lng: 'it',
    debug: false,
    interpolation: {
      escapeValue: false
    },
  });

// Detect language from URL path
const detectLangFromPath = (): string => {
  const match = window.location.pathname.match(/^\/(it|en|fr|de|es)/);
  return match ? match[1] : 'it';
};

// Load language dynamically
export const loadLanguage = async (lang: string) => {
  if (loadedLanguages.has(lang)) {
    if (i18n.language !== lang) {
      await i18n.changeLanguage(lang);
    }
    return;
  }
  
  const loader = languageLoaders[lang];
  if (loader) {
    const module = await loader();
    i18n.addResourceBundle(lang, 'translation', module.default, true, true);
    loadedLanguages.add(lang);
    await i18n.changeLanguage(lang);
  }
};

// Auto-load language from URL on init
const detectedLang = detectLangFromPath();
if (detectedLang !== 'it') {
  loadLanguage(detectedLang);
} 

export default i18n;
