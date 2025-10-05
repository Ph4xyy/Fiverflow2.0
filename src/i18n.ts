import en from "./locales/en.json";
import fr from "./locales/fr.json";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: "en", // langue par défaut
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18next;