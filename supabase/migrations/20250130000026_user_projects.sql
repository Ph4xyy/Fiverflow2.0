-- Migration pour les projets utilisateur
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les likes de projets
CREATE TABLE IF NOT EXISTS project_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Table pour les vues de projets
CREATE TABLE IF NOT EXISTS project_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_public ON user_projects(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_projects_created_at ON user_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);

-- RLS pour user_projects
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON user_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public projects" ON user_projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own projects" ON user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON user_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS pour project_likes
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON project_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON project_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON project_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS pour project_views
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all views" ON project_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert views" ON project_views
  FOR INSERT WITH CHECK (true);

-- Fonctions pour gérer les compteurs
CREATE OR REPLACE FUNCTION increment_project_likes(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_projects 
  SET likes_count = likes_count + 1 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_project_likes(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_projects 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_projects 
  SET views_count = views_count + 1 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON user_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
