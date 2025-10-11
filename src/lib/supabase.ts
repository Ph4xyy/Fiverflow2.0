import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Custom storage pour garantir la persistance
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      console.log('[Supabase Storage] getItem:', { key, hasValue: !!item });
      return item;
    } catch (e) {
      console.warn('[Supabase Storage] getItem failed:', e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
      console.log('[Supabase Storage] setItem:', { key, valueLength: value.length });
    } catch (e) {
      console.warn('[Supabase Storage] setItem failed:', e);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      console.log('[Supabase Storage] removeItem:', { key });
    } catch (e) {
      console.warn('[Supabase Storage] removeItem failed:', e);
    }
  }
};

// SINGLETON Supabase Client - UNE SEULE initialisation
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        multiTab: true,
        storageKey: 'fiverflow.auth',
        flowType: 'pkce',
        storage: customStorage,
        debug: import.meta.env.DEV,
        refreshTokenRetryInterval: 2000,
        refreshTokenRetryAttempts: 5,
        refreshTokenMargin: 60,
      },
    })
  : null;

console.log('[Supabase] Singleton client initialized', { 
  configured: isSupabaseConfigured,
  hasClient: !!supabase 
});
