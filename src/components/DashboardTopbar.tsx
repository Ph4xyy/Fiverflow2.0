import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, LogOut, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from "../contexts/AuthContext";
import { useCurrency } from '../contexts/CurrencyContext';

// Import des icônes drapeaux
import FlagEN from '../assets/IconUS.svg';
import FlagFR from '../assets/IconFR.svg';

// Import logo
import LogoImage from '../assets/LogoTransparent.png'; // <-- placce ton logo ici

// Langues disponibles
const languages = [
  { code: 'en', label: 'English', icon: FlagEN },
  { code: 'fr', label: 'Français', icon: FlagFR },
];

// Currency (icônes custom en SVG inline, style "startup")
const currencies = [
  { code: 'USD', label: 'USD', icon: () => <span className="text-base font-semibold">$</span> },
  { code: 'EUR', label: 'EUR', icon: () => <span className="text-base font-semibold">€</span> },
  { code: 'GBP', label: 'GBP', icon: () => <span className="text-base font-semibold">£</span> },
  { code: 'CAD', label: 'CAD', icon: () => <span className="text-base font-semibold">C$</span> },
  { code: 'AUD', label: 'AUD', icon: () => <span className="text-base font-semibold">A$</span> },
  { code: 'CHF', label: 'CHF', icon: () => <span className="text-base font-semibold">CHF</span> },
  { code: 'JPY', label: 'JPY', icon: () => <span className="text-base font-semibold">¥</span> },
  { code: 'CNY', label: 'CNY', icon: () => <span className="text-base font-semibold">¥</span> },
  { code: 'INR', label: 'INR', icon: () => <span className="text-base font-semibold">₹</span> },
  { code: 'BRL', label: 'BRL', icon: () => <span className="text-base font-semibold">R$</span> },
  { code: 'MXN', label: 'MXN', icon: () => <span className="text-base font-semibold">M$</span> },
  { code: 'ZAR', label: 'ZAR', icon: () => <span className="text-base font-semibold">R</span> },
  { code: 'SEK', label: 'SEK', icon: () => <span className="text-base font-semibold">kr</span> },
  { code: 'NOK', label: 'NOK', icon: () => <span className="text-base font-semibold">kr</span> },
  { code: 'DKK', label: 'DKK', icon: () => <span className="text-base font-semibold">kr</span> },
  { code: 'PLN', label: 'PLN', icon: () => <span className="text-base font-semibold">zł</span> },
  { code: 'CZK', label: 'CZK', icon: () => <span className="text-base font-semibold">Kč</span> },
  { code: 'HUF', label: 'HUF', icon: () => <span className="text-base font-semibold">Ft</span> },
  { code: 'RUB', label: 'RUB', icon: () => <span className="text-base font-semibold">₽</span> },
  { code: 'TRY', label: 'TRY', icon: () => <span className="text-base font-semibold">₺</span> },
  { code: 'KRW', label: 'KRW', icon: () => <span className="text-base font-semibold">₩</span> },
  { code: 'SGD', label: 'SGD', icon: () => <span className="text-base font-semibold">S$</span> },
  { code: 'HKD', label: 'HKD', icon: () => <span className="text-base font-semibold">H$</span> },
  { code: 'NZD', label: 'NZD', icon: () => <span className="text-base font-semibold">NZ$</span> },
  { code: 'AED', label: 'AED', icon: () => <span className="text-base font-semibold">د.إ</span> },
  { code: 'SAR', label: 'SAR', icon: () => <span className="text-base font-semibold">﷼</span> },
  { code: 'ILS', label: 'ILS', icon: () => <span className="text-base font-semibold">₪</span> },
  { code: 'THB', label: 'THB', icon: () => <span className="text-base font-semibold">฿</span> },
  { code: 'MYR', label: 'MYR', icon: () => <span className="text-base font-semibold">RM</span> },
  { code: 'PHP', label: 'PHP', icon: () => <span className="text-base font-semibold">₱</span> },
  { code: 'IDR', label: 'IDR', icon: () => <span className="text-base font-semibold">Rp</span> },
  { code: 'VND', label: 'VND', icon: () => <span className="text-base font-semibold">₫</span> },
];

const DashboardTopBar: React.FC = () => {
  const { toggleDarkMode, isDarkMode } = useTheme();
  const { signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(
    currencies.find(c => c.code === currency) || currencies[0]
  );
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  // Ref pour gérer le click en dehors
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Synchronize selected currency with context currency changes
  useEffect(() => {
    const newSelected = currencies.find(c => c.code === currency);
    if (newSelected && newSelected !== selectedCurrency) {
      setSelectedCurrency(newSelected);
    }
  }, [currency, selectedCurrency]);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700 fixed w-full top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side: Logo + texte */}
        <div className="flex items-center space-x-3">
          <img src={LogoImage} alt="FiverFlow Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-accent-blue dark:to-accent-purple bg-clip-text text-transparent">
            FiverFlow
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Language dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {/* drapeau rond */}
              <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-300 dark:border-slate-600">
                <img src={selectedLang.icon} alt={selectedLang.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm">{selectedLang.label}</span>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang); setLangDropdownOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-300 dark:border-slate-600">
                      <img src={lang.icon} alt={lang.label} className="w-full h-full object-cover" />
                    </div>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency dropdown */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {selectedCurrency.icon()}
              <span className="text-sm">{selectedCurrency.label}</span>
            </button>
            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50">
                {currencies.map(curr => (
                  <button
                    key={curr.code}
                    onClick={() => { 
                      setSelectedCurrency(curr); 
                      setCurrency(curr.code);
                      setCurrencyDropdownOpen(false); 
                    }}
                    className="flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    {curr.icon()}
                    {curr.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <Bell size={16} />
          </button>

          {/* SignOut */}
          <button
            onClick={signOut}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
