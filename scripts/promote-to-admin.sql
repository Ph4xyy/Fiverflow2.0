-- Script pour promouvoir un utilisateur en administrateur
-- Remplacez 'USER_EMAIL' par l'email de l'utilisateur à promouvoir

-- Méthode 1: Promouvoir par email
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'USER_EMAIL'
);

-- Méthode 2: Promouvoir par user_id (si vous connaissez l'ID)
-- UPDATE user_profiles 
-- SET is_admin = TRUE 
-- WHERE user_id = 'USER_ID_HERE';

-- Vérifier que la promotion a fonctionné
SELECT 
  up.full_name,
  au.email,
  up.is_admin,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'USER_EMAIL';

-- Lister tous les administrateurs
SELECT 
  up.full_name,
  au.email,
  up.is_admin,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = TRUE
ORDER BY up.created_at DESC;
