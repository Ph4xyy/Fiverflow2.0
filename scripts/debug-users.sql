-- Script de debug pour vérifier les utilisateurs

-- 1. Vérifier tous les utilisateurs dans auth.users
SELECT 
  'Utilisateurs dans auth.users:' as info,
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Vérifier tous les profils dans user_profiles
SELECT 
  'Profils dans user_profiles:' as info,
  id,
  user_id,
  full_name,
  is_admin,
  is_active,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 3. Vérifier la correspondance entre auth.users et user_profiles
SELECT 
  'Correspondance auth.users <-> user_profiles:' as info,
  au.id as auth_id,
  au.email,
  au.created_at as auth_created,
  up.id as profile_id,
  up.full_name,
  up.is_admin,
  up.created_at as profile_created
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- 4. Compter les utilisateurs
SELECT 
  'Compteurs:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM user_profiles) as total_profiles,
  (SELECT COUNT(*) FROM user_profiles WHERE is_admin = TRUE) as total_admins;
