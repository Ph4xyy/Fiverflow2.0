-- SOLUTION RADICALE : Désactiver complètement RLS
-- À exécuter dans Supabase SQL Editor

-- 1. DÉSACTIVER RLS complètement sur user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Public usernames readable" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all" ON user_profiles;
DROP POLICY IF EXISTS "Allow all access" ON user_profiles;
DROP POLICY IF EXISTS "Full access for now" ON user_profiles;
DROP POLICY IF EXISTS "Simple access" ON user_profiles;
DROP POLICY IF EXISTS "Public usernames are readable" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- 3. Vérifier l'état actuel
SELECT 
  'État avant réparation:' as info,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count
FROM user_profiles;

-- 4. Restaurer ton profil admin
UPDATE user_profiles 
SET 
  is_admin = TRUE,
  is_active = TRUE,
  full_name = 'Fx Admin',
  email = 'fx.bergeron011@gmail.com',
  username = 'admin'
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 5. Créer le profil s'il n'existe pas
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
  'd670e08d-ea95-4738-a8b0-93682c9b5814',
  'Fx Admin',
  'fx.bergeron011@gmail.com',
  'admin',
  TRUE,
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814'
);

-- 6. Vérifier la réparation
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin,
  is_active,
  created_at
FROM user_profiles 
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 7. Vérification finale
SELECT 
  'RLS désactivé - Profil admin restauré!' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count
FROM user_profiles;
