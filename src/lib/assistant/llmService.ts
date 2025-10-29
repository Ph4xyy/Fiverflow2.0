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
    // Vérifier que l'utilisateur est authentifié
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      throw new Error('Vous devez être connecté pour utiliser l\'assistant');
    }

    console.log('📡 Appel de l\'Edge Function assistant-message...');
    
    // Appeler l'Edge Function Supabase pour sécuriser l'appel OpenAI
    const { data, error } = await supabase.functions.invoke('assistant-message', {
      body: {
        message,
        conversationHistory
      }
    });

    console.log('📥 Réponse Edge Function:', { data, error });

    if (error) {
      console.error('❌ Supabase function error:', {
        message: error.message,
        context: error.context,
        status: error.status,
        name: error.name
      });
      
      // Messages d'erreur plus spécifiques selon le type d'erreur
      if (error.message?.includes('Function not found') || error.message?.includes('404') || error.status === 404) {
        throw new Error('La fonction assistant-message n\'existe pas ou n\'est pas déployée. Allez dans Supabase Dashboard → Edge Functions → Créez une fonction nommée "assistant-message"');
      } else if (error.message?.includes('Permission denied') || error.message?.includes('401') || error.message?.includes('403') || error.status === 401 || error.status === 403) {
        throw new Error('Erreur d\'authentification. Vérifiez que vous êtes bien connecté et réessayez.');
      } else if (error.message?.includes('Failed to send') || error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Impossible de contacter l\'Edge Function. Vérifiez que la fonction "assistant-message" est bien déployée dans Supabase Dashboard → Edge Functions.');
      } else {
        throw new Error(error.message || `Erreur Edge Function (${error.status || 'unknown'})`);
      }
    }

    if (!data) {
      throw new Error('Aucune réponse de l\'Edge Function');
    }

    // Gérer les erreurs retournées par la fonction elle-même
    if (data.error) {
      const errorMsg = data.error;
      if (errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('Rate limit')) {
        throw new Error('Limite de requêtes atteinte. Veuillez attendre 1-2 minutes avant de réessayer.');
      } else if (errorMsg.includes('401') || errorMsg.includes('invalid') || errorMsg.includes('OPENAI_API_KEY')) {
        throw new Error('Clé OpenAI invalide ou manquante. Configurez OPENAI_API_KEY dans Supabase Dashboard → Edge Functions → assistant-message → Secrets');
      } else if (errorMsg.includes('quota') || errorMsg.includes('insufficient')) {
        throw new Error('Crédits OpenAI insuffisants. Vérifiez votre compte sur platform.openai.com');
      } else {
        throw new Error(errorMsg);
      }
    }

    if (!data.text) {
      throw new Error('Réponse invalide de l\'Edge Function');
    }

    // Retourner la réponse textuelle
    return {
      text: data.text
    };

  } catch (error: any) {
    console.error('Error calling LLM via Edge Function:', error);
    
    // Messages d'erreur plus spécifiques
    let errorText = `❌ Erreur : ${error.message || 'Erreur inconnue'}`;
    
    if (error.message?.includes('Function not found') || error.message?.includes('n\'existe pas') || error.message?.includes('n\'est pas déployée')) {
      errorText = '❌ Erreur: La fonction assistant-message n\'est pas déployée. Créez-la dans Supabase Dashboard → Edge Functions → Create Function → Nom: "assistant-message"';
    } else if (error.message?.includes('connecté') || error.message?.includes('authentification')) {
      errorText = '❌ Erreur: Vous devez être connecté pour utiliser l\'assistant';
    } else if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('Rate limit') || error.message?.includes('Limite de requêtes')) {
      errorText = '❌ Erreur: Limite de requêtes atteinte. Veuillez attendre 1-2 minutes avant de réessayer.';
    } else if (error.message?.includes('401') || error.message?.includes('invalid') || error.message?.includes('OPENAI_API_KEY')) {
      errorText = '❌ Erreur: Clé OpenAI invalide ou manquante. Configurez OPENAI_API_KEY dans Supabase Dashboard → Edge Functions → assistant-message → Secrets';
    } else if (error.message?.includes('quota') || error.message?.includes('insufficient')) {
      errorText = '❌ Erreur: Crédits OpenAI insuffisants. Vérifiez votre compte sur platform.openai.com';
    }
    
    return {
      text: errorText,
      error: 'llm_error'
    };
  }
}
