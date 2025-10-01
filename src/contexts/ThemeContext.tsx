import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (enabled: boolean) => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Apply theme to document
  const applyTheme = (darkMode: boolean) => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    setIsDarkMode(darkMode);
  };

  // Load theme preference from Supabase or localStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      console.log('🎨 Loading theme preference...');
      
      // If Supabase is not configured, use localStorage
      if (!isSupabaseConfigured || !supabase || !user) {
        console.log('🎭 Using localStorage for theme preference');
        const savedTheme = localStorage.getItem('darkMode');
        const darkMode = savedTheme === 'true';
        applyTheme(darkMode);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching theme preference from Supabase...');
        const { data, error } = await supabase
          .from('users')
          .select('dark_mode')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching theme preference:', error);
          // Fallback to localStorage
          const savedTheme = localStorage.getItem('darkMode');
          const darkMode = savedTheme === 'true';
          applyTheme(darkMode);
        } else {
          const darkMode = data?.dark_mode || false;
          console.log('✅ Theme preference loaded:', darkMode ? 'Dark' : 'Light');
          applyTheme(darkMode);
          // Sync with localStorage
          localStorage.setItem('darkMode', darkMode.toString());
        }
      } catch (error) {
        console.error('💥 Error loading theme preference:', error);
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('darkMode');
        const darkMode = savedTheme === 'true';
        applyTheme(darkMode);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Save theme preference to Supabase and localStorage
  const saveThemePreference = async (darkMode: boolean) => {
    console.log('💾 Saving theme preference:', darkMode ? 'Dark' : 'Light');
    
    // Always save to localStorage for immediate persistence
    localStorage.setItem('darkMode', darkMode.toString());
    
    // If Supabase is configured and user is logged in, save to database
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ dark_mode: darkMode })
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
    applyTheme(enabled);
    await saveThemePreference(enabled);
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    applyTheme(newDarkMode);
    await saveThemePreference(newDarkMode);
    toast.success(`Switched to ${newDarkMode ? 'dark' : 'light'} mode`);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};