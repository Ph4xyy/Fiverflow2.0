/**
 * Service pour appeler le LLM OpenAI
 */

import { User } from '@supabase/supabase-js';
import { SYSTEM_PROMPT } from './systemPrompt';
import { TOOLS, ToolResult } from './tools';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4';

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
 * Appelle le LLM avec le contexte et retourne la réponse
 */
export async function callLLM(
  user: User,
  message: string,
  conversationHistory: LLMMessage[] = []
): Promise<LLMResponse> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Construire le contexte complet
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
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
        temperature: 0.7,
        functions: getFunctionsDefinition(),
        function_call: 'auto'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'LLM API error');
    }

    const data = await response.json();
    const choice = data.choices[0];

    // Si le LLM veut appeler un outil
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name;
      const functionArgs = JSON.parse(choice.message.function_call.arguments);

      // Exécuter l'outil
      const tool = TOOLS[functionName as keyof typeof TOOLS];
      if (!tool) {
        return {
          text: `❌ Outil inconnu : ${functionName}`,
          error: 'unknown_tool'
        };
      }

      const result: ToolResult = await tool(user, functionArgs);

      // Si confirmation requise
      if (result.requiresConfirmation) {
        return {
          text: result.message,
          requiresConfirmation: true,
          confirmationData: result.data
        };
      }

      // Sinon on retourne le résultat
      return {
        text: result.message,
        error: result.success ? undefined : 'tool_error'
      };
    }

    // Réponse textuelle normale
    return {
      text: choice.message.content
    };
  } catch (error: any) {
    console.error('Error calling LLM:', error);
    return {
      text: `❌ Erreur : ${error.message}`,
      error: 'llm_error'
    };
  }
}

/**
 * Retourne la définition des fonctions pour OpenAI
 */
function getFunctionsDefinition() {
  return [
    {
      name: 'create_client',
      description: 'Create a new client',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          company: { type: 'string' },
          notes: { type: 'string' }
        },
        required: ['name', 'email']
      }
    },
    {
      name: 'create_tasks_bulk',
      description: 'Create multiple tasks',
      parameters: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                client_id: { type: 'string' },
                due_date: { type: 'string' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'] }
              },
              required: ['title']
            }
          }
        },
        required: ['tasks']
      }
    },
    {
      name: 'schedule_event',
      description: 'Schedule an event',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          start_at_iso: { type: 'string' },
          end_at_iso: { type: 'string' },
          location: { type: 'string' },
          related_client_id: { type: 'string' }
        },
        required: ['title', 'start_at_iso', 'end_at_iso']
      }
    },
    {
      name: 'update_order',
      description: 'Update an order',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
          amount: { type: 'number' }
        },
        required: ['id']
      }
    },
    {
      name: 'list_items',
      description: 'List items',
      parameters: {
        type: 'object',
        properties: {
          resource: { type: 'string', enum: ['tasks', 'clients', 'orders', 'events'] },
          filters: { type: 'object' },
          limit: { type: 'number' }
        },
        required: ['resource']
      }
    },
    {
      name: 'delete_items',
      description: 'Delete items (requires confirmation)',
      parameters: {
        type: 'object',
        properties: {
          resource: { type: 'string', enum: ['tasks', 'clients', 'orders', 'events'] },
          ids: { type: 'array', items: { type: 'string' } }
        },
        required: ['resource', 'ids']
      }
    }
  ];
}

