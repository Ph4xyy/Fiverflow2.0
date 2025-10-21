-- Script pour créer les profils manquants pour tous les utilisateurs
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les utilisateurs qui n'ont pas de profil
SELECT 
  'Utilisateurs sans profil:' as info,
  au.id as user_id,
  au.email,
  au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ORDER BY au.created_at;

-- 2. Créer les profils manquants pour tous les utilisateurs
INSERT INTO user_profiles (
  user_id,
  full_name,
  email,
  username,
  is_admin,
  is_active,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.email,
  NULL, -- Username sera défini plus tard par l'utilisateur
  FALSE, -- Pas admin par défaut
  TRUE,  -- Actif par défaut
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = au.id
);

-- 3. Vérifier que les profils ont été créés
SELECT 
  'Profils créés avec succès!' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as profiles_with_username
FROM user_profiles;

-- 4. Lister tous les utilisateurs maintenant
SELECT 
  up.user_id,
  up.full_name,
  up.email,
  up.username,
  up.is_admin,
  up.is_active,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC;

-- 5. Vérifier le trigger handle_new_user
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_name = 'on_auth_user_created';
