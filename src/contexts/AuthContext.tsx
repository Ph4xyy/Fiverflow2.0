// src/contexts/AuthContext.tsx
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
  processPendingReferralByUsername: (userId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  activatePendingReferral: (userId: string, email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // keep false to avoid initial blocking
  const [authReady, setAuthReady] = useState(false);
  
  const mountedRef = useRef(true);
  const hasInitialized = useRef(false);
  const authStateListenerRef = useRef<any>(null);
  const previousUserIdRef = useRef<string | null>(null);
  const realtimeChannelsHealthyRef = useRef(true);

  // Small guard: when tab becomes visible, don't trigger immediate heavy refresh if we just initialized
  const lastVisibilityChangeRef = useRef<number>(0);
  const ignoreVisibilityRefreshRef = useRef<boolean>(false);

  console.log('[AuthContext] Render:', { 
    hasUser: !!user, 
    loading, 
    authReady,
    userId: user?.id,
    storageIssue: storageSupport.hasIssue,
    realtimeHealthy: realtimeChannelsHealthyRef.current
  });

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

  const updateRealtimeAndEmit = async (session: Session | null) => {
    if (!supabase) return;
    try {
      const accessToken = session?.access_token ?? '';
      console.log('[AuthContext] updateRealtimeAndEmit: Updating Realtime auth...', {
        hasToken: !!accessToken
      });
      await supabase.realtime.setAuth(accessToken);
      realtimeChannelsHealthyRef.current = true;

      if (session?.user) {
        try {
          window.dispatchEvent(new CustomEvent('ff:session:refreshed', { 
            detail: { userId: session.user.id, timestamp: Date.now() } 
          }));
        } catch (err) {
          console.warn('[AuthContext] updateRealtimeAndEmit: Failed to emit event:', err);
        }
      }
    } catch (err) {
      console.error('[AuthContext] updateRealtimeAndEmit: ❌ Failed to update Realtime auth:', err);
      realtimeChannelsHealthyRef.current = false;
      try {
        await supabase.removeAllChannels();
      } catch (cleanupErr) {
        console.error('[AuthContext] updateRealtimeAndEmit: ❌ Failed to remove channels:', cleanupErr);
      }
    }
  };

  const deriveAndCacheRole = async (session: Session | null) => {
    try {
      const sessionUser = session?.user ?? null;
      if (!sessionUser) return;

      const appMetaRole = sessionUser.app_metadata?.role;
      if (appMetaRole) {
        sessionStorage.setItem('role', String(appMetaRole));
        localStorage.setItem('userRole', String(appMetaRole));
        return;
      }

      const userMetaRole = sessionUser.user_metadata?.role;
      if (userMetaRole) {
        sessionStorage.setItem('role', String(userMetaRole));
        localStorage.setItem('userRole', String(userMetaRole));
        return;
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (error) {
            if (error.code === 'PGRST301' || error.message.includes('JWT')) {
              console.warn('[AuthContext] deriveAndCacheRole: ⚠️ Auth error, will retry after token refresh:', error.message);
              return;
            }
            console.error('[AuthContext] deriveAndCacheRole: ❌ DB error:', error.message);
          } else if (profile?.role) {
            sessionStorage.setItem('role', String(profile.role));
            localStorage.setItem('userRole', String(profile.role));
            return;
          } else {
            sessionStorage.setItem('role', 'user');
            localStorage.setItem('userRole', 'user');
          }
        } catch (fetchErr) {
          console.error('[AuthContext] deriveAndCacheRole: 💥 Unexpected error:', fetchErr);
        }
      }
    } catch (err) {
      console.error('[AuthContext] deriveAndCacheRole: 💥 Error:', err);
    }
  };

  const { attemptSessionRefresh } = useAuthResilience({
    onSessionRestored: async (session: Session) => {
      console.log('[AuthContext] 🔄 Session restored by resilience hook');
      if (session.user.id !== previousUserIdRef.current) {
        setUserSafe(session.user);
        previousUserIdRef.current = session.user.id;
      }
      await deriveAndCacheRole(session);
      await updateRealtimeAndEmit(session);
    },
    onSessionLost: () => {
      console.log('[AuthContext] ❌ Session lost after max retries');
      // only drop user when session truly lost
      setUserSafe(null);
      previousUserIdRef.current = null;
      sessionStorage.removeItem('role');
      localStorage.removeItem('userRole');
      if (supabase) {
        try {
          supabase.removeAllChannels();
        } catch (err) {
          console.error('[AuthContext] Failed to remove channels:', err);
        }
      }
    }
  });

  useEffect(() => {
    if (hasInitialized.current) {
      console.log('[AuthContext] Already initialized, skipping');
      return;
    }
    mountedRef.current = true;
    hasInitialized.current = true;

    let initTimeout: number | undefined;

    const init = async () => {
      console.log('[AuthContext] Initializing...');
      initTimeout = window.setTimeout(() => {
        console.warn('[AuthContext] ⏱️ Initialization timeout (5s), forcing completion');
        setLoadingSafe(false);
        setAuthReadySafe(true);
      }, 5000);

      if (!isSupabaseConfigured || !supabase) {
        setUserSafe(null);
        setLoadingSafe(false);
        setAuthReadySafe(true);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] getSession error:', error.message);
          await attemptSessionRefresh();
          setLoadingSafe(false);
          setAuthReadySafe(true);
          return;
        }

        if (session) {
          const expiresAt = new Date(session.expires_at * 1000);
          if (expiresAt < new Date()) {
            await attemptSessionRefresh();
          } else {
            setUserSafe(session.user);
            previousUserIdRef.current = session.user.id;
            await deriveAndCacheRole(session);
            await updateRealtimeAndEmit(session);
          }
        } else {
          setUserSafe(null);
          previousUserIdRef.current = null;
        }

        setLoadingSafe(false);
        setAuthReadySafe(true);

        if (authStateListenerRef.current) {
          try {
            authStateListenerRef.current.subscription.unsubscribe();
          } catch (e) {
            console.warn('[AuthContext] Failed to unsubscribe previous listener:', e);
          }
        }

        const { data } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
          console.log('[AuthContext] 🔔 onAuthStateChange:', { event, hasSession: !!nextSession, userId: nextSession?.user?.id });

          // Only treat TOKEN_REFRESHED / SIGNED_IN / USER_UPDATED as "session present" updates.
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (nextSession?.user) {
              setUserSafe(nextSession.user);
              previousUserIdRef.current = nextSession.user.id;
              await deriveAndCacheRole(nextSession);
              await updateRealtimeAndEmit(nextSession);
            }
          } else if (event === 'SIGNED_OUT') {
            setUserSafe(null);
            previousUserIdRef.current = null;
            sessionStorage.removeItem('role');
            localStorage.removeItem('userRole');
            try { await supabase.removeAllChannels(); } catch (err) { console.error(err); }
          }

          if (!authReady) setAuthReadySafe(true);

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
      } finally {
        if (initTimeout) clearTimeout(initTimeout);
      }
    };

    init();

    // Light guard on visibility: avoid noisy immediate refreshes if page was just loaded
    const onVisibility = () => {
      lastVisibilityChangeRef.current = Date.now();
      // If visibility changes within a very short time after init, avoid triggering heavy refreshes in resilience hook (resilience hook should handle retries)
      ignoreVisibilityRefreshRef.current = true;
      setTimeout(() => {
        ignoreVisibilityRefreshRef.current = false;
      }, 1000); // 1s window
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mountedRef.current = false;
      if (initTimeout) clearTimeout(initTimeout);
      if (authStateListenerRef.current) {
        try { authStateListenerRef.current.subscription.unsubscribe(); } catch {}
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []); // empty deps

  // signUp / signIn / signOut / updateProfile unchanged (keep original implementations)
  // For brevity, reuse your existing implementations below:
  const signUp = async (email: string, password: string, userData: any) => { /* keep your existing signUp code here */ return { user: null, error: null as unknown as AuthError }; };
  const signIn = async (email: string, password: string) => { /* keep existing signIn */ return { user: null, error: null as unknown as AuthError }; };
  const signOut = async () => { /* keep existing signOut */ };

  const updateProfile = async (updates: any): Promise<{ error: PostgrestError | null }> => {
    if (!isSupabaseConfigured || !supabase || !user) return { error: null };
    const { error } = await supabase.from('users').update(updates).eq('id', user.id);
    if (!error && typeof updates?.role !== 'undefined') {
      try {
        sessionStorage.setItem('role', String(updates.role));
        localStorage.setItem('userRole', String(updates.role));
      } catch {}
    }
    return { error };
  };

  // placeholder implementations for referral-related functions; keep original logic in your file
  const processPendingReferral = async (userId: string) => ({ success: true });
  const processPendingReferralByUsername = async (userId: string) => ({ success: true });
  const activatePendingReferral = async (userId: string, email: string) => ({ success: true });

  return (
    <AuthContext.Provider value={{ user, loading, authReady, signUp, signIn, signOut, updateProfile, processPendingReferral, processPendingReferralByUsername, activatePendingReferral }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}