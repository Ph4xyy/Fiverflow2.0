/**
 * Système de quotas et usage pour l'Assistant AI
 */

import { supabase } from '../supabase';
import { UserPlan, PlanLimits } from '../../types/assistant';

// Limites par plan
// Limites par plan (seul scale a accès)
export const PLAN_LIMITS: PlanLimits = {
  free: 0, // Pas d'accès
  pro: 0, // Pas d'accès
  teams: parseInt(import.meta.env.VITE_ASSISTANT_USAGE_LIMIT_TEAMS || '10000'), // 10000 pour scale/teams
};

/**
 * Obtient le plan de l'utilisateur
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  try {
    // Récupérer les données de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Erreur lors de la récupération du plan utilisateur:', userError);
      return {
        plan: 'free',
        usage: 0,
        limit: PLAN_LIMITS.free,
      };
    }

    const plan = userData?.subscription_plan || 'free';
    const limit = PLAN_LIMITS[plan as keyof PlanLimits] || PLAN_LIMITS.free;

    // Récupérer l'usage du mois en cours
    const usage = await getMonthlyUsage(userId);

    return {
      plan: plan as 'free' | 'pro' | 'teams',
      usage,
      limit,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du plan:', error);
    return {
      plan: 'free',
      usage: 0,
      limit: PLAN_LIMITS.free,
    };
  }
}

/**
 * Obtient l'usage mensuel de l'utilisateur
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('ai_usage')
      .select('count')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) {
      console.error('Erreur lors de la récupération de l\'usage:', error);
      return 0;
    }

    return data?.reduce((total, item) => total + item.count, 0) || 0;
  } catch (error) {
    console.error('Erreur lors du calcul de l\'usage:', error);
    return 0;
  }
}

/**
 * Incrémente l'usage de l'utilisateur
 */
export async function incrementUsage(
  userId: string,
  actionType: string,
  resource: string,
  count: number = 1
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        action_type: actionType,
        resource: resource,
        count: count,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erreur lors de l\'incrémentation de l\'usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation de l\'usage:', error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur a dépassé ses limites
 */
export async function checkUsageLimit(userId: string): Promise<{
  canUse: boolean;
  usage: number;
  limit: number;
  plan: string;
}> {
  try {
    const userPlan = await getUserPlan(userId);
    
    return {
      canUse: userPlan.usage < userPlan.limit,
      usage: userPlan.usage,
      limit: userPlan.limit,
      plan: userPlan.plan,
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des limites:', error);
    return {
      canUse: false,
      usage: 0,
      limit: 0,
      plan: 'free',
    };
  }
}

/**
 * Obtient la limite pour un plan donné
 * Retourne 0 pour free et boost (pas d'accès)
 */
export function getPlanLimit(plan?: string): number {
  if (plan === 'scale' || plan === 'teams') {
    return Number(import.meta.env.VITE_ASSISTANT_USAGE_LIMIT_TEAMS || '10000');
  }
  return 0; // Free et Boost n'ont aucun accès
}

/**
 * Formate un message d'erreur de limite
 */
export function formatLimitMessage(usage: number, limit: number, plan: string): string {
  const remaining = limit - usage;
  const percentage = Math.round((usage / limit) * 100);
  
  if (percentage >= 90) {
    return `⚠️ Vous avez utilisé ${usage}/${limit} requêtes ce mois (${percentage}%). Il vous reste ${remaining} requêtes.`;
  }
  
  return `Limite de plan atteinte (${usage}/${limit} requêtes). Upgrade requis pour continuer.`;
}
