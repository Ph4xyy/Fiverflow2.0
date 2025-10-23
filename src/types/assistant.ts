/**
 * Types pour le système d'Assistant AI
 */

export interface ParsedIntent {
  op: 'create' | 'read' | 'list' | 'update' | 'delete';
  resource: 'task' | 'order' | 'client' | 'event';
  params: Record<string, any>;
  confirmRequired?: boolean;
  scope?: 'all' | 'mine' | 'client' | 'date' | 'status';
  rawInput: string;
}

export interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: ParsedIntent;
    action?: string;
    result?: any;
    error?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  client_id?: string;
  title: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  amount?: number;
  currency?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  location?: string;
  related_client_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsage {
  id: string;
  user_id: string;
  action_type: string;
  resource: string;
  count: number;
  created_at: string;
}

export interface AssistantAction {
  id: string;
  user_id: string;
  intent: string;
  resource: string;
  payload_json: Record<string, any>;
  result_json: Record<string, any>;
  created_at: string;
}

export interface PlanLimits {
  free: number;
  pro: number;
  teams: number;
}

export interface UserPlan {
  plan: 'free' | 'pro' | 'teams';
  usage: number;
  limit: number;
}
