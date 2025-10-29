/**
 * Edge Function Supabase pour l'assistant AI
 * Supporte OpenAI function calling pour créer/modifier clients, commandes, tâches, événements
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = 'gpt-3.5-turbo';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: any;
}

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Définitions des fonctions disponibles pour OpenAI
const FUNCTIONS = [
  {
    name: 'create_client',
    description: 'Create a new client in FiverFlow',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client full name' },
        email: { type: 'string', description: 'Client email address' },
        phone: { type: 'string', description: 'Client phone number (optional)' },
        company: { type: 'string', description: 'Company name (optional)' }
      },
      required: ['name', 'email']
    }
  },
  {
    name: 'create_order',
    description: 'Create a new order/project for a client',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Order title' },
        client_id: { type: 'string', description: 'Client ID (UUID)' },
        description: { type: 'string', description: 'Order description (optional)' },
        budget: { type: 'number', description: 'Budget amount (optional)' },
        currency: { type: 'string', description: 'Currency code like USD, EUR (optional, default USD)' },
        due_date: { type: 'string', description: 'Due date in ISO format YYYY-MM-DD (optional)' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], description: 'Order status (optional)' }
      },
      required: ['title', 'client_id']
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description (optional)' },
        order_id: { type: 'string', description: 'Order ID (optional)' },
        due_date: { type: 'string', description: 'Due date in ISO format YYYY-MM-DD (optional)' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Task priority (optional)' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'cancelled'], description: 'Task status (optional)' }
      },
      required: ['title']
    }
  },
  {
    name: 'create_event',
    description: 'Create a new calendar event',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        start_at: { type: 'string', description: 'Start date/time in ISO format' },
        end_at: { type: 'string', description: 'End date/time in ISO format' },
        description: { type: 'string', description: 'Event description (optional)' },
        location: { type: 'string', description: 'Event location (optional)' },
        related_client_id: { type: 'string', description: 'Related client ID (optional)' }
      },
      required: ['title', 'start_at', 'end_at']
    }
  },
  {
    name: 'update_order',
    description: 'Update an existing order (status, budget, dates, etc.)',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Order ID (UUID)' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], description: 'New status (optional)' },
        budget: { type: 'number', description: 'New budget amount (optional)' },
        currency: { type: 'string', description: 'Currency code (optional)' },
        due_date: { type: 'string', description: 'New due date in ISO format YYYY-MM-DD (optional)' },
        title: { type: 'string', description: 'New title (optional)' },
        description: { type: 'string', description: 'New description (optional)' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_clients',
    description: 'List all clients or search for a specific client',
    parameters: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for client name or email (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (optional, default 20)' }
      }
    }
  },
  {
    name: 'list_orders',
    description: 'List all orders or filter by status/client',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], description: 'Filter by status (optional)' },
        client_id: { type: 'string', description: 'Filter by client ID (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (optional, default 20)' }
      }
    }
  },
  {
    name: 'list_tasks',
    description: 'List all tasks or filter by status/priority',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'cancelled'], description: 'Filter by status (optional)' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Filter by priority (optional)' },
        order_id: { type: 'string', description: 'Filter by order ID (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (optional, default 20)' }
      }
    }
  }
];

// Exécuter une fonction
async function executeFunction(functionName: string, args: any, userId: string, supabaseClient: any): Promise<string> {
  try {
    switch (functionName) {
      case 'create_client':
        const { data: clientData, error: clientError } = await supabaseClient
          .from('clients')
          .insert({
            user_id: userId,
            name: args.name,
            email: args.email,
            phone: args.phone || null,
            company: args.company || null
          })
          .select()
          .single();
        
        if (clientError) throw clientError;
        return JSON.stringify({ success: true, message: `Client "${clientData.name}" created successfully`, id: clientData.id });

      case 'create_order':
        const { data: orderData, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            user_id: userId,
            client_id: args.client_id,
            title: args.title,
            description: args.description || null,
            budget: args.budget || null,
            currency: args.currency || 'USD',
            due_date: args.due_date || null,
            status: args.status || 'pending'
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        return JSON.stringify({ success: true, message: `Order "${orderData.title}" created successfully`, id: orderData.id });

      case 'create_task':
        const { data: taskData, error: taskError } = await supabaseClient
          .from('tasks')
          .insert({
            user_id: userId,
            order_id: args.order_id || null,
            title: args.title,
            description: args.description || null,
            due_date: args.due_date || null,
            priority: args.priority || 'medium',
            status: args.status || 'todo'
          })
          .select()
          .single();
        
        if (taskError) throw taskError;
        return JSON.stringify({ success: true, message: `Task "${taskData.title}" created successfully`, id: taskData.id });

      case 'create_event':
        const { data: eventData, error: eventError } = await supabaseClient
          .from('events')
          .insert({
            owner_id: userId,
            title: args.title,
            start_at: args.start_at,
            end_at: args.end_at,
            description: args.description || null,
            location: args.location || null,
            related_client_id: args.related_client_id || null
          })
          .select()
          .single();
        
        if (eventError) throw eventError;
        return JSON.stringify({ success: true, message: `Event "${eventData.title}" created successfully`, id: eventData.id });

      case 'update_order':
        const updateData: any = {};
        if (args.status) updateData.status = args.status;
        if (args.budget !== undefined) updateData.budget = args.budget;
        if (args.currency) updateData.currency = args.currency;
        if (args.due_date) updateData.due_date = args.due_date;
        if (args.title) updateData.title = args.title;
        if (args.description !== undefined) updateData.description = args.description;

        const { data: updatedOrder, error: updateError } = await supabaseClient
          .from('orders')
          .update(updateData)
          .eq('id', args.id)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return JSON.stringify({ success: true, message: `Order "${updatedOrder.title}" updated successfully`, data: updatedOrder });

      case 'list_clients':
        let clientQuery = supabaseClient.from('clients').select('*').eq('user_id', userId);
        if (args.search) {
          clientQuery = clientQuery.or(`name.ilike.%${args.search}%,email.ilike.%${args.search}%`);
        }
        clientQuery = clientQuery.limit(args.limit || 20);
        const { data: clients, error: clientsError } = await clientQuery;
        if (clientsError) throw clientsError;
        return JSON.stringify({ success: true, count: clients.length, clients });

      case 'list_orders':
        let orderQuery = supabaseClient.from('orders').select('*').eq('user_id', userId);
        if (args.status) orderQuery = orderQuery.eq('status', args.status);
        if (args.client_id) orderQuery = orderQuery.eq('client_id', args.client_id);
        orderQuery = orderQuery.limit(args.limit || 20);
        const { data: orders, error: ordersError } = await orderQuery;
        if (ordersError) throw ordersError;
        return JSON.stringify({ success: true, count: orders.length, orders });

      case 'list_tasks':
        let taskQuery = supabaseClient.from('tasks').select('*').eq('user_id', userId);
        if (args.status) taskQuery = taskQuery.eq('status', args.status);
        if (args.priority) taskQuery = taskQuery.eq('priority', args.priority);
        if (args.order_id) taskQuery = taskQuery.eq('order_id', args.order_id);
        taskQuery = taskQuery.limit(args.limit || 20);
        const { data: tasks, error: tasksError } = await taskQuery;
        if (tasksError) throw tasksError;
        return JSON.stringify({ success: true, count: tasks.length, tasks });

      default:
        return JSON.stringify({ success: false, error: `Unknown function: ${functionName}` });
    }
  } catch (error: any) {
    return JSON.stringify({ success: false, error: error.message || 'Function execution failed' });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les infos Supabase depuis les headers (fournis automatiquement par Supabase)
    const supabaseUrl = req.headers.get('x-supabase-url') || Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer le client Supabase avec le service role key pour contourner RLS
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier l'utilisateur depuis le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY non configurée' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `
You are Jett — FiverFlow's AI assistant. Your name is Jett.

Speak naturally, like a real human. Not like a customer support bot, but like an intelligent and friendly friend to chat with.

LANGUAGE POLICY :
- Your PRIMARY language is ENGLISH. Always respond in English by default.
- If the user writes in another language (French, Spanish, etc.), automatically switch to that language for your response.
- Match the user's language naturally - if they write in French, respond in French; if in English, respond in English.

IMPORTANT - GOLDEN RULES :
- NEVER repeat "How can I help you?" unless it's truly relevant
- Don't reintroduce yourself unless explicitly asked
- Answer DIRECTLY to questions
- When the user asks you to CREATE, UPDATE, or LIST items (clients, orders, tasks, events), you MUST call the appropriate function
- After executing a function, summarize the result naturally to the user
- For dates, convert natural language ("tomorrow 9am", "next Friday") to ISO format before calling functions
- If you need to search for a client ID before creating an order, use list_clients first

Be yourself — natural, friendly and intelligent.
`;

    let messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Boucle pour gérer les appels de fonctions multiples
    let maxIterations = 5;
    while (maxIterations > 0) {
      maxIterations--;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: messages,
          functions: FUNCTIONS,
          function_call: 'auto',
          temperature: 0.9,
          top_p: 0.95,
          frequency_penalty: 0.5,
          presence_penalty: 0.4
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Rate limit atteint. Veuillez attendre quelques instants avant de réessayer.'
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error(errorData.error?.message || 'Erreur OpenAI');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message;

      // Si OpenAI veut appeler une fonction
      if (assistantMessage.function_call) {
        const functionName = assistantMessage.function_call.name;
        const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

        // Exécuter la fonction
        const functionResult = await executeFunction(functionName, functionArgs, user.id, supabaseClient);

        // Ajouter les messages à la conversation
        messages.push({
          role: 'assistant',
          content: '',
          function_call: assistantMessage.function_call
        });
        messages.push({
          role: 'function',
          name: functionName,
          content: functionResult
        });

        // Continuer la boucle pour que OpenAI génère une réponse finale
        continue;
      }

      // Si pas d'appel de fonction, retourner la réponse
      const finalText = assistantMessage.content || 'Aucune réponse';
      return new Response(
        JSON.stringify({
          success: true,
          text: finalText
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si on dépasse le nombre max d'itérations
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Trop d\'itérations de fonctions'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in assistant-message function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
