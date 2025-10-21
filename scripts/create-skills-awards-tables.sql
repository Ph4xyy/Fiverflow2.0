-- Script pour créer les tables Skills et Awards
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table user_skills
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  category VARCHAR(50) DEFAULT 'Général',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table user_awards
CREATE TABLE IF NOT EXISTS user_awards (
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

-- 3. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(category);
CREATE INDEX IF NOT EXISTS idx_user_skills_level ON user_skills(level);

CREATE INDEX IF NOT EXISTS idx_user_awards_user_id ON user_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_awards_category ON user_awards(category);
CREATE INDEX IF NOT EXISTS idx_user_awards_date ON user_awards(date_received);

-- 4. Activer RLS
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_awards ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS pour user_skills
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

-- 6. Créer les politiques RLS pour user_awards
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

-- 7. Créer les triggers pour updated_at
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

CREATE TRIGGER update_user_awards_updated_at
  BEFORE UPDATE ON user_awards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Insérer des données d'exemple (optionnel)
INSERT INTO user_skills (user_id, name, level, category) VALUES
  (auth.uid(), 'React', 'expert', 'Développement'),
  (auth.uid(), 'TypeScript', 'advanced', 'Développement'),
  (auth.uid(), 'Node.js', 'intermediate', 'Développement'),
  (auth.uid(), 'Figma', 'advanced', 'Design'),
  (auth.uid(), 'Photoshop', 'intermediate', 'Design')
ON CONFLICT DO NOTHING;

INSERT INTO user_awards (user_id, title, description, issuer, date_received, category) VALUES
  (auth.uid(), 'Certification AWS Solutions Architect', 'Certification professionnelle AWS', 'Amazon Web Services', '2024-01-15', 'Certification'),
  (auth.uid(), 'Meilleur projet innovant', 'Prix pour un projet de fin d\'études', 'Université Tech', '2023-06-20', 'Concours'),
  (auth.uid(), 'Formation React Avancé', 'Formation complète sur React et ses écosystèmes', 'React Academy', '2023-12-10', 'Formation')
ON CONFLICT DO NOTHING;

SELECT 'Tables Skills et Awards créées avec succès!' as status;
