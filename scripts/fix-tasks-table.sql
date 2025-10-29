-- Script SQL simplifié pour corriger la table tasks
-- À exécuter dans l'interface Supabase SQL Editor

-- Vérifier si la colonne order_id existe
DO $$ 
BEGIN
    -- Ajouter order_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE tasks ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
    
    -- Ajouter estimated_hours si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'estimated_hours'
    ) THEN
        ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Ajouter actual_hours si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'actual_hours'
    ) THEN
        ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Ajouter completed_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
    
    -- Ajouter user_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Créer la table time_entries si elle n'existe pas
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

-- Politique RLS pour time_entries (supprimer d'abord si elle existe)
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
CREATE POLICY "Users can manage their own time entries" ON time_entries
FOR ALL USING (auth.uid() = user_id);

-- Index pour les performances (supprimer d'abord si ils existent)
DROP INDEX IF EXISTS idx_time_entries_user_id;
DROP INDEX IF EXISTS idx_time_entries_task_id;
DROP INDEX IF EXISTS idx_time_entries_order_id;
DROP INDEX IF EXISTS idx_time_entries_start_time;

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_order_id ON time_entries(order_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);

-- Permissions
GRANT ALL ON time_entries TO authenticated;

-- Vérifier que les tables sont configurées
SELECT 'Tables Workboard configurées avec succès!' as status;
