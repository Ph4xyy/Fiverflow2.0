-- Script pour ajouter un username à un compte admin existant
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les comptes admin existants
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

-- 2. Mettre à jour le username pour le premier admin (remplace 'admin' par le username souhaité)
UPDATE user_profiles 
SET username = 'admin'
WHERE is_admin = TRUE 
AND username IS NULL
AND user_id = (
  SELECT user_id 
  FROM user_profiles 
  WHERE is_admin = TRUE 
  AND username IS NULL 
  ORDER BY created_at 
  LIMIT 1
);

-- 3. Vérifier que la mise à jour a fonctionné
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin
FROM user_profiles 
WHERE is_admin = TRUE;

-- 4. Si tu veux spécifier un username différent, utilise cette requête :
-- UPDATE user_profiles 
-- SET username = 'ton_username_ici'
-- WHERE user_id = 'TON_USER_ID_ICI';

SELECT 'Username ajouté au compte admin!' as status;
