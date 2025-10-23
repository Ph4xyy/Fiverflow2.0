/**
 * Hook de compatibilité pour maintenir la compatibilité avec l'ancien système d'authentification
 * Utilise le nouveau GlobalAuthProvider en arrière-plan
 */

import { useGlobalAuth } from '../contexts/GlobalAuthProvider';

/**
 * Hook de compatibilité qui expose l'interface de l'ancien useAuth
 * mais utilise le nouveau GlobalAuthProvider en arrière-plan
 */
export const useAuth = () => {
  const globalAuth = useGlobalAuth();
  
  return {
    // Interface compatible avec l'ancien AuthContext
    user: globalAuth.user,
    session: globalAuth.session,
    loading: globalAuth.authLoading,
    authReady: globalAuth.authReady,
    
    // Actions compatibles
    signUp: globalAuth.signUp,
    signIn: globalAuth.signIn,
    signOut: globalAuth.signOut,
    updateProfile: globalAuth.updateProfile,
    resetPassword: globalAuth.resetPassword,
    
    // Nouvelles fonctionnalités disponibles
    profile: globalAuth.profile,
    subscription: globalAuth.subscription,
    isAdmin: globalAuth.isAdmin,
    profileLoading: globalAuth.profileLoading,
    subscriptionLoading: globalAuth.subscriptionLoading,
    refreshUserData: globalAuth.refreshUserData,
    invalidateCache: globalAuth.invalidateCache,
  };
};

/**
 * Hook de compatibilité pour useUserData
 * Utilise les données du profil depuis GlobalAuthProvider
 */
export const useUserData = () => {
  const globalAuth = useGlobalAuth();
  
  return {
    role: globalAuth.isAdmin ? 'admin' : 'user',
    loading: globalAuth.profileLoading,
    refreshUserRole: async () => {
      await globalAuth.refreshUserData();
    },
  };
};

export default useAuth;
