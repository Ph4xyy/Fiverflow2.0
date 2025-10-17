import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStripeSubscription } from './useStripeSubscription';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useUserData } from '../contexts/UserDataContext';

export type UserPlan = 'free' | 'pro' | 'excellence';

interface PlanRestrictions {
  plan: UserPlan;
  canAccessCalendar: boolean;
  canAccessReferrals: boolean;
  canAccessStats: boolean;
  canAccessTasks: boolean;
  canAccessInvoices: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number | null;
  isAdmin: boolean;
}

type FeatureKey = 'calendar' | 'referrals' | 'stats' | 'tasks' | 'invoices';

interface UsePlanRestrictionsReturn {
  restrictions: PlanRestrictions | null;
  loading: boolean;
  error: string | null;
  checkAccess: (feature: FeatureKey) => boolean;
}

export const usePlanRestrictions = (): UsePlanRestrictionsReturn => {
  const { user, loading: authLoading } = useAuth();
  const userData = useUserData();
  const ctxRole = userData?.role; // Peut être 'admin', 'user' ou null

  const { subscription: stripeSubscription, loading: stripeLoading } = useStripeSubscription();

  const [restrictions, setRestrictions] = useState<PlanRestrictions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(ctxRole);
  const [roleLoading, setRoleLoading] = useState<boolean>(Boolean(userData?.loading));
  const lastCalculatedUserIdRef = useRef<string | null>(null);

  // Fallback role fetch if context is missing or empty
  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      // GUARD: NE PAS FETCHER tant que auth est en cours de chargement
      if (authLoading) {
        setRoleLoading(true);
        return;
      }

      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      // Si le rôle est fourni par le context, l'utiliser (y compris null)
      if (ctxRole !== undefined) {
        setRole(ctxRole);
        setRoleLoading(false);
        if (ctxRole) {
          sessionStorage.setItem('role', String(ctxRole));
        }
        return;
      }

      // PRIORITÉ 1: Vérifier app_metadata (le plus fiable pour isAdmin)
      const appMetaRole = user.app_metadata?.role;
      if (appMetaRole) {
        setRole(String(appMetaRole));
        setRoleLoading(false);
        sessionStorage.setItem('role', String(appMetaRole));
        return;
      }

      // PRIORITÉ 2: Vérifier user_metadata
      const userMetaRole = user.user_metadata?.role;
      if (userMetaRole) {
        setRole(String(userMetaRole));
        setRoleLoading(false);
        sessionStorage.setItem('role', String(userMetaRole));
        return;
      }

      // PRIORITÉ 3: Check cache
      const cached = sessionStorage.getItem('role');
      if (cached) {
        setRole(String(cached));
        setRoleLoading(false);
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        setRole(null); // Pas de Supabase = rôle inconnu
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          // Gérer les erreurs 401/403 sans dégrader le rôle
          if (error.code === 'PGRST301' || error.message.includes('JWT')) {
            setRole(null); // Laisser null pour skeleton
          } else {
            setError(error.message);
            setRole(null);
          }
        } else {
          setRole(data?.role ?? null);
          if (data?.role) sessionStorage.setItem('role', String(data.role));
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        // Gérer les erreurs 401/403 dans le catch
        if (err?.code === 'PGRST301' || err?.message?.includes('JWT')) {
          setRole(null);
        } else {
          setRole(null);
        }
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, ctxRole, authLoading]);

  // Écouter les refreshs de session
  useEffect(() => {
    const handleSessionRefreshed = () => {
      lastCalculatedUserIdRef.current = null; // Force recalcul
    };

    window.addEventListener('ff:session:refreshed', handleSessionRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', handleSessionRefreshed as any);
  }, []);

  // Calculer les restrictions avec useMemo pour éviter les recalculs inutiles
  const calculatedRestrictions = useMemo(() => {
    // GUARD: NE PAS CALCULER les restrictions tant que auth est en cours de chargement
    if (authLoading) {
      return null;
    }

    if (!user) {
      return null;
    }

    // Si le rôle est encore en chargement, ne pas calculer
    if (roleLoading || role === undefined) {
      return null;
    }

    // ADMIN OVERRIDE - Vérifier role === 'admin'
    if (role === 'admin') {
      return {
        plan: 'excellence' as UserPlan,
        canAccessCalendar: true,
        canAccessReferrals: true,
        canAccessStats: true,
        canAccessTasks: true,
        canAccessInvoices: true,
        isTrialActive: false,
        trialDaysRemaining: null,
        isAdmin: true
      };
    }

    // Si role === null, on ne peut pas calculer les restrictions
    if (role === null) {
      return null;
    }

    // Default role = user (ou tout rôle non-admin)
    let plan: UserPlan = 'free';
    let isTrialActive = false;
    let trialDaysRemaining: number | null = null;

    // Stripe subscription parsing
    let isPaidActive = false;
    if (stripeSubscription) {
      switch (stripeSubscription.price_id) {
        case 'price_1RoRLDENcVsHr4WI6TViAPNb':
        case 'price_1RoXOgENcVsHr4WIitiOEaaz':
          plan = 'pro';
          break;
        case 'price_1RoRMdENcVsHr4WIVRYCy8JL':
        case 'price_1RoXNwENcVsHr4WI3SP8AYYu':
          plan = 'excellence';
          break;
      }

      isTrialActive = stripeSubscription.subscription_status === 'trialing';
      isPaidActive = stripeSubscription.subscription_status === 'active';

      if (isTrialActive && stripeSubscription.current_period_end) {
        const end = new Date(stripeSubscription.current_period_end * 1000);
        const now = new Date();
        const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        trialDaysRemaining = Math.max(0, daysLeft);
      }
    }

    return {
      plan,
      canAccessCalendar: plan !== 'free' || isTrialActive,
      canAccessTasks: plan !== 'free' || isTrialActive,
      canAccessReferrals: isPaidActive,
      canAccessInvoices: plan === 'excellence',
      canAccessStats: plan === 'excellence',
      isTrialActive,
      trialDaysRemaining,
      isAdmin: false
    };
  }, [user?.id, role, roleLoading, stripeSubscription, authLoading]);

  // Mettre à jour les restrictions seulement quand le calcul change
  useEffect(() => {
    setRestrictions(calculatedRestrictions);
  }, [calculatedRestrictions]);

  const checkAccess = (feature: FeatureKey) => {
    if (!restrictions) {
      return false; // Tant que le rôle n'est pas connu, bloquer l'accès
    }
    if (restrictions.isAdmin) return true;

    switch (feature) {
      case 'calendar':
        return restrictions.canAccessCalendar;
      case 'referrals':
        return restrictions.canAccessReferrals;
      case 'stats':
        return restrictions.canAccessStats;
      case 'tasks':
        return restrictions.canAccessTasks;
      case 'invoices':
        return restrictions.canAccessInvoices;
      default:
        return false;
    }
  };

  return {
    restrictions,
    loading: stripeLoading || roleLoading || authLoading || role === null,
    error,
    checkAccess
  };
};
