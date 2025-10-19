import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Types pour les permissions
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

export interface PermissionState {
  // État de chargement
  isInitialized: boolean;
  isLoading: boolean;
  
  // Données utilisateur
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  
  // Données d'abonnement
  subscription: UserSubscription | null;
  limits: SubscriptionLimits;
  permissions: PagePermissions;
  
  // Cache et performance
  lastChecked: number;
  cacheValid: boolean;
}

interface PermissionContextType extends PermissionState {
  // Actions
  refreshPermissions: () => Promise<void>;
  hasPermission: (page: keyof PagePermissions) => boolean;
  canAccessPage: (page: keyof PagePermissions) => boolean;
  isWithinLimit: (resource: keyof SubscriptionLimits, currentCount: number) => boolean;
  getRemainingLimit: (resource: keyof SubscriptionLimits, currentCount: number) => number;
  
  // Utilitaires
  isPagePublic: (path: string) => boolean;
  shouldRedirect: (path: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Configuration des pages publiques
const PUBLIC_PAGES = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/support',
  '/terms-of-service',
  '/privacy-policy',
  '/cookie-policy'
];

// Configuration des pages protégées et leurs permissions requises
const PROTECTED_PAGES: Record<string, keyof PagePermissions> = {
  '/dashboard': 'dashboard',
  '/clients': 'clients',
  '/orders': 'orders',
  '/calendar': 'calendar',
  '/network': 'referrals',
  '/tasks': 'workboard',
  '/stats': 'stats',
  '/invoices': 'invoices',
  '/admin/dashboard': 'admin'
};

// Cache local pour les permissions
const PERMISSION_CACHE_KEY = 'fiverflow_permissions_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PermissionState>({
    isInitialized: false,
    isLoading: true,
    user: null,
    session: null,
    isAdmin: false,
    subscription: null,
    limits: {
      maxClients: 5,
      maxOrders: 10,
      maxProjects: 1,
      maxStorage: 1,
      maxTeamMembers: 1
    },
    permissions: {
      dashboard: true,
      clients: true,
      orders: true,
      calendar: false,
      referrals: false,
      workboard: false,
      stats: false,
      invoices: false,
      admin: false
    },
    lastChecked: 0,
    cacheValid: false
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const isRefreshingRef = useRef(false);

  // Fonction pour charger les permissions depuis le cache
  const loadFromCache = useCallback((): boolean => {
    try {
      const cached = localStorage.getItem(PERMISSION_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        if (now - timestamp < CACHE_DURATION) {
          setState(prev => ({
            ...prev,
            ...data,
            isInitialized: true,
            isLoading: false,
            cacheValid: true
          }));
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
    }
    return false;
  }, []);

  // Fonction pour sauvegarder les permissions dans le cache
  const saveToCache = useCallback((data: Partial<PermissionState>) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(PERMISSION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }, []);

  // Fonction pour obtenir les limites selon le plan
  const getLimitsForPlan = useCallback((planName: string): SubscriptionLimits => {
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
          maxClients: -1,
          maxOrders: -1,
          maxProjects: 5,
          maxStorage: 10,
          maxTeamMembers: 1
        };
      case 'scale':
        return {
          maxClients: -1,
          maxOrders: -1,
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
  }, []);

  // Fonction pour obtenir les permissions selon le plan
  const getPermissionsForPlan = useCallback((planName: string, isAdmin: boolean = false): PagePermissions => {
    // Les admins ont accès à tout
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
  }, []);

  // Fonction principale pour charger les permissions
  const loadPermissions = useCallback(async (user: User | null) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      if (!user) {
        setState(prev => ({
          ...prev,
          user: null,
          session: null,
          isAdmin: false,
          subscription: null,
          limits: {
            maxClients: 5,
            maxOrders: 10,
            maxProjects: 1,
            maxStorage: 1,
            maxTeamMembers: 1
          },
          permissions: {
            dashboard: true,
            clients: true,
            orders: true,
            calendar: false,
            referrals: false,
            workboard: false,
            stats: false,
            invoices: false,
            admin: false
          },
          isInitialized: true,
          isLoading: false,
          lastChecked: Date.now(),
          cacheValid: true
        }));
        return;
      }

      // Vérifier le statut admin
      const { data: adminData, error: adminError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      const isAdmin = !adminError && adminData?.is_admin;

      // Récupérer l'abonnement
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_current_subscription', { user_uuid: user.id });

      let subscription: UserSubscription | null = null;
      if (!subscriptionError && subscriptionData && subscriptionData.length > 0) {
        subscription = subscriptionData[0];
      }

      // Calculer les limites et permissions
      const planName = subscription?.plan_name || 'launch';
      const limits = getLimitsForPlan(planName);
      const permissions = getPermissionsForPlan(planName, isAdmin);

      // Limites illimitées pour les admins
      const finalLimits = isAdmin ? {
        maxClients: -1,
        maxOrders: -1,
        maxProjects: -1,
        maxStorage: -1,
        maxTeamMembers: -1
      } : limits;

      const newState = {
        user,
        session: null, // Sera mis à jour par onAuthStateChange
        isAdmin,
        subscription,
        limits: finalLimits,
        permissions,
        isInitialized: true,
        isLoading: false,
        lastChecked: Date.now(),
        cacheValid: true
      };

      setState(prev => ({ ...prev, ...newState }));
      saveToCache(newState);

    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        cacheValid: false
      }));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [getLimitsForPlan, getPermissionsForPlan, saveToCache]);

