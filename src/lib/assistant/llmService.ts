/**
 * Service pour appeler le LLM OpenAI via Edge Function Supabase
 * La clé API reste secrète côté serveur
 */

import { supabase } from '../supabase';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  text: string;
  requiresConfirmation?: boolean;
  confirmationData?: any;
  error?: string;
}

/**
 * Appelle le LLM via l'Edge Function Supabase
 */
export async function callLLM(
  user: any,
  message: string,
  conversationHistory: LLMMessage[] = []
): Promise<LLMResponse> {
  try {
    // Appeler l'Edge Function Supabase pour sécuriser l'appel OpenAI
    const { data, error } = await supabase.functions.invoke('assistant-message', {
      body: {
        message,
        conversationHistory
      }
    });

    if (error) {
      throw new Error(error.message || 'Erreur Edge Function');
    }

    if (!data || !data.text) {
      throw new Error('Réponse invalide de l\'Edge Function');
    }

    // Retourner la réponse textuelle
    return {
      text: data.text
    };

  } catch (error: any) {
    console.error('Error calling LLM via Edge Function:', error);
    return {
      text: `❌ Erreur : ${error.message}`,
      error: 'llm_error'
    };
  }
}
