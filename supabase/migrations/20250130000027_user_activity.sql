-- Migration pour l'activité utilisateur
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'project_created', 
    'project_liked', 
    'profile_updated', 
    'skill_added', 
    'social_connected'
  )),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public activity" ON user_activity
  FOR SELECT USING (
    type IN ('project_created', 'skill_added') AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = user_activity.user_id 
      AND show_activity = true
    )
  );

CREATE POLICY "Users can insert their own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ajouter la colonne show_activity à user_profiles si elle n'existe pas
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true;
