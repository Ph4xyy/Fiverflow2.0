-- Migration pour les compétences utilisateur
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  category VARCHAR(50) DEFAULT 'Général',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(category);

-- RLS
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
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

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON user_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
