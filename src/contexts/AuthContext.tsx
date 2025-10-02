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
    let initTimeout: number | undefined;

    const init = async () => {
      console.log('🔐 AuthContext: Initializing...');
      
      if (!isSupabaseConfigured || !supabase) {
        console.log('❌ AuthContext: Supabase not configured');
        setUserSafe(null);
        setLoadingSafe(false);
        return;
      }

      try {
        console.log('🔍 AuthContext: Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] getSession error:', error.message);
          // 🔥 Si erreur de session, essayer de rafraîchir le token
          if (error.message.includes('refresh_token') || error.message.includes('expired')) {
            console.log('🔄 AuthContext: Attempting token refresh...');
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError && refreshData.session) {
                console.log('✅ AuthContext: Token refreshed successfully');
                setUserSafe(refreshData.session.user);
                await deriveAndCacheRole(refreshData.session);
                setLoadingSafe(false);
                return;
              }
            } catch (refreshErr) {
              console.error('❌ AuthContext: Token refresh failed:', refreshErr);
            }
          }
          setUserSafe(null);
          setLoadingSafe(false);
          return;
        }

        console.log('✅ AuthContext: Session retrieved', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          expiresAt: session?.expires_at
        });

        setUserSafe(session?.user ?? null);
        await deriveAndCacheRole(session);
        setLoadingSafe(false);
        console.log('🏁 AuthContext: Initialization complete');

        const { data } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
          console.log('🔄 AuthContext: Auth state changed', {
            event,
            hasSession: !!nextSession,
            hasUser: !!nextSession?.user,
            userId: nextSession?.user?.id
          });
          
          // 🔥 Gestion spéciale pour les événements de refresh
          if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 AuthContext: Token refreshed automatically');
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 AuthContext: User signed out');
            sessionStorage.removeItem('role');
          }
          
          setUserSafe(nextSession?.user ?? null);
          await deriveAndCacheRole(nextSession);
          setLoadingSafe(false);
          
          // Emit cleanup event to clean up problematic listeners
          try {
            window.dispatchEvent(new CustomEvent('ff:cleanup', { detail: { userId: nextSession?.user?.id || null } }));
          } catch {}
        });

        unsubscribe = () => {
          try {
            data.subscription.unsubscribe();
          } catch {
            // already unsubscribed / hot-reload safety
          }
        };

      } catch (err) {
        console.error('💥 AuthContext: Initialization error:', err);
        setUserSafe(null);
        setLoadingSafe(false);
      }
    };

    // 🔥 Timeout de sécurité réduit pour une authentification plus fluide
    initTimeout = window.setTimeout(() => {
      console.warn('🚨 AuthContext: Initialization timeout, forcing completion');
      setLoadingSafe(false);
    }, 2000); // Réduit de 5s à 2s

    init().finally(() => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    });

    return () => {
      mountedRef.current = false;
      if (unsubscribe) unsubscribe();
      if (initTimeout) clearTimeout(initTimeout);
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
      // 🔥 FIXED: Ne pas mettre à jour l'état directement ici, laisser onAuthStateChange le faire
      // setUserSafe(data.user ?? null);
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
