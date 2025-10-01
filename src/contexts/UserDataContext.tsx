// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const fetchUserRole = useCallback(async (userId: string) => {
    console.log('🔄 fetchUserRole called for user:', userId);
    
    if (!userId || !isSupabaseConfigured) {
      console.log('❌ No user or Supabase not configured');
      setRole('user');
      setLoading(false);
      return;
    }

    try {
      console.log('🌐 Making database query for role...');
      const result = await debugAuth.testUserRoleQuery(userId);
      
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
  }, []); // Pas de dépendances pour éviter les loops

  useEffect(() => {
    console.log('🔄 UserDataContext useEffect triggered for user:', user?.id);
    
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    // Check cache first to avoid unnecessary loading
    const cachedRole = sessionStorage.getItem('role');
    if (cachedRole) {
      console.log('🔄 UserDataContext: Using cached role:', cachedRole);
      setRole(cachedRole === 'admin' ? 'admin' : 'user');
      setLoading(false);
      return;
    }

    // Only fetch if no cached role
    setLoading(true);
    fetchUserRole(user.id);
  }, [user?.id]); // Seulement dépendre de user?.id

  const refreshUserRole = useCallback(() => {
    if (user?.id) {
      fetchUserRole(user.id);
    }
  }, [user?.id, fetchUserRole]);

  return (
    <UserDataContext.Provider value={{ role, loading, refreshUserRole }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within a UserDataProvider');
  return context;
};
