import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

export type ThemeType = 'light' | 'dark' | 'halloween';

interface ThemeContextType {
  isDarkMode: boolean;
  currentTheme: ThemeType;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (enabled: boolean) => Promise<void>;
  setTheme: (theme: ThemeType) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');
  const [loading, setLoading] = useState(true);

  // Apply theme to document
  const applyTheme = (theme: ThemeType) => {
    const html = document.documentElement;
    
    // Remove all theme classes
    html.classList.remove('dark', 'light', 'halloween');
    
    // Apply the new theme
    html.classList.add(theme);
    
    // Update state
    setCurrentTheme(theme);
    setIsDarkMode(theme === 'dark' || theme === 'halloween');
  };

  // Load theme preference from Supabase or localStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      console.log('🎨 Loading theme preference...');
      
      // If Supabase is not configured, use localStorage
      if (!isSupabaseConfigured || !supabase || !user) {
        console.log('🎭 Using localStorage for theme preference');
        const savedTheme = localStorage.getItem('theme') as ThemeType || 'light';
        applyTheme(savedTheme);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching theme preference from Supabase...');
        const { data, error } = await supabase
          .from('users')
          .select('theme_preference')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching theme preference:', error);
          // Fallback to localStorage
          const savedTheme = localStorage.getItem('theme') as ThemeType || 'light';
          applyTheme(savedTheme);
        } else {
          const theme = (data?.theme_preference as ThemeType) || 'light';
          console.log('✅ Theme preference loaded:', theme);
          applyTheme(theme);
          // Sync with localStorage
          localStorage.setItem('theme', theme);
        }
      } catch (error) {
        console.error('💥 Error loading theme preference:', error);
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('theme') as ThemeType || 'light';
        applyTheme(savedTheme);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Save theme preference to Supabase and localStorage
  const saveThemePreference = async (theme: ThemeType) => {
    console.log('💾 Saving theme preference:', theme);
    
    // Always save to localStorage for immediate persistence
    localStorage.setItem('theme', theme);
    
    // If Supabase is configured and user is logged in, save to database
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ theme_preference: theme })
          .eq('id', user.id);

        if (error) {
          console.error('❌ Error saving theme preference:', error);
          toast.error('Failed to save theme preference');
        } else {
          console.log('✅ Theme preference saved to database');
        }
      } catch (error) {
        console.error('💥 Error saving theme preference:', error);
        toast.error('Failed to save theme preference');
      }
    }
  };

  const setDarkMode = async (enabled: boolean) => {
    const theme = enabled ? 'dark' : 'light';
    applyTheme(theme);
    await saveThemePreference(theme);
  };

  const setTheme = async (theme: ThemeType) => {
    applyTheme(theme);
    await saveThemePreference(theme);
    toast.success(`Switched to ${theme} theme`);
  };

  const toggleDarkMode = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    applyTheme(newTheme);
    await saveThemePreference(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const value = {
    isDarkMode,
    currentTheme,
    toggleDarkMode,
    setDarkMode,
    setTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};