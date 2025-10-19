-- Etape 19: Correction de la récursion infinie et ajout de la colonne email
-- Problèmes: 
-- 1. Récursion infinie dans les politiques RLS
-- 2. Colonne email manquante dans user_profiles

-- Supprimer toutes les politiques problématiques
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Ajouter la colonne email si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Mettre à jour les emails existants depuis auth.users
UPDATE user_profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE user_profiles.user_id = auth_users.id
AND user_profiles.email IS NULL;

-- Créer une politique simple sans récursion
CREATE POLICY "Simple user access" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Vérifier que les corrections sont appliquées
SELECT 'Politiques RLS corrigees et colonne email ajoutee' as status;
