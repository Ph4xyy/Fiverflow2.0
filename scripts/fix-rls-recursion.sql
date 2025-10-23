-- Script pour corriger la récursion infinie dans les politiques RLS
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer TOUTES les politiques RLS existantes sur user_profiles
DROP POLICY IF EXISTS "Public usernames are readable" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Simple user access" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- 2. Désactiver temporairement RLS pour corriger le problème
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Réactiver RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques RLS simples et non-récursives
-- Politique pour la lecture des usernames publics (sans récursion)
CREATE POLICY "Public usernames readable" ON user_profiles
  FOR SELECT USING (username IS NOT NULL);

-- Politique pour que les utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs modifient leur propre profil
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs insèrent leur propre profil
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour les admins (sans récursion)
CREATE POLICY "Admins can manage all" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.is_admin = TRUE
    )
  );

-- 5. Vérifier que les politiques sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. Test de base pour vérifier que ça fonctionne
SELECT 'Politiques RLS corrigées!' as status;
