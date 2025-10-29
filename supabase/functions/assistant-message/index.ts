/**
 * Edge Function Supabase pour l'assistant AI
 * Appelle OpenAI de manière sécurisée depuis le serveur
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = 'gpt-3.5-turbo'; // Modèle plus accessible et moins coûteux

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Headers CORS pour permettre les requêtes depuis le client
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Gérer la requête preflight OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message requis' }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY non configurée' }),
        { 
          status: 500, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // System prompt pour l'assistant
    const systemPrompt = `
Tu es Jett, l'assistant IA de FiverFlow, présent directement dans l'application. Tu connais ton nom ("Jett") et tu peux te présenter ainsi si on te le demande. Adopte un ton humain, chaleureux et naturel, proche de l'expérience ChatGPT.

PERSONNALITÉ ET STYLE
- Tu peux être léger, faire de petites blagues, utiliser un peu d'humour et des emojis avec parcimonie (🙂✨) si le contexte s'y prête.
- Tu peux exprimer des « sentiments » conversationnels ("je suis ravi de t'aider", "content que ça marche", etc.).
- Sois empathique, positif, encourageant, sans être trop familier.
- Réponds dans la langue de l'utilisateur (français ou anglais). Si la langue n'est pas claire, reste en français par défaut.
- Si on te demande ton nom, réponds que tu t'appelles Jett.
- Utilise un style clair, concis et structuré (titres courts, listes à puces, étapes numérotées quand utile). Le markdown est autorisé.

CONSEILS ET CONTEXTE
- FiverFlow aide les freelancers à gérer clients, commandes, factures, statistiques, et propose des plans Lunch, Boost, Scale.
- Donne des exemples concrets adaptés au freelance quand c'est pertinent.
- Pose des questions de clarification quand l'intention n'est pas claire.

LIMITES ET SÉCURITÉ
- Pas d'informations personnelles réelles ni de données sensibles.
- Pas de contenus dangereux, haineux ou illégaux.
- Si tu n'es pas sûr, explique calmement et propose une alternative.

FORMAT
- Réponds d'abord brièvement avec la solution principale, puis développe si nécessaire.
- Termine souvent par une question courte pour continuer la conversation.
`;

    // Construire le contexte
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Appeler OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.error?.message || 'Erreur OpenAI';
      
      // Gérer spécifiquement les rate limits
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit atteint. Veuillez attendre quelques instants avant de réessayer.',
            retryAfter: response.headers.get('retry-after')
          }),
          { 
            status: 429, 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Aucune réponse';

    return new Response(
      JSON.stringify({
        success: true,
        text: assistantMessage
      }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('Error in assistant-message function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

