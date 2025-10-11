import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, AuthError, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authReady: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: PostgrestError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  
  const mountedRef = useRef(true);
  const lastRefreshAttempt = useRef<number>(0);
  const isRefreshing = useRef(false);
  const hasInitialized = useRef(false);
  const authStateListenerRef = useRef<any>(null);

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: React.SetStateAction<T>) => {
      if (mountedRef.current) setter(value);
    };

  const setUserSafe = safeSetState(setUser);
  const setLoadingSafe = safeSetState(setLoading);
  const setAuthReadySafe = safeSetState(setAuthReady);

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
        console.log('[AuthContext] deriveAndCacheRole: Found role in metadata:', metaRole);
        sessionStorage.setItem('role', String(metaRole));
        localStorage.setItem('userRole', String(metaRole));
        return;
      }

      if (isSupabaseConfigured && supabase) {
        console.log('[AuthContext] deriveAndCacheRole: Fetching role from database...');
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (error) {
          console.error('[AuthContext] deriveAndCacheRole: DB error:', error.message);
        } else if (profile?.role) {
          console.log('[AuthContext] deriveAndCacheRole: Found role in DB:', profile.role);
          sessionStorage.setItem('role', String(profile.role));
          localStorage.setItem('userRole', String(profile.role));
        } else {
          console.log('[AuthContext] deriveAndCacheRole: No role found, defaulting to user');
          sessionStorage.setItem('role', 'user');
          localStorage.setItem('userRole', 'user');
        }
      }
    } catch (err) {
      console.error('[AuthContext] deriveAndCacheRole: Error:', err);
    }
  };

  const cleanupAndValidateStorage = () => {
    try {
      if (typeof window === 'undefined') return false;
      
      const testKey = 'ff-storage-test';
      localStorage.setItem(testKey, 'test');
      const canAccess = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      
      if (!canAccess) {
        console.warn('[AuthContext] localStorage not accessible');
        return false;
      }
      
      return true;
    } catch (e) {
      console.warn('[AuthContext] Storage validation failed:', e);
      return false;
    }
  };

  // Fonction pour rafraîchir la session de manière sécurisée
  const refreshSessionIfNeeded = async (silent: boolean = false) => {
    if (!isSupabaseConfigured || !supabase) return null;
    
    // Éviter les refresh trop fréquents (minimum 3 secondes)
    const now = Date.now();
    if (now - lastRefreshAttempt.current < 3000) {
      if (!silent) console.log('[AuthContext] refreshSessionIfNeeded: Skipping (too soon)');
      return null;
    }
    
    // Éviter les refresh simultanés
    if (isRefreshing.current) {
      if (!silent) console.log('[AuthContext] refreshSessionIfNeeded: Already refreshing');
      return null;
    }

    lastRefreshAttempt.current = now;
    isRefreshing.current = true;

    try {
      console.log('[AuthContext] refreshSessionIfNeeded: Getting session...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthContext] refreshSessionIfNeeded: getSession error:', error.message);
        
        // Tentative de refresh du token
        if (error.message.includes('refresh_token') || error.message.includes('expired')) {
          console.log('[AuthContext] refreshSessionIfNeeded: Attempting token refresh...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log('[AuthContext] refreshSessionIfNeeded: Token refreshed successfully');
            setUserSafe(refreshData.session.user);
            await deriveAndCacheRole(refreshData.session);
            return refreshData.session;
          } else {
            console.error('[AuthContext] refreshSessionIfNeeded: Token refresh failed:', refreshError?.message);
          }
        }
        
        // Ne pas propager user=null immédiatement, garder l'état actuel
        return null;
      }

      // Vérifier si la session est expirée ou sur le point d'expirer
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        
        if (expiresAt < now) {
          console.log('[AuthContext] refreshSessionIfNeeded: Session expired, refreshing...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log('[AuthContext] refreshSessionIfNeeded: Expired session refreshed');
            setUserSafe(refreshData.session.user);
            await deriveAndCacheRole(refreshData.session);
            return refreshData.session;
          } else {
            console.error('[AuthContext] refreshSessionIfNeeded: Failed to refresh expired session');
            // Ne pas propager null, garder l'état actuel
            return null;
          }
        } else if (expiresAt < fiveMinutesFromNow) {
          console.log('[AuthContext] refreshSessionIfNeeded: Session expiring soon, refreshing...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log('[AuthContext] refreshSessionIfNeeded: Session refreshed proactively');
            setUserSafe(refreshData.session.user);
            await deriveAndCacheRole(refreshData.session);
            return refreshData.session;
          } else {
            // Si le refresh échoue mais la session est encore valide, on la garde
            console.warn('[AuthContext] refreshSessionIfNeeded: Proactive refresh failed, keeping current session');
            setUserSafe(session.user);
            await deriveAndCacheRole(session);
            return session;
          }
        } else {
          // Session valide
          if (!silent) console.log('[AuthContext] refreshSessionIfNeeded: Session still valid');
          setUserSafe(session.user);
          await deriveAndCacheRole(session);
          return session;
        }
      } else {
        // Pas de session, mais ne pas forcer user=null si on est en train de rafraîchir
        console.log('[AuthContext] refreshSessionIfNeeded: No session found');
        return null;
      }
    } catch (err) {
      console.error('[AuthContext] refreshSessionIfNeeded: Error:', err);
      return null;
    } finally {
      isRefreshing.current = false;
    }
  };

  useEffect(() => {
    // Protection contre le double mount en StrictMode
    if (hasInitialized.current) {
      console.log('[AuthContext] Already initialized, skipping');
      return;
    }
    
    mountedRef.current = true;
    hasInitialized.current = true;

    let initTimeout: number | undefined;

    const init = async () => {
      console.log('[AuthContext] Initializing...');
      
      const storageValid = cleanupAndValidateStorage();
      if (!storageValid) {
        console.warn('[AuthContext] Storage validation failed');
      }
      
      if (!isSupabaseConfigured || !supabase) {
        console.log('[AuthContext] Supabase not configured');
        setUserSafe(null);
        setLoadingSafe(false);
        setAuthReadySafe(true);
        return;
      }

      try {
        console.log('[AuthContext] Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] getSession error:', error.message);
          
          if (error.message.includes('refresh_token') || error.message.includes('expired')) {
            console.log('[AuthContext] Attempting initial token refresh...');
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError && refreshData.session) {
                console.log('[AuthContext] Initial token refreshed successfully');
                setUserSafe(refreshData.session.user);
                await deriveAndCacheRole(refreshData.session);
                setLoadingSafe(false);
                setAuthReadySafe(true);
                return;
              }
            } catch (refreshErr) {
              console.error('[AuthContext] Initial token refresh failed:', refreshErr);
            }
          }
          
          setUserSafe(null);
          setLoadingSafe(false);
          setAuthReadySafe(true);
          return;
        }

        console.log('[AuthContext] Session retrieved:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          expiresAt: session?.expires_at
        });

        if (session && new Date(session.expires_at * 1000) < new Date()) {
          console.log('[AuthContext] Session expired on init, attempting refresh...');
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session) {
              console.log('[AuthContext] Expired session refreshed on init');
              setUserSafe(refreshData.session.user);
              await deriveAndCacheRole(refreshData.session);
              setLoadingSafe(false);
              setAuthReadySafe(true);
              return;
            }
          } catch (refreshErr) {
            console.error('[AuthContext] Failed to refresh expired session on init:', refreshErr);
          }
        }

        setUserSafe(session?.user ?? null);
        await deriveAndCacheRole(session);
        setLoadingSafe(false);
        setAuthReadySafe(true);
        console.log('[AuthContext] Initialization complete');

        // Nettoyer le listener précédent s'il existe
        if (authStateListenerRef.current) {
          try {
            authStateListenerRef.current.subscription.unsubscribe();
          } catch (e) {
            console.warn('[AuthContext] Failed to unsubscribe previous listener:', e);
          }
        }

        // Configurer le listener d'état d'authentification
        const { data } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
          console.log('[AuthContext] onAuthStateChange:', {
            event,
            hasSession: !!nextSession,
            hasUser: !!nextSession?.user,
            userId: nextSession?.user?.id
          });
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('[AuthContext] Token refreshed automatically by Supabase');
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthContext] User signed out');
            sessionStorage.removeItem('role');
            localStorage.removeItem('userRole');
          } else if (event === 'SIGNED_IN') {
            console.log('[AuthContext] User signed in');
          }
          
          setUserSafe(nextSession?.user ?? null);
          await deriveAndCacheRole(nextSession);
          
          if (!authReady) {
            setAuthReadySafe(true);
          }
          
          try {
            window.dispatchEvent(new CustomEvent('ff:cleanup', { detail: { userId: nextSession?.user?.id || null } }));
          } catch {}
        });

        authStateListenerRef.current = data;

      } catch (err) {
        console.error('[AuthContext] Initialization error:', err);
        setUserSafe(null);
        setLoadingSafe(false);
        setAuthReadySafe(true);
      }
    };

    // Timeout de sécurité
    initTimeout = window.setTimeout(() => {
      console.warn('[AuthContext] Initialization timeout, forcing completion');
      setLoadingSafe(false);
      setAuthReadySafe(true);
    }, 10000);

    init().finally(() => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    });

    // Gestionnaire pour le retour de focus/visibilité de l'onglet
    const handleVisibilityChange = () => {
      if (!document.hidden && mountedRef.current && authReady) {
        console.log('[AuthContext] Tab became visible, checking session...');
        refreshSessionIfNeeded(true);
      }
    };

    const handleFocus = () => {
      if (mountedRef.current && authReady) {
        console.log('[AuthContext] Window focused, checking session...');
        refreshSessionIfNeeded(true);
      }
    };

    // Ajouter les listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Refresh périodique (toutes les 5 minutes si l'onglet est actif)
    const refreshInterval = setInterval(() => {
      if (!document.hidden && mountedRef.current && authReady) {
        console.log('[AuthContext] Periodic session check...');
        refreshSessionIfNeeded(true);
      }
    }, 5 * 60 * 1000);

    return () => {
      mountedRef.current = false;
      if (initTimeout) clearTimeout(initTimeout);
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      // Nettoyer le listener d'état d'authentification
      if (authStateListenerRef.current) {
        try {
          authStateListenerRef.current.subscription.unsubscribe();
        } catch (e) {
          console.warn('[AuthContext] Failed to unsubscribe on cleanup:', e);
        }
      }
    };
  }, []); // Dépendances vides pour éviter les réinitialisations

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
      console.log('[AuthContext] signIn: Attempting to sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('[AuthContext] signIn: Error:', error.message);
        return { user: null, error };
      }
      
      if (data.user && data.session) {
        console.log('[AuthContext] signIn: Success, updating user and caching role');
        setUserSafe(data.user);
        await deriveAndCacheRole(data.session);
        
        try {
          await supabase.auth.getSession();
          console.log('[AuthContext] signIn: Session persistence verified');
        } catch (persistErr) {
          console.warn('[AuthContext] signIn: Session persistence check failed:', persistErr);
        }
      }
      
      return { user: data.user, error };
    } catch (error) {
      console.error('[AuthContext] signIn: Unexpected error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut: Starting sign out process...');
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
      console.log('[AuthContext] signOut: Signed out and caches cleared');
    } catch (error) {
      console.error('[AuthContext] signOut: Error:', error);
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
    <AuthContext.Provider value={{ user, loading, authReady, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
