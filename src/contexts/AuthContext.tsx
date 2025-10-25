/**
 * AuthContext - Système d'authentification optimisé avec Supabase
 * 
 * Fonctionnalités :
 * - Persistance automatique via supabase.auth.onAuthStateChange
 * - Pas de useEffect qui refait des requêtes à chaque render
 * - L'utilisateur reste connecté même après changement d'onglet
 * - Gestion intelligente des états de chargement
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authReady: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Fonction pour gérer les changements d'état d'authentification
         const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
           // Auth state changed - logs supprimés pour la propreté

           setSession(session);
           setUser(session?.user ?? null);
           setLoading(false);
           setAuthReady(true);
         }, []);

  // Initialisation de l'écoute des changements d'état d'authentification
  useEffect(() => {
    let mounted = true;

    // Vérifier si Supabase est configuré
    if (!supabase) {
      console.error('❌ Supabase client is not initialized - check environment variables');
      setLoading(false);
      setAuthReady(true);
      return;
    }

    // Récupérer la session actuelle
    const getInitialSession = async () => {
      try {
        console.log('🔄 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);
        } else {
          console.log('✅ Session retrieved:', session ? 'User logged in' : 'No user');
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setAuthReady(true);
          }
        }
      } catch (error) {
        console.error('❌ Exception during auth init:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Fonction d'inscription
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
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
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de déconnexion
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de mise à jour du profil
  const updateProfile = useCallback(async (updates: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        return { error };
      }

      console.log('✅ Profil mis à jour avec succès');
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la mise à jour du profil:', error);
      return { error: error as AuthError };
    }
  }, []);

  // Fonction de réinitialisation du mot de passe
  const resetPassword = useCallback(async (email: string) => {
    try {
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

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    authReady,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}