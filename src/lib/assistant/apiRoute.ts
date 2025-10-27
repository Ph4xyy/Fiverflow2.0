/**
 * Route API pour l'assistant AI
 * Point d'entrée backend qui appelle le LLM
 */

import { User } from '@supabase/supabase-js';
import { callLLM } from './llmService';
import { assertAssistantEntitlement } from './guards';

export interface APIRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  pendingConfirmation?: {
    resource: string;
    ids: string[];
  };
}

export interface APIResponse {
  success: boolean;
  text: string;
  requiresConfirmation?: boolean;
  error?: string;
}

/**
 * Traite une requête de l'assistant AI
 * Cette fonction est appelée depuis le front ou depuis une route API
 */
export async function handleAssistantMessage(
  user: User,
  request: APIRequest
): Promise<APIResponse> {
  try {
    // 1. Vérifier l'accès au plan Scale
    await assertAssistantEntitlement(user);

    // 2. Convertir l'historique de conversation
    const conversationHistory = request.conversationHistory?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant' as const,
      content: msg.content
    })) || [];

    // 3. Si on a une confirmation en attente et que l'utilisateur confirme
    if (request.pendingConfirmation && request.message.toLowerCase().includes('oui')) {
      // Exécuter la suppression confirmée
      const { TOOLS } = await import('./tools');
      const result = await TOOLS.delete_items(user, {
        resource: request.pendingConfirmation.resource,
        ids: request.pendingConfirmation.ids
      }, true);

      return {
        success: result.success,
        text: result.message,
        requiresConfirmation: false
      };
    }

    // 4. Appeler le LLM
    const llmResponse = await callLLM(user, request.message, conversationHistory);

    // 5. Retourner la réponse
    return {
      success: !llmResponse.error,
      text: llmResponse.text,
      requiresConfirmation: llmResponse.requiresConfirmation,
      error: llmResponse.error
    };

  } catch (error: any) {
    // Gérer les erreurs d'entitlement
    if (error.code === 'entitlement_denied') {
      return {
        success: false,
        text: '❌ Assistant AI réservé au plan Scale — passe au plan Scale pour y accéder.',
        error: 'entitlement_denied'
      };
    }

    console.error('Error handling assistant message:', error);
    return {
      success: false,
      text: `❌ Erreur : ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Helper pour appeler cette fonction depuis un endpoint API
 * (utilisable dans des routes SSR ou Edge Functions si besoin)
 */
export async function apiRoute(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { user, message, conversationHistory, pendingConfirmation } = body;

    if (!user || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing user or message'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await handleAssistantMessage(user, {
      message,
      conversationHistory,
      pendingConfirmation
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

