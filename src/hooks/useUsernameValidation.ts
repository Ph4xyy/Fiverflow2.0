import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UseUsernameValidationReturn {
  isUsernameAvailable: (username: string) => Promise<boolean>;
  validateUsername: (username: string) => { isValid: boolean; error?: string };
  loading: boolean;
}

export const useUsernameValidation = (): UseUsernameValidationReturn => {
  const [loading, setLoading] = useState(false);

  const validateUsername = useCallback((username: string): { isValid: boolean; error?: string } => {
    // Basic validation rules
    if (!username || username.trim() === '') {
      return { isValid: false, error: 'Username is required' };
    }

    if (username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long' };
    }

    if (username.length > 20) {
      return { isValid: false, error: 'Username must be less than 20 characters' };
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return { isValid: false, error: 'Username can only contain letters and numbers' };
    }

    // Reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'user', 'users', 'api', 'www', 'mail',
      'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login',
      'register', 'signup', 'signin', 'dashboard', 'profile', 'settings',
      'account', 'billing', 'payment', 'pricing', 'features', 'blog', 'news',
      'fiverflow', 'fiver', 'flow', 'app', 'home', 'index', 'main'
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      return { isValid: false, error: 'This username is reserved' };
    }

    return { isValid: true };
  }, []);

  const isUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      return true; // Allow in mock mode
    }

    const validation = validateUsername(username);
    if (!validation.isValid) {
      return false;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('is_username_available', {
        username_to_check: username.trim()
      });

      if (error) {
        console.error('❌ Error checking username availability:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('💥 Unexpected error checking username:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validateUsername]);

  return {
    isUsernameAvailable,
    validateUsername,
    loading
  };
};
