-- Vérifier que RLS est bien désactivé
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier l'état de RLS sur user_profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 2. Vérifier les politiques existantes (devrait être vide)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Tester l'accès direct à la table
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin,
  is_active
FROM user_profiles 
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 4. Compter tous les profils
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_profiles,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as profiles_with_username
FROM user_profiles;

-- 5. Vérifier que tu peux modifier ton profil
UPDATE user_profiles 
SET updated_at = NOW()
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

SELECT 'Test de modification réussi!' as status;
