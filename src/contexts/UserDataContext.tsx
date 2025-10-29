// 🔥 AUTHENTIFICATION SUPPRIMÉE - UserDataContext simplifié

import React, { createContext, useContext } from 'react';

interface UserDataContextType {
  role: 'admin' | 'user' | null;
  loading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

/**
 * 🔥 AUTHENTIFICATION SUPPRIMÉE - UserDataProvider simplifié
 * Plus d'authentification, rôle par défaut
 */
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Valeurs par défaut
  const contextValue: UserDataContextType = {
    role: 'user', // Rôle par défaut
    loading: false, // Plus de loading
           refreshUserRole: async () => {
             // refreshUserRole disabled - auth system removed
           }
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};