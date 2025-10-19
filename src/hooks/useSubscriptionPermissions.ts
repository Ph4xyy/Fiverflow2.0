import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      // Récupérer l'abonnement actuel
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_current_subscription', { user_uuid: user.id });

      if (subscriptionError) {
        console.error('Erreur lors du chargement de l\'abonnement:', subscriptionError);
        return;
      }

      if (subscriptionData && subscriptionData.length > 0) {
        const currentSubscription = subscriptionData[0];
        setSubscription(currentSubscription);
        
        // Définir les limites selon le plan
        const newLimits = getLimitsForPlan(currentSubscription.plan_name);
        setLimits(newLimits);
        
        // Définir les permissions selon le plan
        const newPermissions = getPermissionsForPlan(currentSubscription.plan_name);
        setPermissions(newPermissions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'abonnement:', error);
    } finally {
      setLoading(false);
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

  const getPermissionsForPlan = (planName: string): PagePermissions => {
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
      loadSubscriptionData();
    }
  };

  return {
    subscription,
    limits,
    permissions,
    loading,
    hasPermission,
    canAccessPage,
    isWithinLimit,
    getRemainingLimit,
    refreshSubscription
  };
};
