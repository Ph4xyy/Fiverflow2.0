import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // 🔥 Configuration améliorée pour la persistance
        storage: window.localStorage,
        storageKey: 'sb-auth-token',
        // 🔥 Refresh token plus agressif
        refreshTokenRetryInterval: 1000,
        refreshTokenRetryAttempts: 3,
      },
    })
  : null;
