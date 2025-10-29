-- Script pour promouvoir ton ami en admin
-- À exécuter dans Supabase SQL Editor

-- 1. D'abord, trouver ton ami dans la table user_profiles
SELECT 
  'Utilisateurs actuels:' as info,
  up.user_id,
  up.full_name,
  up.email,
  up.username,
  up.is_admin,
  up.is_active
FROM user_profiles up
ORDER BY up.created_at DESC;

-- 2. Si ton ami n'apparaît pas, créer son profil d'abord
-- Remplace 'EMAIL_DE_TON_AMI' par l'email de ton ami
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
  NULL, -- Username sera défini plus tard
  FALSE, -- Pas admin pour l'instant
  TRUE,  -- Actif
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'EMAIL_DE_TON_AMI' -- Remplace par l'email de ton ami
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = au.id
);

-- 3. Promouvoir ton ami en admin
-- Remplace 'EMAIL_DE_TON_AMI' par l'email de ton ami
UPDATE user_profiles 
SET 
  is_admin = TRUE,
  is_active = TRUE,
  updated_at = NOW()
WHERE email = 'EMAIL_DE_TON_AMI'; -- Remplace par l'email de ton ami

-- 4. Vérifier que la promotion a fonctionné
SELECT 
  'Promotion terminée!' as status,
  up.user_id,
  up.full_name,
  up.email,
  up.username,
  up.is_admin,
  up.is_active
FROM user_profiles up
WHERE up.email = 'EMAIL_DE_TON_AMI'; -- Remplace par l'email de ton ami

-- 5. Lister tous les admins
SELECT 
  'Liste des admins:' as info,
  up.user_id,
  up.full_name,
  up.email,
  up.username,
  up.is_admin
FROM user_profiles up
WHERE up.is_admin = TRUE
ORDER BY up.created_at;
