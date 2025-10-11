import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, AuthError, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, storageSupport } from '../lib/supabase';
import { useAuthResilience } from '../hooks/useAuthResilience';

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
  const hasInitialized = useRef(false);
  const authStateListenerRef = useRef<any>(null);
  const previousUserIdRef = useRef<string | null>(null);

  console.log('[AuthContext] Render:', { 
    hasUser: !!user, 
    loading, 
    authReady,
    userId: user?.id,
    storageIssue: storageSupport.hasIssue
  });

  // Afficher un avertissement si problème de storage détecté
  useEffect(() => {
    if (storageSupport.hasIssue) {
      console.warn('[AuthContext] ⚠️ STORAGE ISSUE:', storageSupport.message);
      // Vous pourriez afficher une notification à l'utilisateur ici
    }
  }, []);

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

  // Hook de résilience - gère les retries sans mettre user=null
  const { attemptSessionRefresh } = useAuthResilience({
    onSessionRestored: async (session: Session) => {
      console.log('[AuthContext] 🔄 Session restored by resilience hook');
      
      // Ne mettre à jour que si l'utilisateur a changé
      if (session.user.id !== previousUserIdRef.current) {
        console.log('[AuthContext] User changed, updating state');
        setUserSafe(session.user);
        previousUserIdRef.current = session.user.id;
      }
      
      await deriveAndCacheRole(session);
      
      // Émettre un événement pour que les composants puissent refetch leurs données
      try {
        window.dispatchEvent(new CustomEvent('ff:session:refreshed', { 
          detail: { userId: session.user.id } 
        }));
      } catch {}
    },
    onSessionLost: () => {
      console.log('[AuthContext] ❌ Session lost after max retries');
      // Seulement maintenant on peut mettre user à null
      setUserSafe(null);
      previousUserIdRef.current = null;
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
    }
  });

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
      console.log('[AuthContext] ========================================');
      console.log('[AuthContext] Initializing...');
      console.log('[AuthContext] Environment:', {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        hasSupabase: !!supabase,
        storageIssue: storageSupport.hasIssue
      });
      console.log('[AuthContext] ========================================');
      
      if (!isSupabaseConfigured || !supabase) {
        console.log('[AuthContext] ❌ Supabase not configured');
        setUserSafe(null);
        setLoadingSafe(false);
        setAuthReadySafe(true);
        return;
      }

      try {
        console.log('[AuthContext] 🔍 Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] ❌ getSession error:', error.message);
          
          // Laisser le hook de résilience gérer les retries
          console.log('[AuthContext] Delegating to resilience hook...');
          await attemptSessionRefresh();
          
          setLoadingSafe(false);
          setAuthReadySafe(true);
          return;
        }

        if (session) {
          console.log('[AuthContext] ✅ Session found:', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: new Date(session.expires_at * 1000).toISOString(),
            isExpired: new Date(session.expires_at * 1000) < new Date()
          });

          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();

          if (expiresAt < now) {
            console.log('[AuthContext] ⚠️ Session expired on init, using resilience hook...');
            await attemptSessionRefresh();
          } else {
            console.log('[AuthContext] Session valid, setting user');
            setUserSafe(session.user);
            previousUserIdRef.current = session.user.id;
            await deriveAndCacheRole(session);
          }
        } else {
          console.log('[AuthContext] No session found');
          setUserSafe(null);
          previousUserIdRef.current = null;
        }

        setLoadingSafe(false);
        setAuthReadySafe(true);
        console.log('[AuthContext] ✅ Initialization complete');

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
          console.log('[AuthContext] 🔔 onAuthStateChange:', {
            event,
            hasSession: !!nextSession,
            hasUser: !!nextSession?.user,
            userId: nextSession?.user?.id
          });
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('[AuthContext] ✅ Token refreshed automatically by Supabase');
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthContext] 🚪 User signed out');
            setUserSafe(null);
            previousUserIdRef.current = null;
            sessionStorage.removeItem('role');
            localStorage.removeItem('userRole');
          } else if (event === 'SIGNED_IN') {
            console.log('[AuthContext] ✅ User signed in');
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
            }
          } else if (event === 'USER_UPDATED') {
            console.log('[AuthContext] 👤 User updated');
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
            }
          }
          
          if (!authReady) {
            setAuthReadySafe(true);
          }
          
          try {
            window.dispatchEvent(new CustomEvent('ff:cleanup', { 
              detail: { userId: nextSession?.user?.id || null } 
            }));
          } catch {}
        });

        authStateListenerRef.current = data;

      } catch (err) {
        console.error('[AuthContext] 💥 Initialization error:', err);
        setUserSafe(null);
        setLoadingSafe(false);
        setAuthReadySafe(true);
      }
    };

    // Timeout de sécurité
    initTimeout = window.setTimeout(() => {
      console.warn('[AuthContext] ⏱️ Initialization timeout (10s), forcing completion');
      setLoadingSafe(false);
      setAuthReadySafe(true);
    }, 10000);

    init().finally(() => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    });

    return () => {
      console.log('[AuthContext] 🧹 Cleanup');
      mountedRef.current = false;
      if (initTimeout) clearTimeout(initTimeout);
      
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
      console.log('[AuthContext] signUp: Starting registration...');
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

      if (error) {
        console.error('[AuthContext] signUp: Error:', error.message);
      } else {
        console.log('[AuthContext] signUp: Success');
      }

      await deriveAndCacheRole(data.session ?? null);
      return { user: data.user, error };
    } catch (error) {
      console.error('[AuthContext] signUp: Unexpected error:', error);
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
        console.log('[AuthContext] signIn: ✅ Success', {
          userId: data.user.id,
          email: data.user.email
        });
        setUserSafe(data.user);
        previousUserIdRef.current = data.user.id;
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
      console.error('[AuthContext] signIn: 💥 Unexpected error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut: Starting sign out process...');
    if (!isSupabaseConfigured || !supabase) {
      setUserSafe(null);
      previousUserIdRef.current = null;
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
      return;
    }
    try {
      await supabase.auth.signOut();
      setUserSafe(null);
      previousUserIdRef.current = null;
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      console.log('[AuthContext] signOut: ✅ Signed out and caches cleared');
    } catch (error) {
      console.error('[AuthContext] signOut: ❌ Error:', error);
    }
  };

  const updateProfile = async (updates: any): Promise<{ error: PostgrestError | null }> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      return { error: null };
    }
    console.log('[AuthContext] updateProfile: Updating profile...');
    const { error } = await supabase.from('users').update(updates).eq('id', user.id);
    if (!error && typeof updates?.role !== 'undefined') {
      sessionStorage.setItem('role', String(updates.role));
      localStorage.setItem('userRole', String(updates.role));
      console.log('[AuthContext] updateProfile: ✅ Role updated in cache');
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
