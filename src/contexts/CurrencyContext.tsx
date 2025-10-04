import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load user's currency preference from database
  useEffect(() => {
    const loadCurrencyPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('default_currency')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error loading currency preference:', error);
        } else if (data?.default_currency) {
          setCurrencyState(data.default_currency);
        }
      } catch (error) {
        console.error('Error loading currency preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencyPreference();
  }, [user]);

  // Update currency in database and state
  const setCurrency = async (newCurrency: string) => {
    if (!user) return;

    try {
      // Update or insert user preference
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          default_currency: newCurrency,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating currency preference:', error);
        throw error;
      }

      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Error setting currency:', error);
      throw error;
    }
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    isLoading
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
