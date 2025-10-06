import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
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
  
  // Get role from multiple sources with fallback
  const roleFromSessionCache = sessionStorage.getItem('role');
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  
  const effectiveRole = roleFromContext || roleFromMeta || roleFromSessionCache || null;
  
  const roleLoading = Boolean(userData?.loading);
  
  // 🔥 Debug logging pour identifier le problème
  console.log('🔍 useOptimizedAuth:', {
    user: user?.id,
    authLoading,
    roleLoading,
    effectiveRole,
    userDataLoading: userData?.loading
  });
  
  return {
    user,
    loading: authLoading,
    role: effectiveRole,
    roleLoading
  };
};
