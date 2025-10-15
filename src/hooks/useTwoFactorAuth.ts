import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface TwoFactorSecret {
  id: string;
  user_id: string;
  secret_key: string;
  backup_codes: string[];
  method: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

interface TwoFactorAttempt {
  id: string;
  user_id: string;
  attempt_type: 'success' | 'failed' | 'backup_code_used';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useTwoFactorAuth = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [secret, setSecret] = useState<TwoFactorSecret | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Charger le statut 2FA
  const loadTwoFactorStatus = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setIsEnabled(false);
      setSecret(null);
      return;
    }

    try {
      setLoading(true);
      
      // Vérifier si 2FA est activé dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('two_factor_enabled')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Erreur chargement statut 2FA:', userError);
        setIsEnabled(false);
        return;
      }

      setIsEnabled(userData?.two_factor_enabled || false);

      // Si 2FA est activé, charger les secrets
      if (userData?.two_factor_enabled) {
        const { data: secretData, error: secretError } = await supabase
          .from('user_two_factor_secrets')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('method', 'totp')
          .single();

        if (!secretError && secretData) {
          setSecret(secretData);
          setBackupCodes(secretData.backup_codes || []);
        }
      }
    } catch (error) {
      console.error('Erreur chargement 2FA:', error);
      setIsEnabled(false);
      setSecret(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Générer un nouveau secret 2FA
  const generateSecret = useCallback(async (): Promise<{ qrCode: string; secret: string; backupCodes: string[] } | null> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Configuration manquante');
      return null;
    }

    try {
      setLoading(true);

      // Générer un secret TOTP avec Supabase Auth
      const { data, error } = await (supabase as any).auth.mfa.enroll({ 
        factorType: 'totp', 
        friendlyName: 'FiverFlow Security' 
      });

      if (error) throw error;

      const totp = (data as any)?.totp;
      const factorId = (data as any)?.id;

      // Générer des codes de sauvegarde
      const { data: backupCodesData, error: backupError } = await supabase
        .rpc('generate_backup_codes', { count: 8 });

      if (backupError) {
        console.warn('Erreur génération codes de sauvegarde:', backupError);
      }

      const backupCodes = backupCodesData || [];

      // Stocker le secret dans notre base de données
      const { error: insertError } = await supabase
        .from('user_two_factor_secrets')
        .insert({
          user_id: user.id,
          secret_key: totp?.secret || '',
          backup_codes: backupCodes,
          method: 'totp',
          is_active: false // Pas encore activé, en attente de vérification
        });

      if (insertError) throw insertError;

      return {
        qrCode: totp?.qr_code || '',
        secret: totp?.secret || '',
        backupCodes: backupCodes
      };
    } catch (error) {
      console.error('Erreur génération secret 2FA:', error);
      toast.error('Erreur lors de la génération du secret 2FA');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Vérifier et activer 2FA
  const verifyAndEnable = useCallback(async (code: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !user || !secret) {
      toast.error('Configuration manquante');
      return false;
    }

    try {
      setLoading(true);

      // Vérifier le code avec Supabase Auth
      const { error } = await (supabase as any).auth.mfa.verify({ 
        factorId: secret.id, 
        code: code.trim() 
      });

      if (error) throw error;

      // Activer 2FA dans notre base de données
      const { error: updateError } = await supabase
        .from('users')
        .update({ two_factor_enabled: true })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Marquer le secret comme actif
      const { error: secretUpdateError } = await supabase
        .from('user_two_factor_secrets')
        .update({ 
          is_active: true,
          last_used_at: new Date().toISOString()
        })
        .eq('id', secret.id);

      if (secretUpdateError) throw secretUpdateError;

      // Enregistrer la tentative réussie
      await supabase
        .from('two_factor_attempts')
        .insert({
          user_id: user.id,
          attempt_type: 'success',
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        });

      setIsEnabled(true);
      toast.success('Authentification à deux facteurs activée avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      
      // Enregistrer la tentative échouée
      await supabase
        .from('two_factor_attempts')
        .insert({
          user_id: user.id,
          attempt_type: 'failed',
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        });

      toast.error('Code invalide ou expiré');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, secret]);

  // Désactiver 2FA
  const disable = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Configuration manquante');
      return false;
    }

    try {
      setLoading(true);

      // Désactiver 2FA dans la table users
      const { error: userError } = await supabase
        .from('users')
        .update({ two_factor_enabled: false })
        .eq('id', user.id);

      if (userError) throw userError;

      // Désactiver tous les secrets 2FA
      const { error: secretError } = await supabase
        .from('user_two_factor_secrets')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (secretError) throw secretError;

      setIsEnabled(false);
      setSecret(null);
      setBackupCodes([]);
      toast.success('Authentification à deux facteurs désactivée');
      return true;
    } catch (error) {
      console.error('Erreur désactivation 2FA:', error);
      toast.error('Erreur lors de la désactivation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Vérifier un code 2FA (pour la connexion)
  const verifyCode = useCallback(async (code: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      return false;
    }

    try {
      // D'abord, essayer de vérifier avec Supabase Auth
      if (secret) {
        const { error } = await (supabase as any).auth.mfa.verify({ 
          factorId: secret.id, 
          code: code.trim() 
        });

        if (!error) {
          // Enregistrer la tentative réussie
          await supabase
            .from('two_factor_attempts')
            .insert({
              user_id: user.id,
              attempt_type: 'success',
              ip_address: await getClientIP(),
              user_agent: navigator.userAgent
            });

          return true;
        }
      }

      // Si le code TOTP échoue, essayer les codes de sauvegarde
      const { data: backupResult, error: backupError } = await supabase
        .rpc('verify_backup_code', {
          user_uuid: user.id,
          code: code.trim()
        });

      if (!backupError && backupResult) {
        // Enregistrer l'utilisation d'un code de sauvegarde
        await supabase
          .from('two_factor_attempts')
          .insert({
            user_id: user.id,
            attempt_type: 'backup_code_used',
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent
          });

        return true;
      }

      // Enregistrer la tentative échouée
      await supabase
        .from('two_factor_attempts')
        .insert({
          user_id: user.id,
          attempt_type: 'failed',
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        });

      return false;
    } catch (error) {
      console.error('Erreur vérification code 2FA:', error);
      return false;
    }
  }, [user?.id, secret]);

  // Obtenir l'IP du client (simulation)
  const getClientIP = async (): Promise<string | undefined> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  };

  // Charger le statut au montage
  useEffect(() => {
    loadTwoFactorStatus();
  }, [loadTwoFactorStatus]);

  return {
    loading,
    isEnabled,
    secret,
    backupCodes,
    loadTwoFactorStatus,
    generateSecret,
    verifyAndEnable,
    disable,
    verifyCode
  };
};
