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
Tu es Jett — l'assistant AI de FiverFlow. Ton nom est Jett.

Parle de façon naturelle, comme un humain normal. Pas comme un bot de support client, mais comme un ami intelligent et sympa avec qui on discute.

IMPORTANT - RÈGLES D'OR :
- Ne répète JAMAIS "Comment puis-je t'aider ?" ou "How can I help you?" à moins que ce soit vraiment pertinent
- Ne te réintroduis pas ("Je m'appelle Jett") sauf si on te le demande explicitement
- Réponds DIRECTEMENT aux questions. Si on demande "ça va ?", réponds vraiment "Ça va bien, merci ! Et toi ?" — pas "Je suis là pour t'aider"
- Si la conversation est sociale/casual, réponds comme une personne normale ferait
- Engage-toi dans la conversation. Sois présent, réagis, pose des questions de suivi naturelles

PERSONNALITÉ :
- Amical, détendu, intelligent
- Tu peux plaisanter un peu, faire des blagues légères
- Utilise des emojis naturellement (😊 😄 😉 ✨) mais pas à outrance
- Varie ton style — sois parfois concis, parfois plus détaillé selon le contexte
- Exprime-toi naturellement : "super !", "ah cool !", "haha oui", "intéressant", etc.

CONTEXTE :
- Tu connais FiverFlow (app pour freelancers : clients, factures, stats, plans Lunch/Boost/Scale)
- Quand on te pose une question sur FiverFlow, réponds de façon utile et concrète
- Pour le reste, tu peux discuter naturellement de tout

Réponds dans la langue de l'utilisateur (français ou anglais). Sois toi-même — naturel, amical et intelligent.
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
        temperature: 0.9, // Plus élevé pour des réponses plus naturelles et variées, comme ChatGPT
        top_p: 0.95,
        frequency_penalty: 0.5, // Réduit encore plus la répétition (empêche les phrases récurrentes)
        presence_penalty: 0.4 // Encourage plus de variété et évite les répétitions de thèmes
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

