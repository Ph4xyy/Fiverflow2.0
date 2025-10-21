import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
  getThemeColors: () => {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const { user } = useAuth();

  // Charger le thème depuis la base de données
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('theme')
          .eq('user_id', user.id)
          .single();
        
        if (data?.theme) {
          setCurrentTheme(data.theme);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
      }
    };

    loadTheme();
  }, [user]);

  // Sauvegarder le thème en base de données
  const setTheme = async (theme: string) => {
    setCurrentTheme(theme);
    
    if (user) {
      try {
        await supabase
          .from('user_profiles')
          .update({ theme })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du thème:', error);
      }
    }
  };

  // Obtenir les couleurs du thème
  const getThemeColors = () => {
    switch (currentTheme) {
      case 'light':
        return {
          primary: '#3b82f6', // Blue
          secondary: '#1e40af',
          background: '#ffffff',
          card: '#f8fafc',
          text: '#1f2937',
          border: '#e5e7eb'
        };
      case 'blue':
        return {
          primary: '#3b82f6', // Blue
          secondary: '#1e40af',
          background: '#111726',
          card: '#1e2938',
          text: '#ffffff',
          border: '#374151'
        };
      case 'green':
        return {
          primary: '#10b981', // Green
          secondary: '#059669',
          background: '#111726',
          card: '#1e2938',
          text: '#ffffff',
          border: '#374151'
        };
      case 'pink':
        return {
          primary: '#ec4899', // Pink
          secondary: '#be185d',
          background: '#111726',
          card: '#1e2938',
          text: '#ffffff',
          border: '#374151'
        };
      case 'purple':
        return {
          primary: '#8b5cf6', // Purple
          secondary: '#7c3aed',
          background: '#111726',
          card: '#1e2938',
          text: '#ffffff',
          border: '#374151'
        };
      case 'halloween':
        return {
          primary: '#f97316', // Orange
          secondary: '#ea580c',
          background: '#111726',
          card: '#1e2938',
          text: '#ffffff',
          border: '#374151'
        };
      default: // dark
        return {
          primary: '#9c68f2', // Purple
          secondary: '#8a5cf0',
          background: '#111726',
          card: '#1e2938',
          text: '#ffffff',
          border: '#374151'
        };
    }
  };

  const value = {
    currentTheme,
    setTheme,
    getThemeColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};