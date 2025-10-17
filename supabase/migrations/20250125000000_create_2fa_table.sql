-- Migration pour créer la table 2FA et les fonctions associées
-- Création de la table pour stocker les informations 2FA des utilisateurs

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_2fa_user_id_unique ON user_2fa(user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_2fa_updated_at 
    BEFORE UPDATE ON user_2fa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs ne peuvent voir que leurs propres données 2FA
CREATE POLICY "Users can view their own 2FA data" ON user_2fa
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA data" ON user_2fa
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA data" ON user_2fa
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own 2FA data" ON user_2fa
    FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour vérifier si un utilisateur a 2FA activé
CREATE OR REPLACE FUNCTION user_has_2fa_enabled(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_2fa 
        WHERE user_id = user_uuid AND enabled = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les informations 2FA d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_2fa_info(user_uuid UUID)
RETURNS TABLE(
    enabled BOOLEAN,
    backup_codes TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u2f.enabled,
        u2f.backup_codes
    FROM user_2fa u2f
    WHERE u2f.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour désactiver 2FA
CREATE OR REPLACE FUNCTION disable_user_2fa(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_2fa 
    SET 
        enabled = FALSE,
        secret = NULL,
        backup_codes = '{}',
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
