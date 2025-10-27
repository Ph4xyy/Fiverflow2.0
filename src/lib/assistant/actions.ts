/**
 * Moteur d'actions CRUD pour l'Assistant AI
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { ParsedIntent, Task, Client, Order, Event } from '../../types/assistant';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateClientSchema,
  UpdateClientSchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  CreateEventSchema,
  UpdateEventSchema,
  ListFiltersSchema,
} from './schemas';
import {
  assertPermission,
  enforcePlanLimits,
  requireConfirm,
  generateConfirmationMessage,
  logAssistantAction,
  incrementActionUsage,
  assertAssistantEntitlement,
} from './guards';

/**
 * Exécute une action de l'assistant
 */
export async function assistantExecute(
  user: User,
  intent: ParsedIntent
): Promise<{
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
}> {
  try {
    // Vérifier l'accès au plan Scale (ou admin)
    await assertAssistantEntitlement(user);
    
    // Vérifier les limites de plan
    const planCheck = await enforcePlanLimits(user);
    if (!planCheck.canProceed) {
      return {
        success: false,
        message: planCheck.message || 'Limite de plan atteinte',
      };
    }

    // Vérifier les permissions
    const hasPermission = await assertPermission(user, intent.op, intent.resource);
    if (!hasPermission) {
      return {
        success: false,
        message: '❌ Action non autorisée',
      };
    }

    // Vérifier si une confirmation est requise
    if (requireConfirm(intent)) {
      return {
        success: false,
        message: generateConfirmationMessage(intent),
        requiresConfirmation: true,
      };
    }

    // Exécuter l'action selon la ressource
    let result;
    switch (intent.resource) {
      case 'task':
        result = await executeTaskAction(user, intent);
        break;
      case 'client':
        result = await executeClientAction(user, intent);
        break;
      case 'order':
        result = await executeOrderAction(user, intent);
        break;
      case 'event':
        result = await executeEventAction(user, intent);
        break;
      default:
        return {
          success: false,
          message: '❌ Ressource non reconnue',
        };
    }

    // Logger l'action
    await logAssistantAction(
      user.id,
      JSON.stringify(intent),
      intent.resource,
      intent.params,
      result
    );

    // Incrémenter l'usage
    await incrementActionUsage(user.id, intent.op, intent.resource);

    return result;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error);
    return {
      success: false,
      message: '❌ Erreur interne lors de l\'exécution de l\'action',
    };
  }
}

/**
 * Exécute une action sur les tâches
 */
async function executeTaskAction(
  user: User,
  intent: ParsedIntent
): Promise<{ success: boolean; message: string; data?: any }> {
  const { op, params } = intent;

  switch (op) {
    case 'create':
      return await createTask(user, params);
    case 'read':
      return await readTask(user, params);
    case 'list':
      return await listTasks(user, params);
    case 'update':
      return await updateTask(user, params);
    case 'delete':
      return await deleteTask(user, params);
    default:
      return {
        success: false,
        message: '❌ Opération non supportée pour les tâches',
      };
  }
}

/**
 * Exécute une action sur les clients
 */
async function executeClientAction(
  user: User,
  intent: ParsedIntent
): Promise<{ success: boolean; message: string; data?: any }> {
  const { op, params } = intent;

  switch (op) {
    case 'create':
      return await createClient(user, params);
    case 'read':
      return await readClient(user, params);
    case 'list':
      return await listClients(user, params);
    case 'update':
      return await updateClient(user, params);
    case 'delete':
      return await deleteClient(user, params);
    default:
      return {
        success: false,
        message: '❌ Opération non supportée pour les clients',
      };
  }
}

/**
 * Exécute une action sur les commandes
 */
async function executeOrderAction(
  user: User,
  intent: ParsedIntent
): Promise<{ success: boolean; message: string; data?: any }> {
  const { op, params } = intent;

  switch (op) {
    case 'create':
      return await createOrder(user, params);
    case 'read':
      return await readOrder(user, params);
    case 'list':
      return await listOrders(user, params);
    case 'update':
      return await updateOrder(user, params);
    case 'delete':
      return await deleteOrder(user, params);
    default:
      return {
        success: false,
        message: '❌ Opération non supportée pour les commandes',
      };
  }
}

/**
 * Exécute une action sur les événements
 */
async function executeEventAction(
  user: User,
  intent: ParsedIntent
): Promise<{ success: boolean; message: string; data?: any }> {
  const { op, params } = intent;

  switch (op) {
    case 'create':
      return await createEvent(user, params);
    case 'read':
      return await readEvent(user, params);
    case 'list':
      return await listEvents(user, params);
    case 'update':
      return await updateEvent(user, params);
    case 'delete':
      return await deleteEvent(user, params);
    default:
      return {
        success: false,
        message: '❌ Opération non supportée pour les événements',
      };
  }
}

// === TASKS ===

async function createTask(user: User, params: any) {
  try {
    const validatedData = CreateTaskSchema.parse(params);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Tâche créée : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la création de la tâche',
    };
  }
}

