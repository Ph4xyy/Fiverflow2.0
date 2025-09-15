/*
  # Ajouter le champ referral_code à la table users

  1. Modifications
    - Ajouter la colonne `referral_code` (text, unique)
    - Créer un index unique sur `referral_code`
    - Générer des codes de parrainage pour les utilisateurs existants

  2. Sécurité
    - Le champ est unique pour éviter les doublons
    - Index pour des recherches rapides
*/

-- Ajouter la colonne referral_code
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Créer un index unique sur referral_code
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON users(referral_code);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code(user_name text, user_id uuid)
RETURNS text AS $$
DECLARE
  base_code text;
  final_code text;
  counter integer := 1;
BEGIN
  -- Créer un code de base à partir du nom ou de l'ID
  IF user_name IS NOT NULL AND user_name != '' THEN
    base_code := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '', 'g'));
    base_code := substring(base_code from 1 for 8);
  ELSE
    base_code := 'user' || substring(user_id::text from 1 for 4);
  END IF;
  
  -- S'assurer que le code fait au moins 3 caractères
  IF length(base_code) < 3 THEN
    base_code := base_code || substring(user_id::text from 1 for 3);
  END IF;
  
  final_code := base_code;
  
  -- Vérifier l'unicité et ajouter un numéro si nécessaire
  WHILE EXISTS (SELECT 1 FROM users WHERE referral_code = final_code) LOOP
    final_code := base_code || counter::text;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Générer des codes de parrainage pour les utilisateurs existants qui n'en ont pas
UPDATE users 
SET referral_code = generate_referral_code(name, id)
WHERE referral_code IS NULL;

-- Supprimer la fonction temporaire
DROP FUNCTION generate_referral_code(text, uuid);