import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useLoading } from '../contexts/LoadingContext';
import { authCache } from '../lib/authCache';

interface OptimizedAuthState {
  user: any;
  loading: boolean;
  role: string | null;
  roleLoading: boolean;
}

/**
 * Hook optimisé qui combine AuthContext et UserDataContext
 * pour éviter les états de loading multiples et les rechargements inutiles
 */
export const useOptimizedAuth = (): OptimizedAuthState => {
  const { user, loading: authLoading } = useAuth();
  const userData = useUserData();
  const { loading: globalLoading } = useLoading();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimeoutRef = useRef<number | undefined>();
  
  // Debounced refresh to prevent multiple rapid updates
  useEffect(() => {
    const handleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        setIsInitialized(false);
        // Small delay to let contexts update
        setTimeout(() => setIsInitialized(true), 50);
      }, 100);
    };
    
    window.addEventListener('ff:session:refreshed', handleRefresh);
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener('ff:session:refreshed', handleRefresh);
    };
  }, []);
  
  // Initialize after first load
  useEffect(() => {
    if (!authLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [authLoading, isInitialized]);
  
  // Get role from multiple sources with fallback and cache
  const roleFromSessionCache = sessionStorage.getItem('role');
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  
  // Check memory cache first
  const cachedData = user?.id ? authCache.get(authCache.getRoleKey(user.id)) : null;
  const roleFromMemoryCache = cachedData?.role;
  
  const effectiveRole = roleFromContext || roleFromMemoryCache || roleFromMeta || roleFromSessionCache || null;
  const roleLoading = Boolean(userData?.loading) && !isInitialized;
  
  // Update cache when we have fresh data
  useEffect(() => {
    if (user?.id && effectiveRole && !roleLoading) {
      authCache.set(authCache.getRoleKey(user.id), { role: effectiveRole }, 2 * 60 * 1000); // 2 minutes TTL
    }
  }, [user?.id, effectiveRole, roleLoading]);
  
  return {
    user,
    loading: authLoading || globalLoading.auth || !isInitialized,
    role: effectiveRole,
    roleLoading: roleLoading || globalLoading.role
  };
};
