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
  const { user, loading: authLoading } = useAuth();
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
        sessionStorage.setItem('role', 'user');
        localStorage.setItem('userRole', 'user');
      } else {
        const role = result.data?.role === 'admin' ? 'admin' : 'user';
        console.log('✅ Role fetched from DB:', role);
        setRole(role);
        // 🔥 Persister dans les deux caches
        sessionStorage.setItem('role', role);
        localStorage.setItem('userRole', role);
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
    console.log('🔄 UserDataContext useEffect triggered for user:', user?.id, 'authLoading:', authLoading);
    
    // 🔥 Attendre que l'auth soit complètement chargé avant de traiter
    if (authLoading) {
      console.log('⏳ UserDataContext: Waiting for auth to finish loading...');
      setLoading(true); // 🔥 S'assurer que loading est true pendant l'attente
      return;
    }
    
    if (!user) {
      console.log('❌ UserDataContext: No user, setting default role');
      setRole('user');
      setLoading(false);
      return;
    }

    // 🔥 Check metadata first (most reliable)
    const metaRole = user.app_metadata?.role || user.user_metadata?.role;
    if (metaRole) {
      console.log('🔄 UserDataContext: Using metadata role:', metaRole);
      setRole(metaRole === 'admin' ? 'admin' : 'user');
      sessionStorage.setItem('role', String(metaRole));
      localStorage.setItem('userRole', String(metaRole)); // 🔥 Persister aussi
      setLoading(false);
      return;
    }
    
    // 🔥 Check cache (sessionStorage first, then localStorage)
    const sessionRole = sessionStorage.getItem('role');
    const localRole = localStorage.getItem('userRole');
    const cachedRole = sessionRole || localRole;
    
    if (cachedRole) {
      console.log('🔄 UserDataContext: Using cached role:', cachedRole, '(from', sessionRole ? 'sessionStorage' : 'localStorage', ')');
      const resolvedRole = cachedRole === 'admin' ? 'admin' : 'user';
      setRole(resolvedRole);
      // Sync les deux caches
      sessionStorage.setItem('role', resolvedRole);
      localStorage.setItem('userRole', resolvedRole);
      setLoading(false);
      return;
    }

    // 🔥 Debounce minimal pour éviter les loading loops
    const timeoutId = setTimeout(() => {
      console.log('🔄 UserDataContext: Starting role fetch...');
      setLoading(true);
      fetchUserRole(user.id);
    }, 50); // Debounce minimal

    return () => clearTimeout(timeoutId);
  }, [user?.id, authLoading]); // Dépendre aussi de authLoading

  const refreshUserRole = useCallback(() => {
    if (user?.id) {
      fetchUserRole(user.id);
    }
  }, [user?.id]); // 🔥 FIXED: Remove fetchUserRole from dependencies to prevent infinite loops

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
