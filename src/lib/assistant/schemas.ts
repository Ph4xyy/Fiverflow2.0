/**
 * Schémas Zod pour la validation des données de l'Assistant AI
 */

import { z } from 'zod';

// Schémas de base
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']);

// Schémas pour les opérations CRUD
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères').trim(),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').trim().optional(),
  status: TaskStatusSchema.default('pending'),
  due_date: z.string().optional(),
  priority: TaskPrioritySchema.default('medium'),
  client_id: z.string().uuid().optional(),
});

export const UpdateTaskSchema = z.object({
  id: z.string().uuid('ID invalide'),
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  status: TaskStatusSchema.optional(),
  due_date: z.string().optional(),
  priority: TaskPrioritySchema.optional(),
  client_id: z.string().uuid().optional(),
});

export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').trim(),
  email: z.string().email('Email invalide').max(100).optional(),
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional(),
  company: z.string().max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères').optional(),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional(),
});

export const UpdateClientSchema = z.object({
  id: z.string().uuid('ID invalide'),
  name: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const CreateOrderSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères').trim(),
  client_id: z.string().uuid().optional(),
  status: OrderStatusSchema.default('pending'),
  amount: z.number().min(0, 'Le montant doit être positif').optional(),
  currency: z.string().length(3, 'La devise doit avoir 3 caractères').optional(),
  due_date: z.string().optional(),
});

export const UpdateOrderSchema = z.object({
  id: z.string().uuid('ID invalide'),
  title: z.string().min(1).max(200).trim().optional(),
  client_id: z.string().uuid().optional(),
  status: OrderStatusSchema.optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  due_date: z.string().optional(),
});

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères').trim(),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').trim().optional(),
  start_at: z.string().min(1, 'La date de début est requise'),
  end_at: z.string().optional(),
  location: z.string().max(200, 'Le lieu ne peut pas dépasser 200 caractères').optional(),
  related_client_id: z.string().uuid().optional(),
});

export const UpdateEventSchema = z.object({
  id: z.string().uuid('ID invalide'),
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  location: z.string().max(200).optional(),
  related_client_id: z.string().uuid().optional(),
});

// Schémas pour les filtres et recherches
export const ListFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  client_id: z.string().uuid().optional(),
  date_range: z.enum(['today', 'tomorrow', 'this_week', 'next_week', 'this_month', 'overdue']).optional(),
  search: z.string().max(100).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Schémas pour les confirmations
export const ConfirmationSchema = z.object({
  action: z.string(),
  target: z.string(),
  count: z.number().optional(),
});

// Types exportés
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type ListFilters = z.infer<typeof ListFiltersSchema>;
export type ConfirmationInput = z.infer<typeof ConfirmationSchema>;
