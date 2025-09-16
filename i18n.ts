import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import des fichiers de traduction
import en from "./src/locales/en.json";
import fr from "./src/locales/fr.json";

i18n
  .use(LanguageDetector) // détecte automatiquement (navigateur ou localStorage)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: "en", // si la langue n’existe pas, fallback en anglais
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"], // stocke la langue choisie
    },
  });

export default i18n;
