-- Etape 13: Table meetings pour FiverFlow 2.0
-- Table pour la gestion des meetings et événements

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL,
  
  -- Participants et localisation
  attendees TEXT[],
  location TEXT,
  
  -- Type et priorité
  meeting_type TEXT DEFAULT 'in_person',
  priority TEXT DEFAULT 'medium',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT meetings_title_check CHECK (LENGTH(title) > 0),
  CONSTRAINT meetings_time_check CHECK (end_time > start_time)
);

-- Index pour les performances
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_created_at ON meetings(created_at);

-- RLS (Row Level Security)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Politique RLS: les utilisateurs ne peuvent voir que leurs propres meetings
CREATE POLICY "Users can manage their own meetings" ON meetings
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON meetings TO authenticated;

-- Vérifier que la table a été créée
SELECT 'Table meetings créée avec succès!' as status;
