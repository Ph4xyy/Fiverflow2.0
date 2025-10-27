/**
 * Edge Function Supabase pour l'assistant AI
 * Appelle OpenAI de manière sécurisée depuis le serveur
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = 'gpt-4';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY non configurée' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // System prompt pour l'assistant
    const systemPrompt = "You are FiverFlow's in-app AI assistant. You speak French or English and match the user's language.";

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
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur OpenAI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Aucune réponse';

    return new Response(
      JSON.stringify({
        success: true,
        text: assistantMessage
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in assistant-message function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

