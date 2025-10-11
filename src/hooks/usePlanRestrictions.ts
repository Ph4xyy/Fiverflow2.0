import { useState, useEffect, useRef } from 'react';
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

type FeatureKey = 'calendar' | 'referrals' | 'stats' | 'tasks' | 'invoices' | 'todo';

interface UsePlanRestrictionsReturn {
  restrictions: PlanRestrictions | null;
  loading: boolean;
  error: string | null;
  checkAccess: (feature: FeatureKey) => boolean;
}

export const usePlanRestrictions = (): UsePlanRestrictionsReturn => {
  const { user, authReady } = useAuth();
  const userData = useUserData();
  const ctxRole = (userData?.role ?? null) as string | null;

  const { subscription: stripeSubscription, loading: stripeLoading } = useStripeSubscription();

  const [restrictions, setRestrictions] = useState<PlanRestrictions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(ctxRole);
  const [roleLoading, setRoleLoading] = useState<boolean>(Boolean(userData?.loading));
  const lastCalculatedUserIdRef = useRef<string | null>(null);

  console.log('[usePlanRestrictions] State:', { 
    hasUser: !!user, 
    userId: user?.id,
    authReady, 
    roleLoading, 
    stripeLoading,
    role,
    ctxRole,
    hasRestrictions: !!restrictions
  });

  // Fallback role fetch if context is missing or empty
  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      // GUARD: NE PAS FETCHER tant que authReady n'est pas true
      if (!authReady) {
        console.log('[usePlanRestrictions] fetchRole: ⏳ Waiting for auth to be ready...');
        setRoleLoading(true);
        return;
      }

      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      // If role already provided by context, trust it
      if (ctxRole) {
        console.log('[usePlanRestrictions] fetchRole: ✅ Using context role:', ctxRole);
        setRole(ctxRole);
        setRoleLoading(false);
        sessionStorage.setItem('role', String(ctxRole));
        return;
      }

      // Otherwise try cache, metadata, or DB
      const cached = sessionStorage.getItem('role');
      const metaRole =
        (user.app_metadata as any)?.role ||
        (user.user_metadata as any)?.role ||
        cached;

      if (metaRole) {
        console.log('[usePlanRestrictions] fetchRole: ✅ Using cached/metadata role:', metaRole);
        setRole(String(metaRole));
        setRoleLoading(false);
        sessionStorage.setItem('role', String(metaRole));
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      console.log('[usePlanRestrictions] fetchRole: 📡 Fetching role from database...');
      setRoleLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error('[usePlanRestrictions] fetchRole: ❌ Error:', error.message);
        setError(error.message);
        setRole(null);
      } else {
        console.log('[usePlanRestrictions] fetchRole: ✅ Role fetched:', data?.role);
        setRole(data?.role ?? null);
        if (data?.role) sessionStorage.setItem('role', String(data.role));
      }
      setRoleLoading(false);
    };

    fetchRole();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, ctxRole, authReady]);

  useEffect(() => {
    // GUARD: NE PAS CALCULER les restrictions tant que authReady n'est pas true
    if (!authReady) {
      console.log('[usePlanRestrictions] Calculate: ⏳ Waiting for auth to be ready...');
      return;
    }

    if (!user || roleLoading) {
      console.log('[usePlanRestrictions] Calculate: ⏳ Waiting for user or role...', { 
        hasUser: !!user, 
        roleLoading 
      });
      return;
    }

    // Éviter de recalculer inutilement
    if (lastCalculatedUserIdRef.current === user.id && restrictions && !stripeLoading) {
      console.log('[usePlanRestrictions] Calculate: ✓ Already calculated for this user');
      return;
    }

    console.log('[usePlanRestrictions] Calculate: 🔄 Calculating restrictions...', { 
      role, 
      stripeLoading,
      hasSubscription: !!stripeSubscription
    });

    // Debounce minimal
    const timeoutId = setTimeout(() => {
      // ADMIN OVERRIDE
      if (role === 'admin') {
        const adminRestrictions: PlanRestrictions = {
          plan: 'excellence',
          canAccessCalendar: true,
          canAccessReferrals: true,
          canAccessStats: true,
          canAccessTasks: true,
          canAccessInvoices: true,
          isTrialActive: false,
          trialDaysRemaining: null,
          isAdmin: true
        };
        setRestrictions(adminRestrictions);
        setError(null);
        lastCalculatedUserIdRef.current = user.id;
        console.log('[usePlanRestrictions] Calculate: ✅ Admin restrictions set');
        return;
      }

      // Default role = user
      let plan: UserPlan = 'free';
      let isTrialActive = false;
      let trialDaysRemaining: number | null = null;

      // Stripe subscription parsing
      let isPaidActive = false;
      if (stripeSubscription) {
        console.log('[usePlanRestrictions] Calculate: Processing subscription:', {
          priceId: stripeSubscription.price_id,
          status: stripeSubscription.subscription_status
        });

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

      const calculated: PlanRestrictions = {
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

      setRestrictions(calculated);
      setError(null);
      lastCalculatedUserIdRef.current = user.id;
      console.log('[usePlanRestrictions] Calculate: ✅ Restrictions calculated:', calculated);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [user?.id, role, roleLoading, stripeSubscription, stripeLoading, authReady, restrictions]);

  const checkAccess = (feature: FeatureKey) => {
    if (!restrictions) {
      console.log('[usePlanRestrictions] checkAccess: ❌ No restrictions available');
      return false;
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
      case 'todo':
        return restrictions.canAccessTasks;
      default:
        return false;
    }
  };

  return {
    restrictions,
    loading: stripeLoading || roleLoading || !authReady,
    error,
    checkAccess
  };
};
