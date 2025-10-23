/**
 * GlobalAuthProvider - Système d'authentification global optimisé
 * 
 * Fonctionnalités :
 * - Persistance en mémoire via React Query
 * - Cache intelligent des données utilisateur et des rôles
 * - Navigation instantanée sans refetch
 * - Gestion optimisée des états de chargement
 * - Synchronisation automatique avec Supabase
 */

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Types pour le contexte global
interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSubscription {
  id: string;
  plan_name: string;
  status: string;
  current_period_end: string;
  trial_end?: string;
}

interface GlobalAuthContextType {
  // État d'authentification
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  isAdmin: boolean;
  
  // États de chargement
  authLoading: boolean;
  profileLoading: boolean;
  subscriptionLoading: boolean;
  authReady: boolean;
  
  // Actions
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  
  // Cache management
  invalidateCache: () => void;
  refreshUserData: () => Promise<void>;
}

const GlobalAuthContext = createContext<GlobalAuthContextType | undefined>(undefined);

// Configuration du QueryClient pour la persistance optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 10 minutes par défaut
      staleTime: 10 * 60 * 1000,
      // Garde en cache pendant 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry automatique
      retry: 2,
      // Refetch en arrière-plan
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Clés de requête pour React Query
const QUERY_KEYS = {
  auth: ['auth'] as const,
  session: ['auth', 'session'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
  subscription: (userId: string) => ['auth', 'subscription', userId] as const,
  adminStatus: (userId: string) => ['auth', 'admin', userId] as const,
};

// Hook pour récupérer la session
const useAuthSession = () => {
  return useQuery({
    queryKey: QUERY_KEYS.session,
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        return null;
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erreur lors de la récupération de session:', error);
        throw error;
      }
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook pour récupérer le profil utilisateur
const useUserProfile = (userId: string | null) => {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.profile(userId) : ['auth', 'profile', 'null'],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId || !isSupabaseConfigured || !supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook pour récupérer l'abonnement
const useUserSubscription = (userId: string | null) => {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.subscription(userId) : ['auth', 'subscription', 'null'],
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!userId || !isSupabaseConfigured || !supabase) {
        return null;
      }

      const { data, error } = await supabase
        .rpc('get_user_current_subscription', { user_uuid: userId });

      if (error) {
        console.error('Erreur lors du chargement de l\'abonnement:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook pour vérifier le statut admin
const useAdminStatus = (userId: string | null) => {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.adminStatus(userId) : ['auth', 'admin', 'null'],
    queryFn: async (): Promise<boolean> => {
      if (!userId || !isSupabaseConfigured || !supabase) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        return false;
      }

      return data?.is_admin || false;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 heure
  });
};

// Composant interne du provider
const GlobalAuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Requêtes pour les données d'authentification
  const { data: session, isLoading: sessionLoading, error: sessionError } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session?.user?.id || null);
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription(session?.user?.id || null);
  const { data: isAdmin } = useAdminStatus(session?.user?.id || null);

  // Gestion des changements d'état d'authentification
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.id);
      
      // Invalider le cache de session
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session });
      
      // Si l'utilisateur se connecte, précharger les données
      if (event === 'SIGNED_IN' && session?.user) {
        // Précharger le profil et l'abonnement
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.profile(session.user.id),
          queryFn: async () => {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            return error ? null : data;
          },
        });

        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.subscription(session.user.id),
          queryFn: async () => {
            const { data, error } = await supabase
              .rpc('get_user_current_subscription', { user_uuid: session.user.id });
            return error ? null : (data && data.length > 0 ? data[0] : null);
          },
        });
      }
      
      // Si l'utilisateur se déconnecte, nettoyer le cache
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Fonction d'inscription
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData }
      });

      if (error) {
        console.error('❌ Erreur lors de l\'inscription:', error);
        return { user: null, error };
      }

      console.log('✅ Inscription réussie:', data.user?.id);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'inscription:', error);
      return { user: null, error: error as AuthError };
    }
  }, []);

  // Fonction de connexion
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        return { user: null, error };
      }

      console.log('✅ Connexion réussie:', data.user?.id);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la connexion:', error);
      return { user: null, error: error as AuthError };
    }
  }, []);

  // Fonction de déconnexion
  const signOut = useCallback(async () => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        return { error };
      }

      console.log('✅ Déconnexion réussie');
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la déconnexion:', error);
      return { error: error as AuthError };
    }
  }, []);

  // Fonction de mise à jour du profil
  const updateProfile = useCallback(async (updates: any) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        return { error };
      }

      // Invalider le cache du profil pour forcer le rechargement
      if (session?.user?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(session.user.id) });
      }

      console.log('✅ Profil mis à jour avec succès');
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la mise à jour du profil:', error);
      return { error: error as AuthError };
    }
  }, [session?.user?.id, queryClient]);

  // Fonction de réinitialisation du mot de passe
  const resetPassword = useCallback(async (email: string) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error);
        return { error };
      }

      console.log('✅ Email de réinitialisation envoyé');
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la réinitialisation:', error);
      return { error: error as AuthError };
    }
  }, []);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
  }, [queryClient]);

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = useCallback(async () => {
    if (session?.user?.id) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(session.user.id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscription(session.user.id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminStatus(session.user.id) }),
      ]);
    }
  }, [session?.user?.id, queryClient]);

  // Déterminer si l'authentification est prête
  const authReady = !sessionLoading && !sessionError;

  const contextValue: GlobalAuthContextType = {
    // État d'authentification
    user: session?.user || null,
    session,
    profile: profile || null,
    subscription: subscription || null,
    isAdmin: isAdmin || false,
    
    // États de chargement
    authLoading: sessionLoading,
    profileLoading: profileLoading,
    subscriptionLoading: subscriptionLoading,
    authReady,
    
    // Actions
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    
    // Cache management
    invalidateCache,
    refreshUserData,
  };

  return (
    <GlobalAuthContext.Provider value={contextValue}>
      {children}
    </GlobalAuthContext.Provider>
  );
};

// Provider principal avec QueryClient
export const GlobalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalAuthProviderInner>
        {children}
      </GlobalAuthProviderInner>
    </QueryClientProvider>
  );
};

// Hook pour utiliser le contexte d'authentification global
export const useGlobalAuth = (): GlobalAuthContextType => {
  const context = useContext(GlobalAuthContext);
  if (!context) {
    throw new Error('useGlobalAuth must be used within a GlobalAuthProvider');
  }
  return context;
};

// Hook pour accéder au QueryClient (utile pour les composants qui ont besoin de gérer le cache)
export const useQueryClient = () => {
  return React.useContext(React.createContext(queryClient));
};

export default GlobalAuthProvider;
