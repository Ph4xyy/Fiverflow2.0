import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserPermissions {
  role: string;
  plan: string;
  can_access_admin: boolean;
  can_create_invoices: boolean;
  can_create_templates: boolean;
  can_export_data: boolean;
  can_manage_clients: boolean;
  can_manage_tasks: boolean;
  max_invoices_per_month: number;
  max_clients: number;
}

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading user permissions for:', user.id);

        // Utiliser la nouvelle fonction de permissions
        const { data, error: permError } = await supabase
          .rpc('get_user_permissions', {
            target_user_id: user.id
          });

        if (permError) {
          console.warn('Permissions function not available, using fallback:', permError);
          
          // Fallback: utiliser les données de base
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, current_plan, is_pro')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          const fallbackPermissions: UserPermissions = {
            role: userData.role || 'user',
            plan: userData.current_plan || (userData.is_pro ? 'pro' : 'free'),
            can_access_admin: userData.role === 'admin',
            can_create_invoices: userData.is_pro || userData.current_plan === 'pro',
            can_create_templates: true,
            can_export_data: userData.is_pro || userData.current_plan === 'pro',
            can_manage_clients: true,
            can_manage_tasks: true,
            max_invoices_per_month: userData.is_pro || userData.current_plan === 'pro' ? 100 : 3,
            max_clients: userData.is_pro || userData.current_plan === 'pro' ? 100 : 5
          };

          setPermissions(fallbackPermissions);
          return;
        }

        if (data) {
          console.log('📊 User permissions loaded:', data);
          setPermissions(data);
        }

      } catch (err: any) {
        console.error('❌ Error loading user permissions:', err);
        setError(err.message || 'Erreur lors du chargement des permissions');
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  const hasPlan = (requiredPlan: string): boolean => {
    if (!permissions) return false;
    
    const planHierarchy = ['free', 'trial', 'pro', 'excellence'];
    const userPlanIndex = planHierarchy.indexOf(permissions.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    
    return userPlanIndex >= requiredPlanIndex;
  };

  const canAccess = (permission: keyof UserPermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission] as boolean;
  };

  const getMaxLimit = (limitType: 'invoices' | 'clients'): number => {
    if (!permissions) return 0;
    return limitType === 'invoices' ? permissions.max_invoices_per_month : permissions.max_clients;
  };

  return { 
    permissions, 
    loading, 
    error, 
    hasPlan, 
    canAccess, 
    getMaxLimit 
  };
};
