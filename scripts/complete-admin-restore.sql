-- RESTAURATION COMPLÈTE : Admin + Username + RLS
-- À exécuter dans Supabase SQL Editor

-- 1. DÉSACTIVER RLS complètement
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Public usernames readable" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all" ON user_profiles;
DROP POLICY IF EXISTS "Allow all access" ON user_profiles;
DROP POLICY IF EXISTS "Simple access" ON user_profiles;

-- 3. Vérifier l'état actuel
SELECT 
  'État actuel des profils:' as info,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count
FROM user_profiles;

-- 4. Restaurer ton statut admin
UPDATE user_profiles 
SET 
  is_admin = TRUE,
  is_active = TRUE,
  full_name = COALESCE(full_name, 'Admin User'),
  email = COALESCE(email, 'fx.bergeron011@gmail.com')
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 5. Ajouter le username si pas déjà fait
UPDATE user_profiles 
SET username = 'admin'
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814'
AND (username IS NULL OR username = '');

-- 6. Créer le profil s'il n'existe pas
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
  'Admin User',
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

-- 7. Vérifier la restauration
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

-- 8. Réactiver RLS avec une politique très permissive
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Créer une politique simple et sûre
CREATE POLICY "Full access for now" ON user_profiles
  FOR ALL USING (true);

-- 10. Vérification finale
SELECT 
  'Restauration terminee!' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count
FROM user_profiles;
