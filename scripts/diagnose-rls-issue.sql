-- Script de diagnostic pour identifier les problèmes RLS
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier l'état actuel des politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 2. Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  relforcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 3. Vérifier les contraintes et index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles';

-- 4. Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Compter les enregistrements
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as profiles_with_username,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_profiles
FROM user_profiles;

-- 6. Vérifier les utilisateurs admin
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin,
  created_at
FROM user_profiles 
WHERE is_admin = TRUE
ORDER BY created_at;
