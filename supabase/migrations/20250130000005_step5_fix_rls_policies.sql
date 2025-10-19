-- Etape 5: Correction des politiques RLS pour user_profiles
-- Problème: récursion infinie dans les politiques

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Recréer les politiques RLS sans récursion
-- Politique 1: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique 2: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique 3: Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique 4: Les admins peuvent voir tous les profils (sans récursion)
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.is_admin = TRUE
      AND admin_check.id != user_profiles.id
    )
  );

-- Politique 5: Les admins peuvent modifier tous les profils (sans récursion)
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.is_admin = TRUE
      AND admin_check.id != user_profiles.id
    )
  );

-- Vérifier que les politiques ont été créées
SELECT 'Politiques RLS corrigées avec succès!' as status;
