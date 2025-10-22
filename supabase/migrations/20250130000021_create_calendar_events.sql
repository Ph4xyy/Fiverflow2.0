-- Migration pour créer la table calendar_events
-- Cette table stocke les événements du calendrier liés aux tâches

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start TIMESTAMPTZ NOT NULL,
  end TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'meeting', -- 'meeting', 'deadline', 'reminder'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  attendees TEXT[], -- Liste des participants
  location TEXT,
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_task ON calendar_events(related_task_id);

-- RLS (Row Level Security)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres événements
CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- Commentaires
COMMENT ON TABLE calendar_events IS 'Table pour stocker les événements du calendrier';
COMMENT ON COLUMN calendar_events.related_task_id IS 'Référence vers la tâche associée (optionnel)';
COMMENT ON COLUMN calendar_events.type IS 'Type d\'événement: meeting, deadline, reminder';
COMMENT ON COLUMN calendar_events.priority IS 'Priorité: low, medium, high';
COMMENT ON COLUMN calendar_events.attendees IS 'Liste des participants à l\'événement';
