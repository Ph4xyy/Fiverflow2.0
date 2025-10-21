-- Script pour ajouter les nouveaux champs de réseaux sociaux
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes manquantes pour les réseaux sociaux
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Créer un index pour les recherches
CREATE INDEX IF NOT EXISTS idx_user_profiles_social ON user_profiles(instagram_url, tiktok_url, youtube_url);

SELECT 'Colonnes de réseaux sociaux ajoutées avec succès!' as status;
