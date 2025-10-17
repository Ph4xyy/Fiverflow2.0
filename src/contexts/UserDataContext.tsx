// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { debugAuth } from '../utils/debugAuth';

interface UserDataContextType {
  role: 'admin' | 'user' | null; // null = rôle inconnu (skeleton)
  loading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

/**
 * Key changes in this file:
 * - If a user exists, we optimistically set role to 'user' so UI won't show skeletons
 * - fetchUserRole runs in background and updates the role when DB responds
 * - We avoid blocking on authLoading (navigation instantanée)
 */
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, authReady } = useAuth();
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(false); // kept false to avoid nav blocking
  const isFetchingRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  console.log('[UserDataContext] Render:', { 
    hasUser: !!user, 
    userId: user?.id,
    authLoading, 
    authReady,
    role,
    loading
  });

  const fetchUserRole = useCallback(async (userId: string) => {
    // Protection contre les appels simultanés
    if (isFetchingRef.current) {
      console.log('[UserDataContext] fetchUserRole: ⏭️ Already fetching, skipping');
      return;
    }

    // Eviter refetch inutile
    if (lastFetchedUserIdRef.current === userId) {
      console.log('[UserDataContext] fetchUserRole: ✓ Already fetched for this user');
      return;
    }

    if (!userId || !isSupabaseConfigured) {
      console.log('[UserDataContext] fetchUserRole: ❌ No user or Supabase not configured');
      // keep optimistic role if present, don't force a blocking fallback
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      console.log('[UserDataContext] 📡 Making database query for role...');
      const result = await debugAuth.testUserRoleQuery(userId);

      if (!result.success) {
        const errorCode = (result.error as any)?.code;
        const errorMessage = (result.error as any)?.message || '';

        // JWT / auth errors => don't override optimistic role, retry later
        if (errorCode === 'PGRST301' || errorMessage.includes('JWT') || errorMessage.includes('expired')) {
          console.warn('[UserDataContext] ⚠️ Auth error fetching role, will retry after token refresh:', result.error);
          // leave role as-is (optimistic) and exit
          return;
        }

        console.error('[UserDataContext] ❌ Error fetching user role:', result.error);
        setRole('user'); // fallback safe
      } else {
        const fetchedRole = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('[UserDataContext] ✅ Role fetched from DB:', fetchedRole);
        setRole(fetchedRole);
        lastFetchedUserIdRef.current = userId;
        // cache role short-term
        try {
          sessionStorage.setItem('role', fetchedRole);
          localStorage.setItem('userRole', fetchedRole);
        } catch {}
      }
    } catch (err: any) {
      if (err?.code === 'PGRST301' || err?.message?.includes('JWT')) {
        console.warn('[UserDataContext] ⚠️ Auth error in catch, will retry:', err);
        return;
      }
      console.error('[UserDataContext] 💥 Unexpected error while fetching role:', err);
      setRole('user'); // fallback
    } finally {
      console.log('[UserDataContext] 🏁 fetchUserRole completed');
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('[UserDataContext] useEffect triggered:', { 
      hasUser: !!user, 
      userId: user?.id,
      authLoading, 
      authReady,
      lastFetchedUserId: lastFetchedUserIdRef.current
    });

    // If no user, clear caches and return quickly
    if (!user) {
      console.log('[UserDataContext] ❌ No user, setting role to null');
      setRole(null);
      setLoading(false);
      lastFetchedUserIdRef.current = null;
      return;
    }

    // If we have app_metadata or user_metadata, use them immediately (highest priority)
    const appMetaRole = user.app_metadata?.role;
    if (appMetaRole) {
      const resolvedRole = appMetaRole === 'admin' ? 'admin' : 'user';
      console.log('[UserDataContext] ✅ Using app_metadata role:', resolvedRole);
      setRole(resolvedRole);
      try {
        sessionStorage.setItem('role', resolvedRole);
        localStorage.setItem('userRole', resolvedRole);
      } catch {}
      setLoading(false);
      lastFetchedUserIdRef.current = user.id;
      return;
    }

    const userMetaRole = user.user_metadata?.role;
    if (userMetaRole) {
      const resolvedRole = userMetaRole === 'admin' ? 'admin' : 'user';
      console.log('[UserDataContext] ✅ Using user_metadata role:', resolvedRole);
      setRole(resolvedRole);
      setLoading(false);
      lastFetchedUserIdRef.current = user.id;
      return;
    }

    // --- KEY CHANGE: optimistic role to avoid skeletons / loading on UI ---
    // If we have a logged user but no metadata yet, assume 'user' while we fetch DB.
    if (!role) {
      console.log('[UserDataContext] ⚡ No metadata - applying optimistic role "user" for instant nav');
      setRole('user');
    }

    // Kick off background fetch to validate/correct role
    fetchUserRole(user.id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Re-fetch role when session refresh event happens
  useEffect(() => {
    const handleSessionRefreshed = () => {
      console.log('[UserDataContext] 🔄 Session refreshed, refetching role...');
      if (user?.id) {
        lastFetchedUserIdRef.current = null; // Force refetch
        fetchUserRole(user.id);
      }
    };

    window.addEventListener('ff:session:refreshed', handleSessionRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', handleSessionRefreshed as any);
  }, [user?.id, fetchUserRole]);

  const refreshUserRole = useCallback(async () => {
    console.log('[UserDataContext] refreshUserRole: Manual refresh requested');
    if (user?.id) {
      lastFetchedUserIdRef.current = null;
      await fetchUserRole(user.id);
    } else {
      console.log('[UserDataContext] refreshUserRole: ❌ Cannot refresh - no user');
    }
  }, [user?.id, fetchUserRole]);

  return (
    <UserDataContext.Provider value={{ role, loading, refreshUserRole }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within a UserDataProvider');
  return context;
};