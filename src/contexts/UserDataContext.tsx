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
  }, [user?.id]); // relancer uniquement si l’id change

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
