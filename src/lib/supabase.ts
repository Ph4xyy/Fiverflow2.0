import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// 🔥 Configuration de storage personnalisée pour éviter les problèmes de persistance
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      // Logs moins verbeux en production
      if (import.meta.env.DEV) {
        console.log('🔍 Storage getItem:', { key, hasValue: !!item });
      }
      return item;
    } catch (e) {
      console.warn('localStorage getItem failed:', e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
      // Logs moins verbeux en production
      if (import.meta.env.DEV) {
        console.log('💾 Storage setItem:', { key, valueLength: value.length });
      }
    } catch (e) {
      console.warn('localStorage setItem failed:', e);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      // Logs moins verbeux en production
      if (import.meta.env.DEV) {
        console.log('🗑️ Storage removeItem:', { key });
      }
    } catch (e) {
      console.warn('localStorage removeItem failed:', e);
    }
  }
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // 🔥 Configuration améliorée pour la persistance avec storage personnalisé
        storage: customStorage,
        storageKey: 'sb-auth-token',
        // 🔥 Configuration pour éviter les problèmes de persistance
        debug: import.meta.env.DEV,
        // 🔥 Configuration de refresh plus robuste
        refreshTokenRetryInterval: 2000,
        refreshTokenRetryAttempts: 5,
        // 🔥 Délai avant de considérer la session expirée
        refreshTokenMargin: 60,
      },
    })
  : null;