async function readTask(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `📋 Tâche : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Tâche non trouvée',
    };
  }
}

async function listTasks(user: User, params: any) {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);

    // Appliquer les filtres
    if (params.status) query = query.eq('status', params.status);
    if (params.priority) query = query.eq('priority', params.priority);
    if (params.client_id) query = query.eq('client_id', params.client_id);
    if (params.search) query = query.ilike('title', `%${params.search}%`);

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return {
      success: true,
      message: `📋 ${data.length} tâche(s) trouvée(s)`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la récupération des tâches',
    };
  }
}

async function updateTask(user: User, params: any) {
  try {
    const validatedData = UpdateTaskSchema.parse(params);
    
    const { data, error } = await supabase
      .from('tasks')
      .update(validatedData)
      .eq('id', validatedData.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Tâche mise à jour : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la mise à jour de la tâche',
    };
  }
}

async function deleteTask(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Tâche supprimée : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la suppression de la tâche',
    };
  }
}

// === CLIENTS ===

async function createClient(user: User, params: any) {
  try {
    const validatedData = CreateClientSchema.parse(params);
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Client créé : "${data.name}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la création du client',
    };
  }
}

async function readClient(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `👤 Client : "${data.name}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Client non trouvé',
    };
  }
}

async function listClients(user: User, params: any) {
  try {
    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);

    if (params.search) query = query.ilike('name', `%${params.search}%`);

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return {
      success: true,
      message: `👤 ${data.length} client(s) trouvé(s)`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la récupération des clients',
    };
  }
}

async function updateClient(user: User, params: any) {
  try {
    const validatedData = UpdateClientSchema.parse(params);
    
    const { data, error } = await supabase
      .from('clients')
      .update(validatedData)
      .eq('id', validatedData.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Client mis à jour : "${data.name}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la mise à jour du client',
    };
  }
}

async function deleteClient(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Client supprimé : "${data.name}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la suppression du client',
    };
  }
}

// === ORDERS ===

async function createOrder(user: User, params: any) {
  try {
    const validatedData = CreateOrderSchema.parse(params);
    
    // Mapping pour correspondre aux colonnes de la DB
    const orderData = {
      title: validatedData.title,
      client_id: validatedData.client_id,
      status: validatedData.status,
      budget: validatedData.budget || validatedData.amount, // Utiliser amount comme fallback
      currency: validatedData.currency || 'USD',
      due_date: validatedData.due_date || validatedData.deadline,
      user_id: user.id,
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Commande créée : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la création de la commande',
    };
  }
}

async function readOrder(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `📦 Commande : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Commande non trouvée',
    };
  }
}

async function listOrders(user: User, params: any) {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id);

    if (params.status) query = query.eq('status', params.status);
    if (params.client_id) query = query.eq('client_id', params.client_id);
    if (params.search) query = query.ilike('title', `%${params.search}%`);

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return {
      success: true,
      message: `📦 ${data.length} commande(s) trouvée(s)`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la récupération des commandes',
    };
  }
}

async function updateOrder(user: User, params: any) {
  try {
    const validatedData = UpdateOrderSchema.parse(params);
    
    // Mapping pour correspondre aux colonnes de la DB
    const { id, ...restData } = validatedData;
    const orderData: any = {
      ...restData,
    };
    
    // Map budget/amount et due_date/deadline
    if (validatedData.budget !== undefined) orderData.budget = validatedData.budget;
    else if (validatedData.amount !== undefined) orderData.budget = validatedData.amount;
    
    if (validatedData.due_date !== undefined) orderData.due_date = validatedData.due_date;
    else if (validatedData.deadline !== undefined) orderData.due_date = validatedData.deadline;
    
    // Nettoyer les undefined
    Object.keys(orderData).forEach(key => {
      if (orderData[key] === undefined) delete orderData[key];
    });
    
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Commande mise à jour : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la mise à jour de la commande',
    };
  }
}

async function deleteOrder(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Commande supprimée : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la suppression de la commande',
    };
  }
}

// === EVENTS ===

async function createEvent(user: User, params: any) {
  try {
    const validatedData = CreateEventSchema.parse(params);
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Événement créé : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la création de l\'événement',
    };
  }
}

async function readEvent(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `📅 Événement : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Événement non trouvé',
    };
  }
}

async function listEvents(user: User, params: any) {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('owner_id', user.id);

    if (params.search) query = query.ilike('title', `%${params.search}%`);

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return {
      success: true,
      message: `📅 ${data.length} événement(s) trouvé(s)`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la récupération des événements',
    };
  }
}

async function updateEvent(user: User, params: any) {
  try {
    const validatedData = UpdateEventSchema.parse(params);
    
    const { data, error } = await supabase
      .from('events')
      .update(validatedData)
      .eq('id', validatedData.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Événement mis à jour : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la mise à jour de l\'événement',
    };
  }
}

async function deleteEvent(user: User, params: any) {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Événement supprimé : "${data.title}"`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Erreur lors de la suppression de l\'événement',
    };
  }
}
