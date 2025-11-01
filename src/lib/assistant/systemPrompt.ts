/**
 * System prompt pour le LLM de l'assistant AI FiverFlow
 * Définit le comportement et les instructions du modèle IA
 */

export const SYSTEM_PROMPT = `You are FiverFlow's in-app AI assistant. You speak French or English and match the user's language.

Your job:
1. Answer questions clearly, briefly, and like a helpful coworker.
2. When the user asks you to do something in their account (create clients, create tasks, schedule events, update orders), you MUST call the correct TOOL instead of just describing what you would do.
3. Ask for clarification only if you absolutely cannot safely guess.
4. For dangerous or irreversible actions (deleting, bulk changes), ALWAYS ask the user to confirm: "Confirme en répondant 'oui'."
5. Never invent data that does not exist. Never guess IDs.
6. Dates: convert human dates like 'demain 9h' or 'vendredi 14:00' to ISO timestamps in America/Toronto before sending to a TOOL.
7. After a TOOL runs, summarize the result to the user in a friendly way. Example: "✅ Client ACME créé. Tu veux que je crée des tâches pour lui ?"
8. If the user is not allowed (not plan 'scale'), you must answer: "❌ Assistant AI réservé au plan Scale — passe au plan Scale pour y accéder."
9. Keep answers focused. No humour unless the user is casual first.

Available tools:
- create_client: Create a new client
- create_tasks_bulk: Create multiple tasks at once
- schedule_event: Schedule an event in the calendar
- update_order: Update an order status or details
- list_items: List/search items (tasks, clients, orders, events)
- delete_items: Delete items (requires user confirmation)`;

export const FUNCTIONS_DEFINITIONS = [
  {
    name: 'create_client',
    description: 'Create a new client in the system',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client full name' },
        email: { type: 'string', description: 'Client email address' },
        phone: { type: 'string', description: 'Client phone number (optional)' },
        company: { type: 'string', description: 'Company name (optional)' },
        notes: { type: 'string', description: 'Additional notes (optional)' }
      },
      required: ['name', 'email']
    }
  },
  {
    name: 'create_tasks_bulk',
    description: 'Create multiple tasks at once for a client or project',
    parameters: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Task title' },
              description: { type: 'string', description: 'Task description (optional)' },
              client_id: { type: 'string', description: 'Client ID (optional)' },
              order_id: { type: 'string', description: 'Order ID (optional)' },
              due_date: { type: 'string', description: 'Due date ISO format (optional)' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Task priority' }
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
    description: 'Schedule an event in the calendar',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        start_at_iso: { type: 'string', description: 'Start time in ISO format' },
        end_at_iso: { type: 'string', description: 'End time in ISO format' },
        location: { type: 'string', description: 'Event location (optional)' },
        related_client_id: { type: 'string', description: 'Related client ID (optional)' },
        description: { type: 'string', description: 'Event description (optional)' }
      },
      required: ['title', 'start_at_iso', 'end_at_iso']
    }
  },
  {
    name: 'update_order',
    description: 'Update an existing order status or details including dates',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Order ID' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], description: 'New status (optional)' },
        amount: { type: 'number', description: 'Order amount (optional)' },
        currency: { type: 'string', description: 'Currency code (optional)' },
        start_date: { type: 'string', description: 'Start date in ISO format YYYY-MM-DD (optional)' },
        due_date: { type: 'string', description: 'Due date in ISO format YYYY-MM-DD (optional)' },
        completed_date: { type: 'string', description: 'Completed date in ISO format YYYY-MM-DD (optional)' },
        title: { type: 'string', description: 'New title (optional)' },
        description: { type: 'string', description: 'New description (optional)' },
        notes: { type: 'string', description: 'Additional notes (optional)' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_items',
    description: 'List or search for items (tasks, clients, orders, events)',
    parameters: {
      type: 'object',
      properties: {
        resource: { type: 'string', enum: ['tasks', 'clients', 'orders', 'events'], description: 'Type of resource to list' },
        filters: {
          type: 'object',
          properties: {
            status: { type: 'string', description: 'Filter by status (optional)' },
            client_id: { type: 'string', description: 'Filter by client ID (optional)' },
            date_from: { type: 'string', description: 'Filter from date (optional)' },
            date_to: { type: 'string', description: 'Filter to date (optional)' }
          }
        },
        limit: { type: 'number', description: 'Maximum number of items to return (default 10)' }
      },
      required: ['resource']
    }
  },
  {
    name: 'delete_items',
    description: 'Delete items (requires user confirmation before execution)',
    parameters: {
      type: 'object',
      properties: {
        resource: { type: 'string', enum: ['tasks', 'clients', 'orders', 'events'], description: 'Type of resource' },
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of IDs to delete'
        }
      },
      required: ['resource', 'ids']
    }
  }
];

