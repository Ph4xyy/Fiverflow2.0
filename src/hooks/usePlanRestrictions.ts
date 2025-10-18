// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook simplifié sans auth

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
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Restrictions par défaut pour tous les utilisateurs
  const defaultRestrictions: PlanRestrictions = {
    plan: 'free',
    canAccessCalendar: true, // Toutes les fonctionnalités accessibles
    canAccessReferrals: true,
    canAccessStats: true,
    canAccessTasks: true,
    canAccessInvoices: true,
    isTrialActive: false,
    trialDaysRemaining: null,
    isAdmin: false
  };

  // Fonction pour vérifier l'accès à une fonctionnalité
  const checkAccess = (feature: FeatureKey): boolean => {
    // 🔥 AUTHENTIFICATION SUPPRIMÉE - Accès à tout
    return true;
  };

  return {
    restrictions: defaultRestrictions,
    loading: false, // Plus de loading
    error: null,
    checkAccess
  };
};