-- Script pour ajouter les colonnes bannière et logo à la table users
-- Exécuter ce script dans Supabase SQL Editor

-- 1. Ajouter les colonnes pour les images de profil
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Créer un index sur updated_at pour les performances
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);

-- 3. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Appliquer le trigger à la table users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Créer le bucket de stockage pour les images utilisateur (si il n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-assets',
    'user-assets',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 6. Créer les politiques RLS pour le bucket user-assets
-- Politique pour permettre aux utilisateurs de voir leurs propres images
CREATE POLICY "Users can view own images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs d'uploader leurs propres images
CREATE POLICY "Users can upload own images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres images
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Mettre à jour les utilisateurs existants avec updated_at
UPDATE users 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 8. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('banner_url', 'logo_url', 'avatar_url', 'updated_at')
ORDER BY ordinal_position;

-- Message de confirmation
SELECT 'Colonnes d''images de profil ajoutees avec succes!' as message;
