import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTwoFactorAuth } from './useTwoFactorAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthWith2FAResult {
  success: boolean;
  requires2FA?: boolean;
  user?: any;
  error?: string;
}

export const useAuthWith2FA = () => {
  const { user } = useAuth();
  const { verifyCode, isEnabled } = useTwoFactorAuth();
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const signInWithPassword = async (credentials: LoginCredentials): Promise<AuthWith2FAResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Configuration manquante' };
    }

    setLoading(true);
    try {
      // Tentative de connexion normale
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Vérifier si l'utilisateur a 2FA activé
      const has2FA = await isEnabled();
      
      if (has2FA) {
        // L'utilisateur a 2FA activé, on doit demander le code
        setRequires2FA(true);
        setPendingUser(data.user);
        return { 
          success: false, 
          requires2FA: true,
          user: data.user
        };
      }

      // Pas de 2FA, connexion réussie
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    } finally {
      setLoading(false);
    }
  };

  const verify2FAAndComplete = async (code: string): Promise<AuthWith2FAResult> => {
    if (!pendingUser) {
      return { success: false, error: 'Aucune session en attente' };
    }

    setLoading(true);
    try {
      // Vérifier le code 2FA
      const isValid = await verifyCode(code);
      
      if (isValid) {
        // Code valide, connexion complétée
        setRequires2FA(false);
        setPendingUser(null);
        toast.success('Connexion réussie !');
        return { success: true, user: pendingUser };
      } else {
        return { success: false, error: 'Code de vérification invalide' };
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return { success: false, error: 'Erreur lors de la vérification' };
    } finally {
      setLoading(false);
    }
  };

  const cancel2FA = () => {
    setRequires2FA(false);
    setPendingUser(null);
    // Déconnexion de l'utilisateur
    if (supabase) {
      supabase.auth.signOut();
    }
  };

  return {
    signInWithPassword,
    verify2FAAndComplete,
    cancel2FA,
    loading,
    requires2FA,
    pendingUser
  };
};
