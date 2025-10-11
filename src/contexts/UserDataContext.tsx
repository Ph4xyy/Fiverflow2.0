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

  const fetchUserRole = useCallback(async (userId: string) => {
    // Protection contre les appels simultanés
    if (isFetchingRef.current) {
      console.log('[UserDataContext] fetchUserRole: Already fetching, skipping');
      return;
    }

    console.log('[UserDataContext] fetchUserRole called for user:', userId);
    
    if (!userId || !isSupabaseConfigured) {
      console.log('[UserDataContext] No user or Supabase not configured');
      setRole('user');
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;

    try {
      console.log('[UserDataContext] Making database query for role...');
      const result = await debugAuth.testUserRoleQuery(userId);
      
      if (!result.success) {
        console.error('[UserDataContext] Error fetching user role:', result.error);
        setRole('user');
        sessionStorage.setItem('role', 'user');
        localStorage.setItem('userRole', 'user');
      } else {
        const role = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('[UserDataContext] Role fetched from DB:', role);
        setRole(role);
        sessionStorage.setItem('role', role);
        localStorage.setItem('userRole', role);
      }
    } catch (err) {
      console.error('[UserDataContext] Unexpected error while fetching role:', err);
      setRole('user');
    } finally {
      console.log('[UserDataContext] fetchUserRole completed, setting loading to false');
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('[UserDataContext] useEffect triggered:', { 
      hasUser: !!user, 
      userId: user?.id,
      authLoading, 
      authReady 
    });
    
    // NE PAS FETCHER tant que authReady n'est pas true
    if (!authReady) {
      console.log('[UserDataContext] Waiting for auth to be ready...');
      setLoading(true);
      return;
    }

    // Attendre que l'auth soit complètement chargé
    if (authLoading) {
      console.log('[UserDataContext] Waiting for auth to finish loading...');
      setLoading(true);
      return;
    }
    
    if (!user) {
      console.log('[UserDataContext] No user, setting default role');
      setRole('user');
      setLoading(false);
      return;
    }

    // Check metadata first (most reliable)
    const metaRole = user.app_metadata?.role || user.user_metadata?.role;
    if (metaRole) {
      console.log('[UserDataContext] Using metadata role:', metaRole);
      setRole(metaRole === 'admin' ? 'admin' : 'user');
      sessionStorage.setItem('role', String(metaRole));
      localStorage.setItem('userRole', String(metaRole));
      setLoading(false);
      return;
    }
    
    // Check cache (sessionStorage first, then localStorage)
    const sessionRole = sessionStorage.getItem('role');
    const localRole = localStorage.getItem('userRole');
    const cachedRole = sessionRole || localRole;
    
    if (cachedRole) {
      console.log('[UserDataContext] Using cached role:', cachedRole, '(from', sessionRole ? 'sessionStorage' : 'localStorage', ')');
      const resolvedRole = cachedRole === 'admin' ? 'admin' : 'user';
      setRole(resolvedRole);
      sessionStorage.setItem('role', resolvedRole);
      localStorage.setItem('userRole', resolvedRole);
      setLoading(false);
      return;
    }

    // Dernier recours : fetch depuis la DB avec debounce
    const timeoutId = setTimeout(() => {
      console.log('[UserDataContext] Starting role fetch from DB...');
      setLoading(true);
      fetchUserRole(user.id);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id, authLoading, authReady, fetchUserRole]);

  const refreshUserRole = useCallback(async () => {
    if (user?.id && authReady) {
      await fetchUserRole(user.id);
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
