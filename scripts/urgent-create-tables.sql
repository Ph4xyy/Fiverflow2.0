-- Script URGENT pour créer les tables manquantes
-- À exécuter IMMÉDIATEMENT dans Supabase SQL Editor

-- Supprimer les tables si elles existent (pour repartir à zéro)
DROP TABLE IF EXISTS user_awards CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;

-- Créer la table user_skills
CREATE TABLE user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  category VARCHAR(50) DEFAULT 'Général',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table user_awards
CREATE TABLE user_awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  issuer VARCHAR(200) NOT NULL,
  date_received DATE NOT NULL,
  category VARCHAR(50) DEFAULT 'Autres',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_awards ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_skills
CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public skills" ON user_skills
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own skills" ON user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" ON user_skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" ON user_skills
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour user_awards
CREATE POLICY "Users can view their own awards" ON user_awards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public awards" ON user_awards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own awards" ON user_awards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own awards" ON user_awards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own awards" ON user_awards
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les index
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_awards_user_id ON user_awards(user_id);

-- Vérifier que les tables existent
SELECT 'Tables créées avec succès!' as status;
SELECT table_name FROM information_schema.tables WHERE table_name IN ('user_skills', 'user_awards');
