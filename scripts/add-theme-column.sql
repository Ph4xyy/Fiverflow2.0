-- Script pour ajouter la colonne theme_preference à la table users
-- Ce script permet de sauvegarder les préférences de thème de manière plus précise

-- Ajouter la colonne theme_preference si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'theme_preference'
    ) THEN
        ALTER TABLE users ADD COLUMN theme_preference TEXT DEFAULT 'light';
        RAISE NOTICE 'Colonne theme_preference ajoutée à la table users';
    ELSE
        RAISE NOTICE 'Colonne theme_preference existe déjà';
    END IF;
END $$;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_theme_preference ON users(theme_preference);

-- Mettre à jour les utilisateurs existants pour qu'ils aient un thème par défaut
UPDATE users 
SET theme_preference = CASE 
    WHEN dark_mode = true THEN 'dark'
    ELSE 'light'
END
WHERE theme_preference IS NULL;
