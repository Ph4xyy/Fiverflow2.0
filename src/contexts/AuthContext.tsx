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
  processPendingReferral: (userId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // 🔥 NAVIGATION INSTANTANÉE - Plus de loading initial
  const [authReady, setAuthReady] = useState(false);
  
  const mountedRef = useRef(true);
  const hasInitialized = useRef(false);
  const authStateListenerRef = useRef<any>(null);
  const previousUserIdRef = useRef<string | null>(null);
  const realtimeChannelsHealthyRef = useRef(true);

  console.log('[AuthContext] Render:', { 
    hasUser: !!user, 
    loading, 
    authReady,
    userId: user?.id,
    storageIssue: storageSupport.hasIssue,
    realtimeHealthy: realtimeChannelsHealthyRef.current
  });

  // Afficher un avertissement si problème de storage détecté
  useEffect(() => {
    if (storageSupport.hasIssue) {
      console.warn('[AuthContext] ⚠️ STORAGE ISSUE:', storageSupport.message);
    }
  }, []);

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: React.SetStateAction<T>) => {
      if (mountedRef.current) setter(value);
    };

  const setUserSafe = safeSetState(setUser);
  const setLoadingSafe = safeSetState(setLoading);
  const setAuthReadySafe = safeSetState(setAuthReady);

  // Fonction pour mettre à jour Realtime auth et émettre l'événement
  const updateRealtimeAndEmit = async (session: Session | null) => {
    if (!supabase) return;

    try {
      // Mettre à jour l'auth token pour les channels Realtime
      const accessToken = session?.access_token ?? '';
      console.log('[AuthContext] updateRealtimeAndEmit: Updating Realtime auth...', {
        hasToken: !!accessToken,
        tokenLength: accessToken.length
      });
      
      await supabase.realtime.setAuth(accessToken);
      console.log('[AuthContext] updateRealtimeAndEmit: ✅ Realtime auth updated');
      realtimeChannelsHealthyRef.current = true;

      // Émettre l'événement de refresh de session
      if (session?.user) {
        console.log('[AuthContext] updateRealtimeAndEmit: 📡 Emitting ff:session:refreshed event');
        try {
          window.dispatchEvent(new CustomEvent('ff:session:refreshed', { 
            detail: { 
              userId: session.user.id,
              timestamp: Date.now()
            } 
          }));
        } catch (err) {
          console.warn('[AuthContext] updateRealtimeAndEmit: Failed to emit event:', err);
        }
      }
    } catch (err) {
      console.error('[AuthContext] updateRealtimeAndEmit: ❌ Failed to update Realtime auth:', err);
      realtimeChannelsHealthyRef.current = false;
      
      // Si les channels sont KO, les nettoyer pour permettre la reconnexion
      try {
        console.log('[AuthContext] updateRealtimeAndEmit: 🧹 Removing all channels due to error');
        await supabase.removeAllChannels();
        console.log('[AuthContext] updateRealtimeAndEmit: ✅ Channels removed, modules can resubscribe');
      } catch (cleanupErr) {
        console.error('[AuthContext] updateRealtimeAndEmit: ❌ Failed to remove channels:', cleanupErr);
      }
    }
  };

  const deriveAndCacheRole = async (session: Session | null) => {
    try {
      const sessionUser = session?.user ?? null;
      if (!sessionUser) {
        sessionStorage.removeItem('role');
        localStorage.removeItem('userRole');
        return;
      }

      // PRIORITÉ 1: Vérifier app_metadata (le plus fiable)
      const appMetaRole = sessionUser.app_metadata?.role;
      if (appMetaRole) {
        console.log('[AuthContext] deriveAndCacheRole: ✅ Found role in app_metadata:', appMetaRole);
        sessionStorage.setItem('role', String(appMetaRole));
        localStorage.setItem('userRole', String(appMetaRole));
        return;
      }

      // PRIORITÉ 2: Vérifier user_metadata
      const userMetaRole = sessionUser.user_metadata?.role;
      if (userMetaRole) {
        console.log('[AuthContext] deriveAndCacheRole: ✅ Found role in user_metadata:', userMetaRole);
        sessionStorage.setItem('role', String(userMetaRole));
        localStorage.setItem('userRole', String(userMetaRole));
        return;
      }

      // PRIORITÉ 3: Charger depuis la table profiles (avec RLS)
      if (isSupabaseConfigured && supabase) {
        console.log('[AuthContext] deriveAndCacheRole: 📡 Fetching role from profiles table...');
        
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (error) {
            // Gérer les erreurs 401/403 sans crash
            if (error.code === 'PGRST301' || error.message.includes('JWT')) {
              console.warn('[AuthContext] deriveAndCacheRole: ⚠️ Auth error, will retry after token refresh:', error.message);
              // Ne pas cacher de rôle par défaut, laisser undefined pour afficher skeleton
              return;
            }
            console.error('[AuthContext] deriveAndCacheRole: ❌ DB error:', error.message);
          } else if (profile?.role) {
            console.log('[AuthContext] deriveAndCacheRole: ✅ Found role in profiles table:', profile.role);
            sessionStorage.setItem('role', String(profile.role));
            localStorage.setItem('userRole', String(profile.role));
            return;
          } else {
            console.log('[AuthContext] deriveAndCacheRole: ⚠️ No role found in profiles, defaulting to user');
            sessionStorage.setItem('role', 'user');
            localStorage.setItem('userRole', 'user');
          }
        } catch (fetchErr) {
          console.error('[AuthContext] deriveAndCacheRole: 💥 Unexpected error:', fetchErr);
          // Ne pas cacher de rôle par défaut en cas d'erreur
        }
      }
    } catch (err) {
      console.error('[AuthContext] deriveAndCacheRole: 💥 Error:', err);
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
      
      // Mettre à jour Realtime et émettre l'événement
      await updateRealtimeAndEmit(session);
    },
    onSessionLost: () => {
      console.log('[AuthContext] ❌ Session lost after max retries');
      // Seulement maintenant on peut mettre user à null
      setUserSafe(null);
      previousUserIdRef.current = null;
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
      
      // Nettoyer les channels Realtime
      if (supabase) {
        try {
          console.log('[AuthContext] 🧹 Removing all Realtime channels after session lost');
          supabase.removeAllChannels();
        } catch (err) {
          console.error('[AuthContext] Failed to remove channels:', err);
        }
      }
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
      
      // Timeout de sécurité pour l'initialisation (15 secondes)
      initTimeout = window.setTimeout(() => {
        console.warn('[AuthContext] ⚠️ Initialization timeout (15s), forcing completion');
        setLoadingSafe(false);
        setAuthReadySafe(true);
      }, 15000);
      
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
          console.log('[AuthContext] ✅ Initial session found:', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: new Date(session.expires_at * 1000).toISOString(),
            isExpired: new Date(session.expires_at * 1000) < new Date(),
            appMetaRole: session.user.app_metadata?.role
          });

          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();

          if (expiresAt < now) {
            console.log('[AuthContext] ⚠️ Session expired on init, using resilience hook...');
            await attemptSessionRefresh();
          } else {
            console.log('[AuthContext] Session valid, setting user and updating Realtime');
            setUserSafe(session.user);
            previousUserIdRef.current = session.user.id;
            await deriveAndCacheRole(session);
            
            // Mettre à jour Realtime auth et émettre l'événement
            await updateRealtimeAndEmit(session);
          }
        } else {
          console.log('[AuthContext] No initial session found');
          setUserSafe(null);
          previousUserIdRef.current = null;
        }

        setLoadingSafe(false);
        setAuthReadySafe(true);
        console.log('[AuthContext] ✅ Initialization complete, authReady=true');

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
            console.log('[AuthContext] ✅ TOKEN_REFRESHED event');
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
              
              // Mettre à jour Realtime et émettre
              await updateRealtimeAndEmit(nextSession);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthContext] 🚪 SIGNED_OUT event');
            setUserSafe(null);
            previousUserIdRef.current = null;
            sessionStorage.removeItem('role');
            localStorage.removeItem('userRole');
            
            // Nettoyer les channels
            try {
              await supabase.removeAllChannels();
            } catch (err) {
              console.error('[AuthContext] Failed to remove channels on sign out:', err);
            }
          } else if (event === 'SIGNED_IN') {
            console.log('[AuthContext] ✅ SIGNED_IN event');
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
              
              // Mettre à jour Realtime et émettre
              await updateRealtimeAndEmit(nextSession);
            }
          } else if (event === 'USER_UPDATED') {
            console.log('[AuthContext] 👤 USER_UPDATED event');
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
              
              // Mettre à jour Realtime et émettre
              await updateRealtimeAndEmit(nextSession);
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

    // Timeout de sécurité réduit
    initTimeout = window.setTimeout(() => {
      console.warn('[AuthContext] ⏱️ Initialization timeout (5s), forcing completion');
      setLoadingSafe(false);
      setAuthReadySafe(true);
    }, 5000);

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

      // Store referral code for later processing
      if (referralCode) {
        // Validate referral code exists
        const { data: referrer, error: referrerError } = await supabase
          .from('users')
          .select('id, referral_code')
          .eq('referral_code', referralCode)
          .maybeSingle();
        
        if (referrerError) {
          console.error('[AuthContext] signUp: Error validating referral code:', referrerError);
        } else if (referrer?.id) {
          sessionStorage.setItem('referralCode', referralCode);
          console.log('[AuthContext] signUp: Valid referral code found:', referralCode);
        } else {
          console.warn('[AuthContext] signUp: Invalid referral code:', referralCode);
          // Don't fail registration, just log the warning
        }
      }

      sessionStorage.setItem('pendingRegistrationData', JSON.stringify(userData));
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        console.error('[AuthContext] signUp: Error:', error.message);
      } else {
        console.log('[AuthContext] signUp: Success');
        
        // Mettre à jour Realtime et émettre si session disponible
        if (data.session) {
          await updateRealtimeAndEmit(data.session);
        }
      }

      await deriveAndCacheRole(data.session ?? null);
      return { user: data.user, error };
    } catch (error) {
      console.error('[AuthContext] signUp: Unexpected error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // Function to process pending referral after user completes onboarding
  const processPendingReferral = async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const referralCode = sessionStorage.getItem('referralCode');
      
      if (!referralCode) {
        console.log('[AuthContext] processPendingReferral: No referral code found');
        return { success: true, message: 'No referral code to process' };
      }

      console.log('[AuthContext] processPendingReferral: Processing referral code:', referralCode);

      // Call the Edge function to create referral relationship
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get session token');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-referral`;
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          referrer_code: referralCode,
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create referral relationship');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('[AuthContext] processPendingReferral: Success:', result.message);
        // Clean up session storage
        sessionStorage.removeItem('referralCode');
        return { success: true, message: result.message };
      } else {
        console.error('[AuthContext] processPendingReferral: Failed:', result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('[AuthContext] processPendingReferral: Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  };

  const signIn = async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('[AuthContext] signIn: Error:', error.message);
        return { user: null, error };
      }
      
      if (data.user && data.session) {
        console.log('[AuthContext] signIn: ✅ Success', {
          userId: data.user.id,
          email: data.user.email,
          appMetaRole: data.user.app_metadata?.role
        });
        setUserSafe(data.user);
        previousUserIdRef.current = data.user.id;
        await deriveAndCacheRole(data.session);
        
        // Mettre à jour Realtime et émettre
        await updateRealtimeAndEmit(data.session);
        
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
      // Nettoyer les channels avant de se déconnecter
      try {
        await supabase.removeAllChannels();
        console.log('[AuthContext] signOut: Realtime channels removed');
      } catch (err) {
        console.error('[AuthContext] signOut: Failed to remove channels:', err);
      }
      
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
    <AuthContext.Provider value={{ user, loading, authReady, signUp, signIn, signOut, updateProfile, processPendingReferral }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
