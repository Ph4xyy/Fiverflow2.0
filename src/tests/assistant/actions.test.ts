/**
 * Tests unitaires pour le moteur d'actions
 */

import { assistantExecute } from '../../lib/assistant/actions';
import { ParsedIntent } from '../../types/assistant';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'test-id', title: 'Test Task' },
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'test-id', title: 'Test Task' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'test-id', title: 'Updated Task' },
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'test-id', title: 'Deleted Task' },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock guards
jest.mock('../../lib/assistant/guards', () => ({
  assertPermission: jest.fn(() => Promise.resolve(true)),
  enforcePlanLimits: jest.fn(() => Promise.resolve({ canProceed: true })),
  requireConfirm: jest.fn(() => false),
  logAssistantAction: jest.fn(() => Promise.resolve()),
  incrementActionUsage: jest.fn(() => Promise.resolve())
}));

// Mock n8n webhooks
jest.mock('../../lib/assistant/n8n', () => ({
  sendTaskWebhook: jest.fn(() => Promise.resolve(true)),
  sendOrderWebhook: jest.fn(() => Promise.resolve(true)),
  sendClientWebhook: jest.fn(() => Promise.resolve(true)),
  sendEventWebhook: jest.fn(() => Promise.resolve(true))
}));

describe('assistantExecute', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  } as any;

  describe('Task actions', () => {
    it('should create a task', async () => {
      const intent: ParsedIntent = {
        op: 'create',
        resource: 'task',
        params: {
          title: 'Test Task',
          description: 'Test description',
          priority: 'medium'
        },
        rawInput: 'Create task "Test Task"'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Tâche créée');
    });

    it('should read a task', async () => {
      const intent: ParsedIntent = {
        op: 'read',
        resource: 'task',
        params: { id: 'task-123' },
        rawInput: 'Show task task-123'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Tâche :');
    });

    it('should list tasks', async () => {
      const intent: ParsedIntent = {
        op: 'list',
        resource: 'task',
        params: { status: 'pending' },
        rawInput: 'List pending tasks'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('tâche(s) trouvée(s)');
    });

    it('should update a task', async () => {
      const intent: ParsedIntent = {
        op: 'update',
        resource: 'task',
        params: {
          id: 'task-123',
          title: 'Updated Task',
          status: 'completed'
        },
        rawInput: 'Update task task-123'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('TâcheData mise à jour');
    });

    it('should delete a task', async () => {
      const intent: ParsedIntent = {
        op: 'delete',
        resource: 'task',
        params: { id: 'task-123' },
        rawInput: 'Delete task task-123'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('TâcheData supprimée');
    });
  });

  describe('Client actions', () => {
    it('should create a client', async () => {
      const intent: ParsedIntent = {
        op: 'create',
        resource: 'client',
        params: {
          name: 'Test Client',
          email: 'client@example.com'
        },
        rawInput: 'Add client "Test Client"'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Client créé');
    });

    it('should list clients', async () => {
      const intent: ParsedIntent = {
        op: 'list',
        resource: 'client',
        params: {},
        rawInput: 'List all clients'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('client(s) trouvé(s)');
    });
  });

  describe('Order actions', () => {
    it('should create an order', async () => {
      const intent: ParsedIntent = {
        op: 'create',
        resource: 'order',
        params: {
          title: 'Test Order',
          amount: 1000,
          currency: 'EUR'
        },
        rawInput: 'Create order "Test Order"'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Commande créée');
    });

    it('should list orders', async () => {
      const intent: ParsedIntent = {
        op: 'list',
        resource: 'order',
        params: { status: 'pending' },
        rawInput: 'List pending orders'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('commande(s) trouvée(s)');
    });
  });

  describe('Event actions', () => {
    it('should create an event', async () => {
      const intent: ParsedIntent = {
        op: 'create',
        resource: 'event',
        params: {
          title: 'Test Event',
          start_at: '2024-12-15T10:00:00Z'
        },
        rawInput: 'Create event "Test Event"'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Événement créé');
    });

    it('should list events', async () => {
      const intent: ParsedIntent = {
        op: 'list',
        resource: 'event',
        params: {},
        rawInput: 'List all events'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(true);
      expect(result.message).toContain('événement(s) trouvé(s)');
    });
  });

  describe('Error handling', () => {
    it('should handle permission errors', async () => {
      const { assertPermission } = require('../../lib/assistant/guards');
      assertPermission.mockResolvedValueOnce(false);

      const intent: ParsedIntent = {
        op: 'delete',
        resource: 'task',
        params: { id: 'task-123' },
        rawInput: 'Delete task task-123'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Action non autorisée');
    });

    it('should handle plan limit errors', async () => {
      const { enforcePlanLimits } = require('../../lib/assistant/guards');
      enforcePlanLimits.mockResolvedValueOnce({
        canProceed: false,
        message: 'Limite de plan atteinte'
      });

      const intent: ParsedIntent = {
        op: 'create',
        resource: 'task',
        params: { title: 'Test Task' },
        rawInput: 'Create task "Test Task"'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Limite de plan atteinte');
    });

    it('should handle confirmation requirements', async () => {
      const { requireConfirm } = require('../../lib/assistant/guards');
      requireConfirm.mockReturnValueOnce(true);

      const intent: ParsedIntent = {
        op: 'delete',
        resource: 'task',
        params: { id: 'task-123' },
        rawInput: 'Delete task task-123'
      };

      const result = await assistantExecute(mockUser, intent);

      expect(result.success).toBe(false);
      expect(result.requiresConfirmation).toBe(true);
    });
  });
});
