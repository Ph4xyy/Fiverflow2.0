// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useLoading } from './LoadingContext';

interface UserDataContextType {
  role: 'admin' | 'user';
  loading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const { setLoading, loading } = useLoading();

  const fetchUserRole = async () => {
    if (!user || !isSupabaseConfigured) {
      setRole('user');
      setLoading('role', false);
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
      setLoading('role', false);
    }
  };

  useEffect(() => {
    setLoading('role', true);
    fetchUserRole();
    
    // Debounced refresh to avoid multiple rapid calls
    let refreshTimeout: number | undefined;
    const onRefreshed = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(fetchUserRole, 100);
    };
    
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      window.removeEventListener('ff:session:refreshed', onRefreshed as any);
    };
  }, [user?.id]); // relancer si l'id change + sur resync

  return (
    <UserDataContext.Provider value={{ role, loading: loading.role, refreshUserRole: fetchUserRole }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within a UserDataProvider');
  return context;
};
