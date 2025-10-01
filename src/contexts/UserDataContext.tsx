// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface UserDataContextType {
  role: 'admin' | 'user';
  loading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user || !isSupabaseConfigured) {
      setRole('user');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user role:', error);
        setRole('user');
      } else {
        setRole(data?.role === 'admin' ? 'admin' : 'user');
      }
    } catch (err) {
      console.error('💥 Unexpected error while fetching role:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUserRole();
    
    // Debounced refresh to avoid multiple rapid calls
    let refreshTimeout: number | undefined;
    const onRefreshed = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      // Délai plus long pour éviter les rechargements trop fréquents
      refreshTimeout = window.setTimeout(() => {
        // Ne recharger que si l'utilisateur a vraiment changé
        if (user?.id) {
          // Vérifier le cache avant de recharger
          const cachedRole = sessionStorage.getItem('role');
          if (!cachedRole) {
            fetchUserRole();
          } else {
            // Utiliser le cache et ne pas afficher de loading
            setRole(cachedRole === 'admin' ? 'admin' : 'user');
            setLoading(false);
          }
        }
      }, 2000); // Délai encore plus long
    };
    
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      window.removeEventListener('ff:session:refreshed', onRefreshed as any);
    };
  }, [user?.id]); // relancer si l'id change + sur resync

  return (
    <UserDataContext.Provider value={{ role, loading, refreshUserRole: fetchUserRole }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within a UserDataProvider');
  return context;
};
