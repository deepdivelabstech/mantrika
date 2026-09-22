import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';

/**
 * Adding a third language is a config change here (register the resource +
 * add it to `supportedLanguages`), never a code change in the features.
 */
export const resources = { en: { translation: en }, hi: { translation: hi } } as const;

export const supportedLanguages = Object.keys(resources) as Array<keyof typeof resources>;

export const FALLBACK_LANGUAGE = 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng: FALLBACK_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
