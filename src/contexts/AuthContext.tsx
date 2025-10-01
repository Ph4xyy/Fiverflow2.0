import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, AuthError, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: PostgrestError | null }>; // 🔥 fix ici
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: React.SetStateAction<T>) => {
      if (mountedRef.current) setter(value);
    };

  const setUserSafe = safeSetState(setUser);
  const setLoadingSafe = safeSetState(setLoading);

  const deriveAndCacheRole = async (session: Session | null) => {
    try {
      const sessionUser = session?.user ?? null;
      if (!sessionUser) {
        sessionStorage.removeItem('role');
        return;
      }

      const metaRole =
        (sessionUser.app_metadata as any)?.role ||
        (sessionUser.user_metadata as any)?.role;

      if (metaRole) {
        sessionStorage.setItem('role', String(metaRole));
        return;
      }

      if (isSupabaseConfigured && supabase) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (profile?.role) {
          sessionStorage.setItem('role', String(profile.role));
        }
      }
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setUserSafe(null);
        setLoadingSafe(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('[Auth] getSession error:', error.message);

      setUserSafe(session?.user ?? null);
      await deriveAndCacheRole(session);
      setLoadingSafe(false);

      const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        setUserSafe(nextSession?.user ?? null);
        await deriveAndCacheRole(nextSession);
        setLoadingSafe(false);
        // Removed ff:session:refreshed event dispatch to prevent cascade of re-renders
      });

      unsubscribe = () => {
        try {
          data.subscription.unsubscribe();
        } catch {
          // already unsubscribed / hot-reload safety
        }
      };

      // No visibility change listeners - let useTabSwitchOptimization handle this
      // attach to unsubscribe chain
      const oldUnsub = unsubscribe;
      unsubscribe = () => {
        if (oldUnsub) oldUnsub();
      };
    };

    init();

    return () => {
      mountedRef.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: null as unknown as AuthError };
    }
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');

      if (referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .maybeSingle();
        if (referrer?.id) {
          sessionStorage.setItem('referrerId', referrer.id);
        }
      }

      sessionStorage.setItem('pendingRegistrationData', JSON.stringify(userData));
      const { data, error } = await supabase.auth.signUp({ email, password });

      await deriveAndCacheRole(data.session ?? null);
      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: null as unknown as AuthError };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setUserSafe(data.user ?? null);
      await deriveAndCacheRole(data.session ?? null);
      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUserSafe(null);
      sessionStorage.removeItem('role');
      return;
    }
    await supabase.auth.signOut();
    sessionStorage.removeItem('role');
    setUserSafe(null);
  };

  const updateProfile = async (updates: any): Promise<{ error: PostgrestError | null }> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      return { error: null };
    }
    const { error } = await supabase.from('users').update(updates).eq('id', user.id);
    if (!error && typeof updates?.role !== 'undefined') {
      sessionStorage.setItem('role', String(updates.role));
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
