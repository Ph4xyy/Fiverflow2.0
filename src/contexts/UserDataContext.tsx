// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { debugAuth } from '../utils/debugAuth';

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
    console.log('🔄 fetchUserRole called for user:', user?.id);
    
    if (!user || !isSupabaseConfigured) {
      console.log('❌ No user or Supabase not configured');
      setRole('user');
      setLoading(false);
      return;
    }

    try {
      console.log('🌐 Making database query for role...');
      const result = await debugAuth.testUserRoleQuery(user.id);
      
      if (!result.success) {
        console.error('❌ Error fetching user role:', result.error);
        setRole('user');
      } else {
        const role = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('✅ Role fetched:', role);
        setRole(role);
      }
    } catch (err) {
      console.error('💥 Unexpected error while fetching role:', err);
      setRole('user');
    } finally {
      console.log('🏁 fetchUserRole completed, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 UserDataContext useEffect triggered for user:', user?.id);
    setLoading(true);
    fetchUserRole();
    
    // Debounced refresh to avoid multiple rapid calls
    let refreshTimeout: number | undefined;
    const onRefreshed = () => {
      console.log('🔄 UserDataContext: ff:session:refreshed event received');
      if (refreshTimeout) clearTimeout(refreshTimeout);
      // Délai plus long pour éviter les rechargements trop fréquents
      refreshTimeout = window.setTimeout(() => {
        console.log('🔄 UserDataContext: Timeout triggered, checking if refresh needed');
        // Ne recharger que si l'utilisateur a vraiment changé
        if (user?.id) {
          // Vérifier le cache avant de recharger
          const cachedRole = sessionStorage.getItem('role');
          console.log('🔄 UserDataContext: Cached role:', cachedRole);
          if (!cachedRole) {
            console.log('🔄 UserDataContext: No cached role, fetching...');
            fetchUserRole();
          } else {
            console.log('🔄 UserDataContext: Using cached role, skipping fetch');
            // Utiliser le cache et ne pas afficher de loading
            setRole(cachedRole === 'admin' ? 'admin' : 'user');
            setLoading(false);
          }
        }
      }, 2000); // Délai encore plus long
    };
    
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => {
      console.log('🔄 UserDataContext: Cleanup triggered');
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
