-- Etape 6: Désactiver temporairement RLS pour tester
-- Solution temporaire pour résoudre le problème de récursion

-- Désactiver RLS temporairement
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques problématiques
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Vérifier que RLS est désactivé
SELECT 'RLS désactivé temporairement pour user_profiles' as status;
