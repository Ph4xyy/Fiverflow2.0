-- Migration pour les tables Workboard complètes
-- Ajouter les colonnes manquantes à la table tasks et créer time_entries

-- Ajouter les colonnes manquantes à la table tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Mettre à jour les contraintes de status pour correspondre au hook useTasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('todo', 'in_progress', 'completed'));

-- Mettre à jour les contraintes de priority pour correspondre au hook useTasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));

-- Créer la table time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Informations de temps
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  
  -- Informations supplémentaires
  description TEXT,
  is_billable BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT time_entries_duration_check CHECK (duration_minutes >= 0),
  CONSTRAINT time_entries_time_check CHECK (end_time IS NULL OR end_time >= start_time)
);

-- RLS pour time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour time_entries
CREATE POLICY IF NOT EXISTS "Users can manage their own time entries" ON time_entries
FOR ALL USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_order_id ON time_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Trigger pour updated_at sur time_entries
CREATE TRIGGER IF NOT EXISTS update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement la durée
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement la durée
CREATE TRIGGER IF NOT EXISTS calculate_duration_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_duration();

-- Permissions
GRANT ALL ON time_entries TO authenticated;

-- Vérifier que les tables sont configurées
SELECT 'Tables Workboard configurées avec succès!' as status;


