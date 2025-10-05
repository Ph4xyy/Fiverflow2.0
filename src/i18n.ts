import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import zh from "./locales/zh.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
    zh: { translation: zh },
    it: { translation: it },
    pt: { translation: pt },
    ru: { translation: ru },
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18next;