  // Fonction pour actualiser les permissions
  const refreshPermissions = useCallback(async () => {
    if (state.user) {
      await loadPermissions(state.user);
    }
  }, [state.user, loadPermissions]);

  // Initialisation et gestion de la session
  useEffect(() => {
    let mounted = true;

    // Essayer de charger depuis le cache d'abord
    if (loadFromCache()) {
      // Si le cache est valide, on peut continuer
      setState(prev => ({ ...prev, isInitialized: true, isLoading: false }));
    }

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 PermissionContext: Auth state changed:', event, session?.user?.id);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await loadPermissions(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            isAdmin: false,
            subscription: null,
            limits: {
              maxClients: 5,
              maxOrders: 10,
              maxProjects: 1,
              maxStorage: 1,
              maxTeamMembers: 1
            },
            permissions: {
              dashboard: true,
              clients: true,
              orders: true,
              calendar: false,
              referrals: false,
              workboard: false,
              stats: false,
              invoices: false,
              admin: false
            },
            isInitialized: true,
            isLoading: false,
            lastChecked: Date.now(),
            cacheValid: true
          }));
          localStorage.removeItem(PERMISSION_CACHE_KEY);
        }
      }
    );

    // Actualisation périodique en arrière-plan (toutes les 10 minutes)
    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        if (state.user && !state.isLoading) {
          refreshPermissions();
          scheduleRefresh();
        }
      }, 10 * 60 * 1000); // 10 minutes
    };

    scheduleRefresh();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [loadFromCache, loadPermissions, refreshPermissions, state.user, state.isLoading]);

  // Fonctions utilitaires
  const hasPermission = useCallback((page: keyof PagePermissions): boolean => {
    return state.permissions[page];
  }, [state.permissions]);

  const canAccessPage = useCallback((page: keyof PagePermissions): boolean => {
    return hasPermission(page);
  }, [hasPermission]);

  const isWithinLimit = useCallback((resource: keyof SubscriptionLimits, currentCount: number): boolean => {
    const limit = state.limits[resource];
    return limit === -1 || currentCount < limit;
  }, [state.limits]);

  const getRemainingLimit = useCallback((resource: keyof SubscriptionLimits, currentCount: number): number => {
    const limit = state.limits[resource];
    if (limit === -1) return -1; // Infini
    return Math.max(0, limit - currentCount);
  }, [state.limits]);

  const isPagePublic = useCallback((path: string): boolean => {
    return PUBLIC_PAGES.includes(path);
  }, []);

  const shouldRedirect = useCallback((path: string): boolean => {
    if (isPagePublic(path)) return false;
    
    const requiredPermission = PROTECTED_PAGES[path];
    if (!requiredPermission) return false;
    
    return !hasPermission(requiredPermission);
  }, [isPagePublic, hasPermission]);

  const contextValue: PermissionContextType = {
    ...state,
    refreshPermissions,
    hasPermission,
    canAccessPage,
    isWithinLimit,
    getRemainingLimit,
    isPagePublic,
    shouldRedirect
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
