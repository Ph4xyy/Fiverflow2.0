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

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, authReady } = useAuth();
  const [role, setRole] = useState<'admin' | 'user' | null>(null); // null par défaut
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
    // GUARD: Ne pas fetcher tant que auth est en cours de chargement
    if (authLoading) {
      console.log('[UserDataContext] fetchUserRole: ⏳ Waiting for auth to finish loading...');
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
      setRole('user'); // Fallback seulement si vraiment pas de Supabase
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;

    try {
      console.log('[UserDataContext] 📡 Making database query for role...');
      const result = await debugAuth.testUserRoleQuery(userId);
      
      if (!result.success) {
        const errorCode = (result.error as any)?.code;
        const errorMessage = (result.error as any)?.message || '';
        
        // Gérer les erreurs 401/403 (JWT invalide) sans dégrader le rôle
        if (errorCode === 'PGRST301' || errorMessage.includes('JWT') || errorMessage.includes('expired')) {
          console.warn('[UserDataContext] ⚠️ Auth error, will retry after token refresh:', result.error);
          // Ne pas changer le rôle, laisser null pour afficher skeleton
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }
        
        console.error('[UserDataContext] ❌ Error fetching user role:', result.error);
        // En cas d'erreur autre que JWT, fallback sur 'user'
        setRole('user');
        sessionStorage.setItem('role', 'user');
        localStorage.setItem('userRole', 'user');
      } else {
        const fetchedRole = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('[UserDataContext] ✅ Role fetched from DB:', fetchedRole);
        setRole(fetchedRole);
        sessionStorage.setItem('role', fetchedRole);
        localStorage.setItem('userRole', fetchedRole);
        lastFetchedUserIdRef.current = userId;
      }
    } catch (err: any) {
      // Gérer les erreurs non catchées (401/403)
      if (err?.code === 'PGRST301' || err?.message?.includes('JWT')) {
        console.warn('[UserDataContext] ⚠️ Auth error in catch, will retry:', err);
        // Ne pas dégrader le rôle
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      console.error('[UserDataContext] 💥 Unexpected error while fetching role:', err);
      setRole('user'); // Fallback seulement en cas d'erreur vraiment inattendue
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
    
    // GUARD: NE PAS FETCHER tant que auth est en cours de chargement
    if (authLoading) {
      console.log('[UserDataContext] ⏳ Waiting for auth to finish loading...');
      setLoading(true);
      return;
    }
    
    if (!user) {
      console.log('[UserDataContext] ❌ No user, setting role to null');
      setRole(null);
      setLoading(false);
      lastFetchedUserIdRef.current = null;
      return;
    }

    // PRIORITÉ 1: Check app_metadata (le plus fiable pour isAdmin)
    const appMetaRole = user.app_metadata?.role;
    if (appMetaRole) {
      console.log('[UserDataContext] ✅ Using app_metadata role:', appMetaRole);
      const resolvedRole = appMetaRole === 'admin' ? 'admin' : 'user';
      setRole(resolvedRole);
      sessionStorage.setItem('role', resolvedRole);
      localStorage.setItem('userRole', resolvedRole);
      setLoading(false);
      lastFetchedUserIdRef.current = user.id;
      return;
    }

    // PRIORITÉ 2: Check user_metadata
    const userMetaRole = user.user_metadata?.role;
    if (userMetaRole) {
      console.log('[UserDataContext] ✅ Using user_metadata role:', userMetaRole);
      const resolvedRole = userMetaRole === 'admin' ? 'admin' : 'user';
      setRole(resolvedRole);
      sessionStorage.setItem('role', resolvedRole);
      localStorage.setItem('userRole', resolvedRole);
      setLoading(false);
      lastFetchedUserIdRef.current = user.id;
      return;
    }
    
    // PRIORITÉ 3: Check cache (sessionStorage first, then localStorage)
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

    // PRIORITÉ 4: Fetch depuis la DB profiles avec debounce
    const timeoutId = setTimeout(() => {
      console.log('[UserDataContext] 🔄 Starting role fetch from profiles table...');
      setLoading(true);
      // Ne pas mettre de rôle par défaut, laisser null pour skeleton
      fetchUserRole(user.id);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id, authLoading, fetchUserRole]);

  // Écouter les refreshs de session pour refetch le rôle
  useEffect(() => {
    const handleSessionRefreshed = () => {
      console.log('[UserDataContext] 🔄 Session refreshed, refetching role...');
      if (user?.id && !authLoading) {
        lastFetchedUserIdRef.current = null; // Force refetch
        fetchUserRole(user.id);
      }
    };

    window.addEventListener('ff:session:refreshed', handleSessionRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', handleSessionRefreshed as any);
  }, [user?.id, authLoading, fetchUserRole]);

  const refreshUserRole = useCallback(async () => {
    console.log('[UserDataContext] refreshUserRole: Manual refresh requested');
    if (user?.id && !authLoading) {
      lastFetchedUserIdRef.current = null; // Force refetch
      await fetchUserRole(user.id);
    } else {
      console.log('[UserDataContext] refreshUserRole: ❌ Cannot refresh - no user or auth still loading');
    }
  }, [user?.id, authLoading, fetchUserRole]);

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
