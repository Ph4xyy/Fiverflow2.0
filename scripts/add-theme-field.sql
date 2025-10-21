-- Script pour ajouter le champ thème
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne thème
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark';

-- Créer un index pour les recherches
CREATE INDEX IF NOT EXISTS idx_user_profiles_theme ON user_profiles(theme);

SELECT 'Colonne thème ajoutée avec succès!' as status;
