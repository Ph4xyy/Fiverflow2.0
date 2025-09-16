import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogOut, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700 fixed w-full top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FiverFlow
        </Link>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110"
            >
              <Bell size={16} />
            </button>
            {/* Dropdown si tu veux plus tard */}
          </div>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              {/* Exemple SVG drapeau */}
              <svg width="20" height="20" viewBox="0 0 640 480">
                <rect width="640" height="480" fill="#00247d"/>
                <rect width="640" height="160" y="160" fill="#fff"/>
                <rect width="640" height="80" y="200" fill="#cf142b"/>
              </svg>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                <button className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                  <span className="mr-2">🇺🇸</span> English
                </button>
                <button className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                  <span className="mr-2">🇫🇷</span> Français
                </button>
              </div>
            )}
          </div>

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              💲 USD
            </button>
            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                <button className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">USD</button>
                <button className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">CAD</button>
                <button className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">EUR</button>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button className="p-2 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
