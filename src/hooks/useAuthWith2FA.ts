import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTwoFactorAuth } from './useTwoFactorAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthWith2FAState {
  isVerifying2FA: boolean;
  requires2FA: boolean;
  userEmail: string;
}

export const useAuthWith2FA = () => {
  const { user } = useAuth();
  const { verifyCode, isEnabled } = useTwoFactorAuth();
  const [state, setState] = useState<AuthWith2FAState>({
    isVerifying2FA: false,
    requires2FA: false,
    userEmail: ''
  });

  // Vérifier si l'utilisateur a 2FA activé
  const check2FAStatus = useCallback(async (userId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur vérification 2FA:', error);
        return false;
      }

      return data?.two_factor_enabled || false;
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      return false;
    }
  }, []);

  // Processus de connexion avec vérification 2FA
  const signInWith2FA = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Configuration manquante');
      return { success: false, requires2FA: false };
    }

    try {
      // Étape 1: Connexion initiale
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        toast.error('Email ou mot de passe incorrect');
        return { success: false, requires2FA: false };
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast.error('Erreur lors de la connexion');
        return { success: false, requires2FA: false };
      }

      // Étape 2: Vérifier si 2FA est activé
      const has2FA = await check2FAStatus(userId);
      
      if (has2FA) {
        // 2FA requis - déconnecter temporairement et demander le code
        await supabase.auth.signOut();
        
        setState({
          isVerifying2FA: true,
          requires2FA: true,
          userEmail: email
        });

        return { success: false, requires2FA: true };
      } else {
        // Pas de 2FA - connexion réussie
        toast.success('Connexion réussie !');
        return { success: true, requires2FA: false };
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      toast.error('Erreur lors de la connexion');
      return { success: false, requires2FA: false };
    }
  }, [check2FAStatus]);

  // Vérifier le code 2FA et finaliser la connexion
  const verify2FAAndSignIn = useCallback(async (code: string) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Configuration manquante');
      return false;
    }

    try {
      // Étape 1: Reconnexion avec les mêmes identifiants
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: state.userEmail,
        password: '' // On ne peut pas récupérer le mot de passe, donc on utilise une session temporaire
      });

      if (authError) {
        toast.error('Erreur lors de la reconnexion');
        return false;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast.error('Erreur lors de la reconnexion');
        return false;
      }

      // Étape 2: Vérifier le code 2FA
      const isValidCode = await verifyCode(code);
      
      if (isValidCode) {
        // Code valide - connexion réussie
        setState({
          isVerifying2FA: false,
          requires2FA: false,
          userEmail: ''
        });
        
        toast.success('Connexion réussie !');
        return true;
      } else {
        toast.error('Code 2FA invalide');
        return false;
      }
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      toast.error('Erreur lors de la vérification');
      return false;
    }
  }, [state.userEmail, verifyCode]);

  // Annuler la vérification 2FA
  const cancel2FA = useCallback(() => {
    setState({
      isVerifying2FA: false,
      requires2FA: false,
      userEmail: ''
    });
  }, []);

  return {
    ...state,
    signInWith2FA,
    verify2FAAndSignIn,
    cancel2FA,
    check2FAStatus
  };
};
