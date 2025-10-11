import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, AuthError, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: PostgrestError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastRefreshAttempt = useRef<number>(0);
  const isRefreshing = useRef(false);

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
        localStorage.removeItem('userRole');
        return;
      }

      const metaRole =
        (sessionUser.app_metadata as any)?.role ||
        (sessionUser.user_metadata as any)?.role;

      if (metaRole) {
        console.log('✅ deriveAndCacheRole: Found role in metadata:', metaRole);
        sessionStorage.setItem('role', String(metaRole));
        localStorage.setItem('userRole', String(metaRole));
        return;
      }

      if (isSupabaseConfigured && supabase) {
        console.log('🔍 deriveAndCacheRole: Fetching role from database...');
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (error) {
          console.error('❌ deriveAndCacheRole: DB error:', error.message);
        } else if (profile?.role) {
          console.log('✅ deriveAndCacheRole: Found role in DB:', profile.role);
          sessionStorage.setItem('role', String(profile.role));
          localStorage.setItem('userRole', String(profile.role));
        } else {
          console.log('⚠️ deriveAndCacheRole: No role found, defaulting to user');
          sessionStorage.setItem('role', 'user');
          localStorage.setItem('userRole', 'user');
        }
      }
    } catch (err) {
      console.error('💥 deriveAndCacheRole: Error:', err);
    }
  };

  const cleanupAndValidateStorage = () => {
    try {
      if (typeof window === 'undefined') return;
      
      const testKey = 'ff-storage-test';
      localStorage.setItem(testKey, 'test');
      const canAccess = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      
      if (!canAccess) {
        console.warn('⚠️ AuthContext: localStorage not accessible, session persistence may fail');
        return false;
      }
      
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

  // Fonction pour rafraîchir la session si nécessaire
  const refreshSessionIfNeeded = async (silent: boolean = false) => {
    if (!isSupabaseConfigured || !supabase) return;
    
    // Éviter les refresh trop fréquents (minimum 5 secondes entre chaque tentative)
    const now = Date.now();
    if (now - lastRefreshAttempt.current < 5000) {
      console.log('⏭️ AuthContext: Skipping refresh (too soon)');
      return;
    }
    
    // Éviter les refresh simultanés
    if (isRefreshing.current) {
      console.log('⏭️ AuthContext: Already refreshing, skipping...');
      return;
    }

    lastRefreshAttempt.current = now;
    isRefreshing.current = true;

    try {
      if (!silent) {
        console.log('🔄 AuthContext: Refreshing session...');
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ AuthContext: getSession error:', error.message);
        
        // Tentative de refresh si erreur
        if (error.message.includes('refresh_token') || error.message.includes('expired')) {
          console.log('🔄 AuthContext: Attempting token refresh...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log('✅ AuthContext: Token refreshed successfully');
            setUserSafe(refreshData.session.user);
            await deriveAndCacheRole(refreshData.session);
            isRefreshing.current = false;
            return;
          } else {
            console.log('❌ AuthContext: Token refresh failed:', refreshError?.message);
          }
        }
        
        // Nettoyer si échec complet
        setUserSafe(null);
        sessionStorage.removeItem('role');
        localStorage.removeItem('userRole');
        isRefreshing.current = false;
        return;
      }

      // Vérifier si la session est expirée ou sur le point d'expirer (dans les 5 minutes)
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        
        if (expiresAt < now) {
          console.log('⚠️ AuthContext: Session expired, refreshing...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log('✅ AuthContext: Expired session refreshed');
            setUserSafe(refreshData.session.user);
            await deriveAndCacheRole(refreshData.session);
          } else {
            console.error('❌ AuthContext: Failed to refresh expired session');
            setUserSafe(null);
          }
        } else if (expiresAt < fiveMinutesFromNow) {
          console.log('⏰ AuthContext: Session expiring soon, refreshing...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log('✅ AuthContext: Session refreshed proactively');
            setUserSafe(refreshData.session.user);
            await deriveAndCacheRole(refreshData.session);
          } else {
            // Si le refresh échoue mais la session est encore valide, on la garde
            console.warn('⚠️ AuthContext: Proactive refresh failed, keeping current session');
            setUserSafe(session.user);
            await deriveAndCacheRole(session);
          }
        } else {
          // Session valide, pas besoin de refresh
          if (!silent) {
            console.log('✅ AuthContext: Session still valid');
          }
          setUserSafe(session.user);
          await deriveAndCacheRole(session);
        }
      } else {
        setUserSafe(null);
      }
    } catch (err) {
      console.error('💥 AuthContext: refreshSessionIfNeeded error:', err);
    } finally {
      isRefreshing.current = false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    let unsubscribe: (() => void) | undefined;
    let initTimeout: number | undefined;

    const init = async () => {
      console.log('🔐 AuthContext: Initializing...');
      
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
        console.log('🔍 AuthContext: Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] getSession error:', error.message);
          
          if (error.message.includes('refresh_token') || error.message.includes('expired')) {
            console.log('🔄 AuthContext: Attempting initial token refresh...');
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError && refreshData.session) {
                console.log('✅ AuthContext: Initial token refreshed successfully');
                setUserSafe(refreshData.session.user);
                await deriveAndCacheRole(refreshData.session);
                setLoadingSafe(false);
                return;
              } else {
                console.log('❌ AuthContext: Initial token refresh failed:', refreshError?.message);
              }
            } catch (refreshErr) {
              console.error('❌ AuthContext: Initial token refresh failed:', refreshErr);
            }
          }
          
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
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 AuthContext: Token refreshed automatically');
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 AuthContext: User signed out');
            sessionStorage.removeItem('role');
            localStorage.removeItem('userRole');
          }
          
          setUserSafe(nextSession?.user ?? null);
          await deriveAndCacheRole(nextSession);
          setLoadingSafe(false);
          
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

    initTimeout = window.setTimeout(() => {
      console.warn('🚨 AuthContext: Initialization timeout, forcing completion');
      setLoadingSafe(false);
    }, 8000);

    init().finally(() => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    });

    // Gestionnaire pour le retour de focus/visibilité de l'onglet
    const handleVisibilityChange = () => {
      if (!document.hidden && mountedRef.current) {
        console.log('👁️ AuthContext: Tab became visible, checking session...');
        refreshSessionIfNeeded(true);
      }
    };

    const handleFocus = () => {
      if (mountedRef.current) {
        console.log('🎯 AuthContext: Window focused, checking session...');
        refreshSessionIfNeeded(true);
      }
    };

    // Ajouter les listeners pour la visibilité et le focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Refresh périodique de la session toutes les 5 minutes si l'onglet est actif
    const refreshInterval = setInterval(() => {
      if (!document.hidden && mountedRef.current) {
        console.log('⏰ AuthContext: Periodic session check...');
        refreshSessionIfNeeded(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      mountedRef.current = false;
      if (unsubscribe) unsubscribe();
      if (initTimeout) clearTimeout(initTimeout);
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
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
      console.log('🔐 signIn: Attempting to sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('❌ signIn: Error:', error.message);
        return { user: null, error };
      }
      
      if (data.user && data.session) {
        console.log('✅ signIn: Success, updating user and caching role');
        setUserSafe(data.user);
        await deriveAndCacheRole(data.session);
        
        try {
          await supabase.auth.getSession();
          console.log('✅ signIn: Session persistence verified');
        } catch (persistErr) {
          console.warn('⚠️ signIn: Session persistence check failed:', persistErr);
        }
      }
      
      return { user: data.user, error };
    } catch (error) {
      console.error('💥 signIn: Unexpected error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('🚪 signOut: Starting sign out process...');
    if (!isSupabaseConfigured || !supabase) {
      setUserSafe(null);
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
      return;
    }
    try {
      await supabase.auth.signOut();
      setUserSafe(null);
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      console.log('✅ signOut: Signed out and caches cleared');
    } catch (error) {
      console.error('❌ signOut: Error:', error);
    }
  };

  const updateProfile = async (updates: any): Promise<{ error: PostgrestError | null }> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      return { error: null };
    }
    const { error } = await supabase.from('users').update(updates).eq('id', user.id);
    if (!error && typeof updates?.role !== 'undefined') {
      sessionStorage.setItem('role', String(updates.role));
      localStorage.setItem('userRole', String(updates.role));
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
