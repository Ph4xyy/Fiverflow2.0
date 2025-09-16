import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === "en" ? "🇬🇧" : "🇫🇷"}</span>
    </button>
  );
}
