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
  const [loading, setLoading] = useState(false); // 🔥 NAVIGATION INSTANTANÉE - Plus de loading initial
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
    // 🔥 NAVIGATION INSTANTANÉE - Plus d'attente d'auth
    if (authLoading) {
      console.log('[UserDataContext] fetchUserRole: ⚡ Auth loading but continuing anyway for instant nav');
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
      } else {
        const fetchedRole = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('[UserDataContext] ✅ Role fetched from DB:', fetchedRole);
        setRole(fetchedRole);
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
    
    // 🔥 NAVIGATION INSTANTANÉE - Plus d'attente d'auth
    if (authLoading) {
      console.log('[UserDataContext] ⚡ Auth loading but continuing anyway for instant nav');
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
      setLoading(false);
      lastFetchedUserIdRef.current = user.id;
      return;
    }

    // 🔥 NAVIGATION INSTANTANÉE - Plus de debounce, fetch immédiat
    console.log('[UserDataContext] 🔄 Starting role fetch from profiles table...');
    setLoading(false); // Pas de loading pour navigation instantanée
    // Ne pas mettre de rôle par défaut, laisser null pour skeleton
    fetchUserRole(user.id);
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
