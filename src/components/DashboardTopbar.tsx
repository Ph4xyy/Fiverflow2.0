import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardTopbar() {
  const { signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // États pour langue et devise
  const [language, setLanguage] = useState('fr'); // 'fr' ou 'en'
  const [currency, setCurrency] = useState('CAD'); // 'CAD', 'USD', 'EUR', etc.

  // Configuration pour affichage
  const languages = [
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  const currencies = [
    { code: 'CAD', label: 'CAD', flag: '🇨🇦' },
    { code: 'USD', label: 'USD', flag: '🇺🇸' },
    { code: 'EUR', label: 'EUR', flag: '🇪🇺' },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700 fixed w-full top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8 mr-2"/>
          FiverFlow
        </Link>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {/* Langue */}
          <div className="flex gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1 rounded-md text-sm transition ${
                  language === lang.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          {/* Devise */}
          <div className="flex gap-1">
            {currencies.map((cur) => (
              <button
                key={cur.code}
                onClick={() => setCurrency(cur.code)}
                className={`px-2 py-1 rounded-md text-sm transition ${
                  currency === cur.code
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {cur.flag} {cur.label}
              </button>
            ))}
          </div>

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            className="p-1 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          {/* Logout */}
          <button
            onClick={signOut}
            className="p-1 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <LogOut size={16}/>
          </button>
        </div>
      </div>
    </header>
  );
}
