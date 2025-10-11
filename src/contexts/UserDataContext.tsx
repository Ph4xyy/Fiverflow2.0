// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { debugAuth } from '../utils/debugAuth';

interface UserDataContextType {
  role: 'admin' | 'user';
  loading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, authReady } = useAuth();
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(true);
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
    // GUARD: Ne pas fetcher tant que authReady n'est pas true
    if (!authReady) {
      console.log('[UserDataContext] fetchUserRole: ⏳ Waiting for auth to be ready...');
      return;
    }

    // Protection contre les appels simultanés
    if (isFetchingRef.current) {
      console.log('[UserDataContext] fetchUserRole: ⏭️ Already fetching, skipping');
      return;
    }

    // Éviter de refetch pour le même utilisateur
    if (lastFetchedUserIdRef.current === userId) {
      console.log('[UserDataContext] fetchUserRole: ✓ Already fetched for this user');
      return;
    }

    console.log('[UserDataContext] fetchUserRole: 🔄 Fetching role for user:', userId);
    
    if (!userId || !isSupabaseConfigured) {
      console.log('[UserDataContext] ❌ No user or Supabase not configured');
      setRole('user');
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;

    try {
      console.log('[UserDataContext] 📡 Making database query for role...');
      const result = await debugAuth.testUserRoleQuery(userId);
      
      if (!result.success) {
        console.error('[UserDataContext] ❌ Error fetching user role:', result.error);
        setRole('user');
        sessionStorage.setItem('role', 'user');
        localStorage.setItem('userRole', 'user');
      } else {
        const role = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('[UserDataContext] ✅ Role fetched from DB:', role);
        setRole(role);
        sessionStorage.setItem('role', role);
        localStorage.setItem('userRole', role);
        lastFetchedUserIdRef.current = userId;
      }
    } catch (err) {
      console.error('[UserDataContext] 💥 Unexpected error while fetching role:', err);
      setRole('user');
    } finally {
      console.log('[UserDataContext] 🏁 fetchUserRole completed');
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [authReady]);

  useEffect(() => {
    console.log('[UserDataContext] useEffect triggered:', { 
      hasUser: !!user, 
      userId: user?.id,
      authLoading, 
      authReady,
      lastFetchedUserId: lastFetchedUserIdRef.current
    });
    
    // GUARD: NE PAS FETCHER tant que authReady n'est pas true
    if (!authReady) {
      console.log('[UserDataContext] ⏳ Waiting for auth to be ready...');
      setLoading(true);
      return;
    }

    // Attendre que l'auth soit complètement chargé
    if (authLoading) {
      console.log('[UserDataContext] ⏳ Waiting for auth to finish loading...');
      setLoading(true);
      return;
    }
    
    if (!user) {
      console.log('[UserDataContext] ❌ No user, setting default role');
      setRole('user');
      setLoading(false);
      lastFetchedUserIdRef.current = null;
      return;
    }

    // Check metadata first (most reliable)
    const metaRole = user.app_metadata?.role || user.user_metadata?.role;
    if (metaRole) {
      console.log('[UserDataContext] ✅ Using metadata role:', metaRole);
      setRole(metaRole === 'admin' ? 'admin' : 'user');
      sessionStorage.setItem('role', String(metaRole));
      localStorage.setItem('userRole', String(metaRole));
      setLoading(false);
      lastFetchedUserIdRef.current = user.id;
      return;
    }
    
    // Check cache (sessionStorage first, then localStorage)
    const sessionRole = sessionStorage.getItem('role');
    const localRole = localStorage.getItem('userRole');
    const cachedRole = sessionRole || localRole;
    
    if (cachedRole && lastFetchedUserIdRef.current === user.id) {
      console.log('[UserDataContext] ✓ Using cached role:', cachedRole);
      const resolvedRole = cachedRole === 'admin' ? 'admin' : 'user';
      setRole(resolvedRole);
      sessionStorage.setItem('role', resolvedRole);
      localStorage.setItem('userRole', resolvedRole);
      setLoading(false);
      return;
    }

    // Dernier recours : fetch depuis la DB avec debounce
    const timeoutId = setTimeout(() => {
      console.log('[UserDataContext] 🔄 Starting role fetch from DB...');
      setLoading(true);
      fetchUserRole(user.id);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id, authLoading, authReady, fetchUserRole]);

  const refreshUserRole = useCallback(async () => {
    console.log('[UserDataContext] refreshUserRole: Manual refresh requested');
    if (user?.id && authReady) {
      lastFetchedUserIdRef.current = null; // Force refetch
      await fetchUserRole(user.id);
    } else {
      console.log('[UserDataContext] refreshUserRole: ❌ Cannot refresh - no user or auth not ready');
    }
  }, [user?.id, authReady, fetchUserRole]);

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
