// 🔥 AUTHENTIFICATION SUPPRIMÉE - CurrencyContext simplifié

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>('USD');
  
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Plus de chargement de préférences
  const setCurrency = async (newCurrency: string) => {
    console.log('💰 CurrencyContext: setCurrency disabled - auth system removed');
    setCurrencyState(newCurrency); // Mise à jour locale seulement
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    isLoading: false // Plus de loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};