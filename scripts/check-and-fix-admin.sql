-- Script pour vérifier et corriger le statut admin

-- 1. Vérifier si votre profil existe
SELECT 
  'Vérification du profil utilisateur:' as step,
  up.id,
  up.user_id,
  up.full_name,
  up.is_admin,
  au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'votre-email@example.com';

-- 2. Si le profil n'existe pas, le créer
INSERT INTO user_profiles (user_id, full_name, is_admin)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  TRUE
FROM auth.users au
WHERE au.email = 'votre-email@example.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = au.id
);

-- 3. Si le profil existe, le promouvoir en admin
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'votre-email@example.com'
);

-- 4. Vérifier le résultat
SELECT 
  'Résultat final:' as step,
  up.full_name,
  au.email,
  up.is_admin,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'votre-email@example.com';

-- 5. Lister tous les admins
SELECT 
  'Tous les administrateurs:' as step,
  up.full_name,
  au.email,
  up.is_admin
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = TRUE;
