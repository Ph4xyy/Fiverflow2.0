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

  // 🔥 Fonction pour nettoyer et vérifier le storage
  const cleanupAndValidateStorage = () => {
    try {
      if (typeof window === 'undefined') return;
      
      // Vérifier si localStorage est accessible
      const testKey = 'ff-storage-test';
      localStorage.setItem(testKey, 'test');
      const canAccess = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      
      if (!canAccess) {
        console.warn('⚠️ AuthContext: localStorage not accessible, session persistence may fail');
        return false;
      }
      
      // Nettoyer les anciennes clés potentiellement corrompues
      const keysToCheck = ['sb-auth-token', 'sb-auth-token-code-verifier'];
      keysToCheck.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value && value.length === 0) {
            localStorage.removeItem(key);
            console.log('🧹 AuthContext: Removed empty storage key:', key);
          }
        } catch (e) {
          console.warn('Failed to check storage key:', key, e);
        }
      });
      
      return true;
    } catch (e) {
      console.warn('Storage validation failed:', e);
      return false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    let unsubscribe: (() => void) | undefined;
    let initTimeout: number | undefined;

    const init = async () => {
      console.log('🔐 AuthContext: Initializing...');
      
      // 🔥 Nettoyer et valider le storage en premier
      const storageValid = cleanupAndValidateStorage();
      if (!storageValid) {
        console.warn('⚠️ AuthContext: Storage validation failed, continuing anyway...');
      }
      
      if (!isSupabaseConfigured || !supabase) {
        console.log('❌ AuthContext: Supabase not configured');
        setUserSafe(null);
        setLoadingSafe(false);
        return;
      }

      try {
        console.log('🔍 AuthContext: Getting session...');
        console.log('🔍 AuthContext: localStorage check:', {
          hasLocalStorage: typeof window !== 'undefined' && window.localStorage,
          authToken: typeof window !== 'undefined' ? localStorage.getItem('sb-auth-token') : 'N/A',
          allKeys: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.includes('sb-')) : []
        });
        
        // 🔥 Essayer d'abord de récupérer la session persistée
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
              } else {
                console.log('❌ AuthContext: Token refresh failed:', refreshError?.message);
              }
            } catch (refreshErr) {
              console.error('❌ AuthContext: Token refresh failed:', refreshErr);
            }
          }
          // 🔥 Nettoyer le storage en cas d'erreur persistante
          try {
            localStorage.removeItem('sb-auth-token');
            sessionStorage.removeItem('role');
          } catch (cleanupErr) {
            console.warn('Failed to cleanup storage:', cleanupErr);
          }
          setUserSafe(null);
          setLoadingSafe(false);
          return;
        }

        console.log('✅ AuthContext: Session retrieved', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          isExpired: session ? new Date(session.expires_at * 1000) < new Date() : false
        });

        // 🔥 Vérifier si la session est expirée
        if (session && new Date(session.expires_at * 1000) < new Date()) {
          console.log('⚠️ AuthContext: Session expired, attempting refresh...');
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session) {
              console.log('✅ AuthContext: Expired session refreshed successfully');
              setUserSafe(refreshData.session.user);
              await deriveAndCacheRole(refreshData.session);
              setLoadingSafe(false);
              return;
            }
          } catch (refreshErr) {
            console.error('❌ AuthContext: Failed to refresh expired session:', refreshErr);
          }
        }

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

    // 🔥 Timeout de sécurité pour éviter les loading infinis
    initTimeout = window.setTimeout(() => {
      console.warn('🚨 AuthContext: Initialization timeout, forcing completion');
      setLoadingSafe(false);
    }, 8000); // Augmenté à 8s pour laisser plus de temps à la session de se charger

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
      
      if (!error && data.user) {
        // 🔥 FIXED: Mettre à jour l'état seulement si pas d'erreur et user existe
        setUserSafe(data.user);
        await deriveAndCacheRole(data.session ?? null);
      }
      
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
