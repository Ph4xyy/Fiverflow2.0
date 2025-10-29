-- Migration pour le système d'IA
-- Création des tables assistant_actions et ai_usage
-- Date: 2025-01-30

-- 1. Table assistant_actions pour logger toutes les actions de l'assistant
CREATE TABLE IF NOT EXISTS assistant_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  resource TEXT NOT NULL,
  payload_json JSONB,
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table ai_usage pour tracker l'usage mensuel par utilisateur
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table events pour les événements du calendrier
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  related_client_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ajouter user_id à la table clients si elle n'existe pas
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Mettre à jour les clients existants avec user_id si NULL
UPDATE clients SET user_id = (
  SELECT id FROM auth.users WHERE auth.users.id = clients.created_by
  LIMIT 1
) WHERE user_id IS NULL;

-- RLS pour assistant_actions
ALTER TABLE assistant_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assistant actions" ON assistant_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assistant actions" ON assistant_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS pour ai_usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ai usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS pour events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events" ON events
  FOR ALL USING (auth.uid() = owner_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_assistant_actions_user_id ON assistant_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_actions_created_at ON assistant_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_assistant_actions_resource ON assistant_actions(resource);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_action_type ON ai_usage(action_type);

CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_related_client_id ON events(related_client_id);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- RLS pour clients (mettre à jour les politiques existantes)
CREATE POLICY "Users can manage their own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at sur events
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Vérifier que les tables sont créées
SELECT 'Tables du système d\'IA créées avec succès!' as status;

