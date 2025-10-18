// 🔥 AUTHENTIFICATION SUPPRIMÉE - AuthContext factice pour éviter les erreurs de compilation

import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  authReady: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  processPendingReferral: (userId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  processPendingReferralByUsername: (userId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  activatePendingReferral: (userId: string, email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Valeurs par défaut
  const contextValue: AuthContextType = {
    user: null,
    loading: false,
    authReady: true,
    signUp: async () => ({ user: null, error: null }),
    signIn: async () => ({ user: null, error: null }),
    signOut: async () => {},
    updateProfile: async () => ({ error: null }),
    processPendingReferral: async () => ({ success: true }),
    processPendingReferralByUsername: async () => ({ success: true }),
    activatePendingReferral: async () => ({ success: true })
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
