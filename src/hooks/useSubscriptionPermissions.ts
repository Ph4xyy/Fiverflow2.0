import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Cache global pour éviter les re-vérifications
const permissionCache = new Map<string, {
  data: any;
  timestamp: number;
  expiresIn: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface SubscriptionPlan {
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_projects: number;
  max_clients: number;
  max_storage_gb: number;
  max_team_members: number;
  features: string[];
}

export interface UserSubscription {
  plan_name: string;
  plan_display_name: string;
  status: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  end_date: string | null;
  features: string[];
}

export interface SubscriptionLimits {
  maxClients: number;
  maxOrders: number;
  maxProjects: number;
  maxStorage: number;
  maxTeamMembers: number;
}

export interface PagePermissions {
  dashboard: boolean;
  clients: boolean;
  orders: boolean;
  calendar: boolean;
  referrals: boolean;
  workboard: boolean;
  stats: boolean;
  invoices: boolean;
  admin: boolean;
}

export const useSubscriptionPermissions = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [limits, setLimits] = useState<SubscriptionLimits>({
    maxClients: 5,
    maxOrders: 10,
    maxProjects: 1,
    maxStorage: 1,
    maxTeamMembers: 1
  });
  const [permissions, setPermissions] = useState<PagePermissions>({
    dashboard: true,
    clients: true,
    orders: true,
    calendar: false,
    referrals: false,
    workboard: false,
    stats: false,
    invoices: false,
    admin: false
  });
  const [loading, setLoading] = useState(true);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (user && !isInitializedRef.current) {
      loadSubscriptionData();
    } else if (!user) {
      setLoading(false);
      isInitializedRef.current = false;
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user || isInitializedRef.current) return;

    const cacheKey = `permissions_${user.id}`;
    const now = Date.now();

    // Vérifier le cache d'abord
    const cached = permissionCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < cached.expiresIn) {
      console.log('🚀 useSubscriptionPermissions: Utilisation du cache pour', user.id);
      setSubscription(cached.data.subscription);
      setIsAdmin(cached.data.isAdmin);
      setLimits(cached.data.limits);
      setPermissions(cached.data.permissions);
      setLoading(false);
      isInitializedRef.current = true;
      return;
    }

    try {
      console.log('🔄 useSubscriptionPermissions: Chargement des permissions pour', user.id);
      
      // Vérifier le statut admin en premier (is_admin ou role)
      const { data: adminData, error: adminError } = await supabase
        .from('user_profiles')
        .select('is_admin, role')
        .eq('user_id', user.id)
        .single();

      if (!adminError && adminData) {
        // Considérer admin si is_admin est true OU role est Admin
        const isUserAdmin = adminData.is_admin === true || adminData.role === 'Admin';
        setIsAdmin(isUserAdmin);
        console.log('🔍 Statut admin vérifié:', {
          is_admin: adminData.is_admin,
          role: adminData.role,
          finalIsAdmin: isUserAdmin
        });
      }

      // Récupérer l'abonnement actuel
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_current_subscription', { user_uuid: user.id });

      if (subscriptionError) {
        console.error('Erreur lors du chargement de l\'abonnement:', subscriptionError);
        return;
      }

      let currentSubscription: UserSubscription | null = null;
      if (subscriptionData && subscriptionData.length > 0) {
        currentSubscription = subscriptionData[0];
        setSubscription(currentSubscription);
      }

      // Définir les limites selon le plan (illimitées pour les admins)
      const planName = currentSubscription?.plan_name || 'launch';
      const newLimits = getLimitsForPlan(planName);
      const isUserAdmin = adminData?.is_admin === true || adminData?.role === 'Admin';
      const finalLimits = isUserAdmin ? {
        maxClients: -1,
        maxOrders: -1,
        maxProjects: -1,
        maxStorage: -1,
        maxTeamMembers: -1
      } : newLimits;
      setLimits(finalLimits);
      
      // Définir les permissions selon le plan et le statut admin
      const newPermissions = getPermissionsForPlan(planName, isUserAdmin);
      setPermissions(newPermissions);

      // Mettre en cache
      permissionCache.set(cacheKey, {
        data: {
          subscription: currentSubscription,
          isAdmin: isUserAdmin || false,
          limits: finalLimits,
          permissions: newPermissions
        },
        timestamp: now,
        expiresIn: CACHE_DURATION
      });

      console.log('✅ useSubscriptionPermissions: Permissions mises en cache pour', user.id);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'abonnement:', error);
    } finally {
      setLoading(false);
      isInitializedRef.current = true;
    }
  };

  const getLimitsForPlan = (planName: string): SubscriptionLimits => {
    switch (planName) {
      case 'launch':
        return {
          maxClients: 5,
          maxOrders: 10,
          maxProjects: 1,
          maxStorage: 1,
          maxTeamMembers: 1
        };
      case 'boost':
        return {
          maxClients: -1, // Infini
          maxOrders: -1, // Infini
          maxProjects: 5,
          maxStorage: 10,
          maxTeamMembers: 1
        };
      case 'scale':
        return {
          maxClients: -1, // Infini
          maxOrders: -1, // Infini
          maxProjects: 15,
          maxStorage: 50,
          maxTeamMembers: 5
        };
      default:
        return {
          maxClients: 5,
          maxOrders: 10,
          maxProjects: 1,
          maxStorage: 1,
          maxTeamMembers: 1
        };
    }
  };

  const getPermissionsForPlan = (planName: string, isAdmin: boolean = false): PagePermissions => {
    // Les admins ont accès à tout, peu importe leur abonnement
    if (isAdmin) {
      return {
        dashboard: true,
        clients: true,
        orders: true,
        calendar: true,
        referrals: true,
        workboard: true,
        stats: true,
        invoices: true,
        admin: true
      };
    }

    const basePermissions = {
      dashboard: true,
      clients: true,
      orders: true,
      calendar: false,
      referrals: false,
      workboard: false,
      stats: false,
      invoices: false,
      admin: false
    };

    switch (planName) {
      case 'launch':
        return {
          ...basePermissions,
          dashboard: true,
          clients: true,
          orders: true
        };
      case 'boost':
        return {
          ...basePermissions,
          dashboard: true,
          clients: true,
          orders: true,
          calendar: true,
          referrals: true,
          workboard: true
        };
      case 'scale':
        return {
          ...basePermissions,
          dashboard: true,
          clients: true,
          orders: true,
          calendar: true,
          referrals: true,
          workboard: true,
          stats: true,
          invoices: true
        };
      default:
        return basePermissions;
    }
  };

  const hasPermission = (page: keyof PagePermissions): boolean => {
    return permissions[page];
  };

  const canAccessPage = (page: keyof PagePermissions): boolean => {
    return hasPermission(page);
  };

  const isWithinLimit = (resource: keyof SubscriptionLimits, currentCount: number): boolean => {
    const limit = limits[resource];
    return limit === -1 || currentCount < limit;
  };

  const getRemainingLimit = (resource: keyof SubscriptionLimits, currentCount: number): number => {
    const limit = limits[resource];
    if (limit === -1) return -1; // Infini
    return Math.max(0, limit - currentCount);
  };

  const refreshSubscription = () => {
    if (user) {
      // Vider le cache et recharger
      const cacheKey = `permissions_${user.id}`;
      permissionCache.delete(cacheKey);
      isInitializedRef.current = false;
      loadSubscriptionData();
    }
  };

  const clearCache = () => {
    permissionCache.clear();
    isInitializedRef.current = false;
  };

  return {
    subscription,
    isAdmin,
    limits,
    permissions,
    loading,
    hasPermission,
    canAccessPage,
    isWithinLimit,
    getRemainingLimit,
    refreshSubscription,
    clearCache
  };
};
