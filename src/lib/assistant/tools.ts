/**
 * Tools (actions) disponibles pour le LLM
 * Définit les actions que le modèle IA peut appeler et leurs implémentations
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { assertAssistantEntitlement } from './guards';
import { incrementUsage } from './usage';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  message: string;
  requiresConfirmation?: boolean;
}

/**
 * Crée un nouveau client
 */
export async function tool_create_client(user: User, args: any): Promise<ToolResult> {
  try {
    await assertAssistantEntitlement(user);

    const { name, email, phone, company, notes } = args;

    if (!name || !email) {
      return {
        success: false,
        message: '❌ Nom et email requis pour créer un client'
      };
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name,
        email,
        phone: phone || null,
        company: company || null,
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAssistantAction(user.id, 'create_client', 'clients', args, data);

    // Increment usage
    await incrementUsage(user.id);

    return {
      success: true,
      data,
      message: `✅ Client créé : ${name} (${email})`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erreur lors de la création du client : ${error.message}`
    };
  }
}

/**
 * Crée plusieurs tâches en une seule fois
 */
export async function tool_create_tasks_bulk(user: User, args: any): Promise<ToolResult> {
  try {
    await assertAssistantEntitlement(user);

    const { tasks } = args;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return {
        success: false,
        message: '❌ Aucune tâche fournie'
      };
    }

    const tasksData = tasks.map((task: any) => ({
      user_id: user.id,
      title: task.title,
      description: task.description || null,
      client_id: task.client_id || null,
      order_id: task.order_id || null,
      due_date: task.due_date || null,
      priority: task.priority || 'medium',
      status: 'todo',
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksData)
      .select();

    if (error) throw error;

    // Log the action
    await logAssistantAction(user.id, 'create_tasks_bulk', 'tasks', args, data);

    // Increment usage
    await incrementUsage(user.id);

    return {
      success: true,
      data,
      message: `✅ ${data.length} tâche(s) créée(s)`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erreur lors de la création des tâches : ${error.message}`
    };
  }
}

/**
 * Planifie un événement dans le calendrier
 */
export async function tool_schedule_event(user: User, args: any): Promise<ToolResult> {
  try {
    await assertAssistantEntitlement(user);

    const { title, start_at_iso, end_at_iso, location, related_client_id, description } = args;

    if (!title || !start_at_iso || !end_at_iso) {
      return {
        success: false,
        message: '❌ Titre, date de début et date de fin requis'
      };
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        title,
        start_at: start_at_iso,
        end_at: end_at_iso,
        location: location || null,
        related_client_id: related_client_id || null,
        description: description || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAssistantAction(user.id, 'schedule_event', 'events', args, data);

    // Increment usage
    await incrementUsage(user.id);

    const startDate = new Date(start_at_iso).toLocaleString('fr-FR', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });

    return {
      success: true,
      data,
      message: `✅ Événement planifié : ${title} le ${startDate}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erreur lors de la planification : ${error.message}`
    };
  }
}

/**
 * Met à jour une commande
 */
export async function tool_update_order(user: User, args: any): Promise<ToolResult> {
  try {
    await assertAssistantEntitlement(user);

    const { id, status, amount, currency, notes } = args;

    if (!id) {
      return {
        success: false,
        message: '❌ ID de commande requis'
      };
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (amount) updates.budget = amount;
    if (currency) updates.currency = currency;
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAssistantAction(user.id, 'update_order', 'orders', args, data);

    // Increment usage
    await incrementUsage(user.id);

    return {
      success: true,
      data,
      message: `✅ Commande #${id} mise à jour`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erreur lors de la mise à jour : ${error.message}`
    };
  }
}

/**
 * Liste des éléments (recherche)
 */
export async function tool_list_items(user: User, args: any): Promise<ToolResult> {
  try {
    await assertAssistantEntitlement(user);

    const { resource, filters = {}, limit = 10 } = args;

    if (!resource) {
      return {
        success: false,
        message: '❌ Type de ressource requis'
      };
    }

    let query = supabase.from(resource).select('*').eq('user_id', user.id);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query.limit(limit).order('created_at', { ascending: false });

    if (error) throw error;

    // Log the action
    await logAssistantAction(user.id, 'list_items', resource, args, { count: data.length });

    // Increment usage
    await incrementUsage(user.id);

    return {
      success: true,
      data: { items: data, count: data.length },
      message: `📋 ${data.length} élément(s) trouvé(s)`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erreur lors de la recherche : ${error.message}`
    };
  }
}

/**
 * Supprime des éléments (nécessite confirmation)
 */
export async function tool_delete_items(user: User, args: any, confirmed: boolean = false): Promise<ToolResult> {
  try {
    await assertAssistantEntitlement(user);

    const { resource, ids } = args;

    if (!resource || !ids || !Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        message: '❌ Ressource et IDs requis'
      };
    }

    // Si pas encore confirmé, on demande confirmation
    if (!confirmed) {
      return {
        success: false,
        message: `⚠️ Supprimer ${ids.length} élément(s) de type "${resource}" ? Réponds "oui" pour confirmer.`,
        requiresConfirmation: true,
        data: { resource, ids }
      };
    }

    // Suppression confirmée
    const { error } = await supabase
      .from(resource)
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) throw error;

    // Log the action
    await logAssistantAction(user.id, 'delete_items', resource, args, { deleted_count: ids.length });

    // Increment usage
    await incrementUsage(user.id);

    return {
      success: true,
      data: { deleted_ids: ids },
      message: `🗑️ ${ids.length} élément(s) supprimé(s)`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erreur lors de la suppression : ${error.message}`
    };
  }
}

/**
 * Map des outils disponibles
 */
export const TOOLS = {
  create_client: tool_create_client,
  create_tasks_bulk: tool_create_tasks_bulk,
  schedule_event: tool_schedule_event,
  update_order: tool_update_order,
  list_items: tool_list_items,
  delete_items: tool_delete_items
};

/**
 * Log une action dans assistant_actions
 */
async function logAssistantAction(
  userId: string,
  intent: string,
  resource: string,
  payload: any,
  result: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('assistant_actions')
      .insert({
        user_id: userId,
        intent,
        resource,
        payload_json: payload,
        result_json: result,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging assistant action:', error);
    }
  } catch (error) {
    console.error('Error logging assistant action:', error);
  }
}

