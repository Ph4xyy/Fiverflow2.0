// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

import { useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  return {
    signInWithPassword: async (credentials: LoginCredentials): Promise<AuthWith2FAResult> => ({
      success: false,
      error: 'Auth system disabled'
    }),
    verify2FAAndComplete: async (code: string): Promise<AuthWith2FAResult> => ({
      success: false,
      error: 'Auth system disabled'
    }),
    cancel2FA: () => {},
    loading,
    requires2FA,
    pendingUser
  };
};
