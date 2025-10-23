/**
 * Tests unitaires pour le parser d'intentions
 */

import { parseIntent } from '../../lib/assistant/intent';

describe('parseIntent', () => {
  describe('Slash commands', () => {
    it('should parse help command', () => {
      const result = parseIntent('/help');
      expect(result.op).toBe('read');
      expect(result.resource).toBe('task');
      expect(result.params.help).toBe(true);
    });

    it('should parse create task command', () => {
      const result = parseIntent('/create task "Test task" for tomorrow');
      expect(result.op).toBe('create');
      expect(result.resource).toBe('task');
      expect(result.params.title).toBe('Test task');
    });

    it('should parse list clients command', () => {
      const result = parseIntent('/list clients');
      expect(result.op).toBe('list');
      expect(result.resource).toBe('client');
    });

    it('should parse delete order command', () => {
      const result = parseIntent('/delete order 123');
      expect(result.op).toBe('delete');
      expect(result.resource).toBe('order');
      expect(result.params.id).toBe('123');
    });
  });

  describe('Natural language - French', () => {
    it('should parse French create task', () => {
      const result = parseIntent('Créer une tâche "Test" pour demain 14h');
      expect(result.op).toBe('create');
      expect(result.resource).toBe('task');
      expect(result.params.title).toBe('Test');
      expect(result.params.due_date).toBeDefined();
    });

    it('should parse French list tasks', () => {
      const result = parseIntent('Montrer toutes les tâches en cours');
      expect(result.op).toBe('list');
      expect(result.resource).toBe('task');
      expect(result.params.status).toBe('in_progress');
    });

    it('should parse French add client', () => {
      const result = parseIntent('Ajouter un client "Acme Corp" avec email test@acme.com');
      expect(result.op).toBe('create');
      expect(result.resource).toBe('client');
      expect(result.params.name).toBe('Acme Corp');
      expect(result.params.email).toBe('test@acme.com');
    });

    it('should parse French delete confirmation', () => {
      const result = parseIntent('Supprimer toutes les tâches terminées');
      expect(result.op).toBe('delete');
      expect(result.resource).toBe('task');
      expect(result.confirmRequired).toBe(true);
    });
  });

  describe('Natural language - English', () => {
    it('should parse English create task', () => {
      const result = parseIntent('Create task "Test" for tomorrow at 2pm');
      expect(result.op).toBe('create');
      expect(result.resource).toBe('task');
      expect(result.params.title).toBe('Test');
      expect(result.params.due_date).toBeDefined();
    });

    it('should parse English list orders', () => {
      const result = parseIntent('Show all pending orders');
      expect(result.op).toBe('list');
      expect(result.resource).toBe('order');
      expect(result.params.status).toBe('pending');
    });

    it('should parse English add client', () => {
      const result = parseIntent('Add client "Acme Corp" with email test@acme.com');
      expect(result.op).toBe('create');
      expect(result.resource).toBe('client');
      expect(result.params.name).toBe('Acme Corp');
      expect(result.params.email).toBe('test@acme.com');
    });
  });

  describe('Date parsing', () => {
    it('should parse "demain" as tomorrow', () => {
      const result = parseIntent('Tâche pour demain');
      expect(result.params.due_date).toBeDefined();
    });

    it('should parse "tomorrow" as tomorrow', () => {
      const result = parseIntent('Task for tomorrow');
      expect(result.params.due_date).toBeDefined();
    });

    it('should parse specific time', () => {
      const result = parseIntent('Réunion à 14h30');
      expect(result.params.start_at).toBeDefined();
    });

    it('should parse date format', () => {
      const result = parseIntent('Échéance le 15/12/2024');
      expect(result.params.due_date).toBeDefined();
    });
  });

  describe('Money parsing', () => {
    it('should parse Euro amount', () => {
      const result = parseIntent('Commande pour 1500€');
      expect(result.params.amount).toBe(1500);
      expect(result.params.currency).toBe('EUR');
    });

    it('should parse Dollar amount', () => {
      const result = parseIntent('Order for $2000');
      expect(result.params.amount).toBe(2000);
      expect(result.params.currency).toBe('USD');
    });
  });

  describe('Status parsing', () => {
    it('should parse French status', () => {
      const result = parseIntent('Tâches terminées');
      expect(result.params.status).toBe('completed');
    });

    it('should parse English status', () => {
      const result = parseIntent('Pending orders');
      expect(result.params.status).toBe('pending');
    });
  });

  describe('Priority parsing', () => {
    it('should parse French priority', () => {
      const result = parseIntent('Tâche urgente');
      expect(result.params.priority).toBe('urgent');
    });

    it('should parse English priority', () => {
      const result = parseIntent('High priority task');
      expect(result.params.priority).toBe('high');
    });
  });

  describe('Email parsing', () => {
    it('should parse email address', () => {
      const result = parseIntent('Client avec email john@example.com');
      expect(result.params.email).toBe('john@example.com');
    });
  });

  describe('ID parsing', () => {
    it('should parse UUID', () => {
      const result = parseIntent('Tâche id: 123e4567-e89b-12d3-a456-426614174000');
      expect(result.params.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });
});
