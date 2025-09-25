import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageDemo: React.FC = () => {
  const { t, language } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
    { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'zh', name: '中文', flag: '🇨🇳', native: '中文' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', native: 'Português' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', native: 'Русский' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', native: '한국어' },
  ];

  return (
    <div className="p-6 bg-[#11151D] rounded-xl border border-[#1C2230]">
      <h2 className="text-2xl font-bold text-white mb-6">
        {t('common.language')} Demo - {t('dashboard.welcome')}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {languages.map((lang) => (
          <div
            key={lang.code}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              language === lang.code
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-[#1C2230] bg-[#0F141C] hover:border-[#2A3347]'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{lang.flag}</div>
              <div className="text-sm font-medium text-white mb-1">
                {lang.native}
              </div>
              <div className="text-xs text-slate-400">
                {lang.name}
              </div>
              {language === lang.code && (
                <div className="mt-2 text-xs text-blue-400 font-medium">
                  ✓ Active
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-[#0F141C] rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          {t('dashboard.quick.actions')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">{t('dashboard.add.client')}:</span>
            <br />
            <span className="text-white">{t('clients.new.client')}</span>
          </div>
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">{t('dashboard.add.order')}:</span>
            <br />
            <span className="text-white">{t('orders.new.order')}</span>
          </div>
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">{t('dashboard.add.task')}:</span>
            <br />
            <span className="text-white">{t('tasks.new.task')}</span>
          </div>
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">{t('dashboard.add.invoice')}:</span>
            <br />
            <span className="text-white">{t('invoices.new.invoice')}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-slate-400">
        {t('common.language')}: <span className="text-white font-medium">{language.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default LanguageDemo;
