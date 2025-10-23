import React from 'react';
import { useTheme, ThemeType } from '../contexts/ThemeContext';
import { Moon, Sun, Zap } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();

  const themes = [
    {
      id: 'light' as ThemeType,
      name: 'Light',
      icon: Sun,
      description: 'Clean and bright',
      colors: 'bg-white border-gray-200'
    },
    {
      id: 'dark' as ThemeType,
      name: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes',
      colors: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'halloween' as ThemeType,
      name: 'Halloween',
      icon: Zap,
      description: 'Spooky and festive',
      colors: 'bg-orange-900 border-orange-700'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose your preferred theme
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = currentTheme === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${theme.colors}`}>
                  <Icon 
                    size={20} 
                    className={isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'} 
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {theme.name}
                    </h4>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {theme.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Halloween special message */}
      {currentTheme === 'halloween' && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            🎃 Happy Halloween! Enjoy the spooky theme!
          </p>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
