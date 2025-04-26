import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import bg from './locales/bg.json';

// Check if a saved language exists in localStorage
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            bg: { translation: bg },
        },
        lng: savedLanguage, // Set initial language
        fallbackLng: 'en', // Default fallback
        interpolation: {
            escapeValue: false, // React escapes by default
        },
    });

// Listen for language changes and update localStorage
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
});

export default i18n;
