import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { DEFAULT_LOCALE, LOCALES } from '@bank-poc/shared'
import en from './locales/en/common.json'
import ms from './locales/ms/common.json'
import zh from './locales/zh/common.json'

// Resources are bundled statically (no http-backend) so init is synchronous and
// the first render never flashes untranslated keys — no Suspense boundary needed.
const resources = {
  en: { common: en },
  ms: { common: ms },
  zh: { common: zh },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES,
    // Collapse regional tags (e.g. zh-CN → zh) onto our base locales.
    load: 'languageOnly',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: {
      // Persist the choice across reloads (parallels the bank-ai-chat
      // sessionStorage convention), falling back to the browser language.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bank-ai-lang',
      caches: ['localStorage'],
    },
  })

export default i18n
