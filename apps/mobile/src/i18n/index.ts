// `use` React 19'un `use` hook adıyla çakışıp eslint hooks kuralını tetiklediği
import i18n, { changeLanguage, use as i18nUse } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useSettings } from '@/store/settings';
import { en } from './locales/en';
import { tr } from './locales/tr';

i18nUse(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: useSettings.getState().language,
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
  returnNull: false,
});

useSettings.subscribe((state) => {
  if (state.language && state.language !== i18n.language) {
    void changeLanguage(state.language);
  }
});

export default i18n;
