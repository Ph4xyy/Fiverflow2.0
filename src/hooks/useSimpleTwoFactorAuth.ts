// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

import { useState } from 'react';

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
  const [loading, setLoading] = useState(false);

  return {
    generateSecret: async () => null,
    verifyAndEnable: async () => false,
    verifyCode: async () => false,
    disable2FA: async () => false,
    isEnabled: async () => false,
    loading
  };
};
