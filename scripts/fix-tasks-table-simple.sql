-- Script SQL ultra-simple pour corriger la table tasks
-- Version compatible avec toutes les versions de PostgreSQL/Supabase

-- Ajouter les colonnes manquantes à la table tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer la table time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  description TEXT,
  is_billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;

-- Créer la politique RLS
CREATE POLICY "Users can manage their own time entries" ON time_entries
FOR ALL USING (auth.uid() = user_id);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_order_id ON time_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Permissions
GRANT ALL ON time_entries TO authenticated;

-- Message de confirmation
SELECT 'Migration Workboard appliquée avec succès!' as status;
