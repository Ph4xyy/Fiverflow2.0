-- Vérifier l'état de la table user_profiles

-- 1. Vérifier si la table existe
SELECT 
  'Table user_profiles existe:' as info,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles'
  ) as table_exists;

-- 2. Compter les enregistrements
SELECT 
  'Nombre d\'enregistrements:' as info,
  COUNT(*) as total_records
FROM user_profiles;

-- 3. Voir les premiers enregistrements
SELECT 
  'Premiers enregistrements:' as info,
  id,
  user_id,
  full_name,
  is_admin,
  is_active,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérifier les permissions RLS
SELECT 
  'Politiques RLS:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';
