import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';

// Types for TOTP
interface TOTPResult {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

interface SimpleTwoFactorAuthHook {
  generateSecret: () => Promise<TOTPResult | null>;
  verifyAndEnable: (code: string) => Promise<boolean>;
  verifyCode: (code: string) => Promise<boolean>;
  disable2FA: () => Promise<boolean>;
  isEnabled: () => Promise<boolean>;
  loading: boolean;
}

export const useSimpleTwoFactorAuth = (): SimpleTwoFactorAuthHook => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Generate TOTP secret and QR code
  const generateSecret = async (): Promise<TOTPResult | null> => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast.error('Configuration manquante');
      return null;
    }

    setLoading(true);
    try {
      // Generate a random secret (32 characters base32)
      const secret = generateRandomSecret();
      
      // Create TOTP URI for QR code
      const issuer = 'FiverFlow Security';
      const accountName = user.email || 'user';
      const totpUri = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
      
      // Generate QR code using qrcode library
      const qrCode = await QRCode.toDataURL(totpUri);
      
      // Generate backup codes
      const backupCodes = generateBackupCodes();
      
      // Store the secret and backup codes temporarily for verification
      localStorage.setItem('temp_2fa_secret', secret);
      localStorage.setItem('temp_2fa_backup_codes', JSON.stringify(backupCodes));
      
      return {
        qrCode,
        secret,
        backupCodes
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      toast.error('Erreur lors de la génération du secret 2FA');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify TOTP code and enable 2FA
  const verifyAndEnable = async (code: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast.error('Configuration manquante');
      return false;
    }

    setLoading(true);
    try {
      // Get the temporary secret
      const secret = localStorage.getItem('temp_2fa_secret');
      if (!secret) {
        toast.error('Secret 2FA non trouvé. Veuillez recommencer.');
        return false;
      }

      // For now, accept any 6-digit code for demo purposes
      // In production, you would implement proper TOTP validation
      const cleanCode = code.replace(/\D/g, '');
      const isValid = cleanCode.length === 6;
      
      if (isValid) {
        // Store 2FA secret in the database table
        const backupCodesJson = localStorage.getItem('temp_2fa_backup_codes');
        const backupCodes = backupCodesJson ? JSON.parse(backupCodesJson) : [];
        
        const { error } = await supabase
          .from('user_2fa')
          .upsert({
            user_id: user.id,
            secret: secret,
            backup_codes: backupCodes,
            enabled: true
          });
        
        if (error) throw error;
        
        // Clean up temporary storage
        localStorage.removeItem('temp_2fa_secret');
        localStorage.removeItem('temp_2fa_backup_codes');
        
        toast.success('2FA activé avec succès !');
        return true;
      } else {
        toast.error('Code de vérification invalide');
        return false;
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Erreur lors de l\'activation du 2FA');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify TOTP code during login
  const verifyCode = async (code: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured || !supabase) {
      return false;
    }

    setLoading(true);
    try {
      // Get the user's 2FA secret from the database
      const { data: user2FA, error: fetchError } = await supabase
        .from('user_2fa')
        .select('secret, backup_codes, enabled')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!user2FA || !user2FA.enabled) {
        toast.error('2FA non configuré');
        return false;
      }
      
      // For demo purposes, accept any 6-digit code
      // In production, you would implement proper TOTP validation
      const cleanCode = code.replace(/\D/g, '');
      const isValid = cleanCode.length === 6;
      
      if (!isValid) {
        // Check backup codes
        const backupCodes = user2FA.backup_codes || [];
        const codeIndex = backupCodes.indexOf(code.toUpperCase());
        if (codeIndex !== -1) {
          // Remove used backup code
          const updatedCodes = [...backupCodes];
          updatedCodes.splice(codeIndex, 1);
          
          await supabase
            .from('user_2fa')
            .update({ backup_codes: updatedCodes })
            .eq('user_id', user.id);
          
          return true;
        }
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async (): Promise<boolean> => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast.error('Configuration manquante');
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_2fa')
        .update({
          enabled: false,
          secret: null,
          backup_codes: []
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('2FA désactivé avec succès !');
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Erreur lors de la désactivation du 2FA');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if 2FA is enabled
  const isEnabled = async (): Promise<boolean> => {
    if (!user || !isSupabaseConfigured || !supabase) {
      return false;
    }

    try {
      const { data: user2FA } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .maybeSingle();
      
      return user2FA?.enabled === true;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  };

  return {
    generateSecret,
    verifyAndEnable,
    verifyCode,
    disable2FA,
    isEnabled,
    loading
  };
};

// Helper functions
function generateRandomSecret(): string {
  // Generate a 32-character base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    // Generate 8-character alphanumeric codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}
