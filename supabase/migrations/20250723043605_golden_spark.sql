/*
  # Ajouter les champs de profil utilisateur

  1. Nouvelles colonnes
    - `name` (text) - Nom complet de l'utilisateur
    - `activity` (text) - Domaine d'activité du freelance
    - `country` (text) - Pays de résidence
    - `onboarding_completed` (boolean) - Statut de l'onboarding

  2. Sécurité
    - Mise à jour des politiques RLS existantes
*/

-- Ajouter les nouveaux champs à la table users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'activity'
  ) THEN
    ALTER TABLE users ADD COLUMN activity text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;