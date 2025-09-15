/*
  # Système de gestion des tâches et suivi du temps

  1. Nouvelles Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key vers orders)
      - `title` (text, titre de la tâche)
      - `description` (text, description détaillée)
      - `status` (enum: todo, in_progress, completed)
      - `priority` (enum: low, medium, high)
      - `estimated_hours` (numeric, heures estimées)
      - `actual_hours` (numeric, heures réelles calculées)
      - `due_date` (date, échéance)
      - `completed_at` (timestamp, date de completion)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `time_entries`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key vers tasks)
      - `order_id` (uuid, foreign key vers orders)
      - `user_id` (uuid, foreign key vers users)
      - `start_time` (timestamp, début du timer)
      - `end_time` (timestamp, fin du timer)
      - `duration_minutes` (integer, durée en minutes)
      - `description` (text, description du travail effectué)
      - `is_billable` (boolean, temps facturable)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour que les utilisateurs ne voient que leurs données
    - Contraintes de validation

  3. Fonctions
    - Trigger pour calculer automatiquement les heures réelles
    - Fonction pour mettre à jour les timestamps
*/

-- Créer les types enum
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  estimated_hours numeric(5,2) DEFAULT 0,
  actual_hours numeric(5,2) DEFAULT 0,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT tasks_estimated_hours_check CHECK (estimated_hours >= 0),
  CONSTRAINT tasks_actual_hours_check CHECK (actual_hours >= 0)
);

-- Table des entrées de temps
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer DEFAULT 0,
  description text,
  is_billable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT time_entries_duration_check CHECK (duration_minutes >= 0),
  CONSTRAINT time_entries_time_order_check CHECK (end_time IS NULL OR end_time > start_time)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tasks_order_id ON tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_order_id ON time_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour tasks
CREATE POLICY "Users can read tasks for their orders"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT orders.id FROM orders
      JOIN clients ON orders.client_id = clients.id
      WHERE clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for their orders"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT orders.id FROM orders
      JOIN clients ON orders.client_id = clients.id
      WHERE clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their orders"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    order_id IN (
      SELECT orders.id FROM orders
      JOIN clients ON orders.client_id = clients.id
      WHERE clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their orders"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    order_id IN (
      SELECT orders.id FROM orders
      JOIN clients ON orders.client_id = clients.id
      WHERE clients.user_id = auth.uid()
    )
  );

-- Politiques RLS pour time_entries
CREATE POLICY "Users can read own time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own time entries"
  ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries"
  ON time_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own time entries"
  ON time_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at sur tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Fonction pour calculer automatiquement les heures réelles
CREATE OR REPLACE FUNCTION calculate_task_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculer les heures réelles pour la tâche
  UPDATE tasks 
  SET actual_hours = (
    SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
    FROM time_entries 
    WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)
  )
  WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour recalculer les heures réelles
DROP TRIGGER IF EXISTS calculate_actual_hours_on_insert ON time_entries;
CREATE TRIGGER calculate_actual_hours_on_insert
  AFTER INSERT ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_task_actual_hours();

DROP TRIGGER IF EXISTS calculate_actual_hours_on_update ON time_entries;
CREATE TRIGGER calculate_actual_hours_on_update
  AFTER UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_task_actual_hours();

DROP TRIGGER IF EXISTS calculate_actual_hours_on_delete ON time_entries;
CREATE TRIGGER calculate_actual_hours_on_delete
  AFTER DELETE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_task_actual_hours();

-- Fonction pour marquer automatiquement une tâche comme terminée
CREATE OR REPLACE FUNCTION auto_complete_task()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-completion
DROP TRIGGER IF EXISTS auto_complete_task_trigger ON tasks;
CREATE TRIGGER auto_complete_task_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_task();