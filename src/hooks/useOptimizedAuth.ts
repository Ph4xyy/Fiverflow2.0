import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface OptimizedAuthState {
  user: any;
  loading: boolean;
  role: string | null;
  roleLoading: boolean;
}

/**
 * Hook simplifié qui combine AuthContext et UserDataContext
 * Navigation ultra-fluide sans cache
 */
export const useOptimizedAuth = (): OptimizedAuthState => {
  const { user, loading: authLoading } = useAuth();
  const userData = useUserData();
  
  // Get role from multiple sources with fallback
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  
  const effectiveRole = roleFromContext || roleFromMeta || null;
  
  const roleLoading = Boolean(userData?.loading);
  
  return {
    user,
    loading: authLoading,
    role: effectiveRole,
    roleLoading
  };
};
