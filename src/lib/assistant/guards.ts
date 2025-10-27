/**
 * Guards de sécurité pour l'Assistant AI
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { ParsedIntent } from '../../types/assistant';
import { checkUsageLimit, incrementUsage } from './usage';

/**
 * Vérifie que l'utilisateur a accès au plan Scale
 */
export function assertAssistantEntitlement(user?: User | { plan?: string }): void {
  const userPlan = user && 'plan' in user ? user.plan : 
                   user && 'user_metadata' in user ? user.user_metadata?.subscription_plan : 
                   undefined;
  
  if (!user || userPlan !== 'scale') {
    const err: any = new Error('entitlement_denied');
    err.code = 'entitlement_denied';
    err.explanation = 'Assistant AI réservé au plan Scale.';
    throw err;
  }
}

/**
 * Vérifie les permissions de l'utilisateur
 */
export async function assertPermission(
  user: User,
  op: string,
  resource: string,
  targetOwnerId?: string
): Promise<boolean> {
  // Admin a accès global
  if (await isAdmin(user)) {
    return true;
  }

  // Vérifier l'ownership pour les opérations sensibles
  if (op === 'delete' || op === 'update') {
    if (targetOwnerId && targetOwnerId !== user.id) {
      return false;
    }
  }

  return true;
}

/**
 * Vérifie si l'utilisateur est admin
 */
async function isAdmin(user: User): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Erreur lors de la vérification admin:', error);
    return false;
  }
}

/**
 * Applique les limites de plan
 */
export async function enforcePlanLimits(user: User): Promise<{
  canProceed: boolean;
  message?: string;
}> {
  const usageCheck = await checkUsageLimit(user.id);

  if (!usageCheck.canUse) {
    return {
      canProceed: false,
      message: formatLimitMessage(usageCheck.usage, usageCheck.limit, usageCheck.plan),
    };
  }

  return { canProceed: true };
}

/**
 * Formate un message de limite
 */
function formatLimitMessage(usage: number, limit: number, plan: string): string {
  const remaining = limit - usage;
  const percentage = Math.round((usage / limit) * 100);
  
  if (percentage >= 90) {
    return `⚠️ Vous avez utilisé ${usage}/${limit} requêtes ce mois (${percentage}%). Il vous reste ${remaining} requêtes.`;
  }
  
  return `❌ Limite de plan atteinte (${usage}/${limit} requêtes). Upgrade requis pour continuer.`;
}

/**
 * Vérifie si une confirmation est requise
 */
export function requireConfirm(intent: ParsedIntent): boolean {
  if (intent.confirmRequired) {
    return true;
  }

  // Confirmation requise pour les suppressions
  if (intent.op === 'delete') {
    return true;
  }

  // Confirmation requise pour les opérations en masse
  if (intent.params.count && intent.params.count > 5) {
    return true;
  }

  return false;
}

/**
 * Génère un message de confirmation
 */
export function generateConfirmationMessage(intent: ParsedIntent): string {
  const { op, resource, params } = intent;

  switch (op) {
    case 'delete':
      if (params.count && params.count > 1) {
        return `⚠️ Vous voulez vraiment supprimer ${params.count} ${resource}s ? Répondez 'oui' pour confirmer.`;
      }
      return `⚠️ Vous voulez vraiment supprimer ce ${resource} ? Répondez 'oui' pour confirmer.`;

    case 'update':
      if (params.count && params.count > 5) {
        return `⚠️ Vous voulez vraiment modifier ${params.count} ${resource}s ? Répondez 'oui' pour confirmer.`;
      }
      break;

    default:
      break;
  }

  return 'Confirmation requise. Répondez \'oui\' pour confirmer.';
}

/**
 * Vérifie si une réponse est une confirmation
 */
export function isConfirmation(input: string): boolean {
  const confirmations = ['oui', 'yes', 'ok', 'confirmer', 'confirm', 'y', 'o'];
  return confirmations.includes(input.toLowerCase().trim());
}

/**
 * Log une action de l'assistant
 */
export async function logAssistantAction(
  userId: string,
  intent: string,
  resource: string,
  payload: any,
  result: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('assistant_actions')
      .insert({
        user_id: userId,
        intent,
        resource,
        payload_json: payload,
        result_json: result,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erreur lors du log de l\'action:', error);
    }
  } catch (error) {
    console.error('Erreur lors du log de l\'action:', error);
  }
}

/**
 * Incrémente l'usage après une action
 */
export async function incrementActionUsage(
  userId: string,
  actionType: string,
  resource: string
): Promise<void> {
  try {
    await incrementUsage(userId, actionType, resource, 1);
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation de l\'usage:', error);
  }
}
