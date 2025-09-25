import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
    { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
    { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
    { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
    { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C2230] hover:bg-[#2A3347] 
                   text-slate-300 hover:text-white transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLanguage?.flag}</span>
        <span className="text-sm hidden sm:inline">{currentLanguage?.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-[#0F141C] border border-[#1C2230] 
                        rounded-xl shadow-xl z-50 min-w-[200px] max-h-[400px] overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('common.language') || 'Language'}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    language === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-[#1C2230] hover:text-white'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium flex-1 text-left">{lang.name}</span>
                  {language === lang.code && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;