-- Migration pour créer la table assistant_conversations
-- Stocke l'historique des conversations avec Jett

CREATE TABLE IF NOT EXISTS assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Historique de la conversation
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Une seule conversation active par utilisateur
  CONSTRAINT one_active_conversation_per_user UNIQUE (user_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_user_id ON assistant_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_updated_at ON assistant_conversations(updated_at);

-- RLS (Row Level Security)
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;

-- Politique RLS: les utilisateurs ne peuvent voir que leurs propres conversations
CREATE POLICY "Users can manage their own conversations" ON assistant_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_assistant_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assistant_conversations_updated_at
  BEFORE UPDATE ON assistant_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_assistant_conversations_updated_at();

