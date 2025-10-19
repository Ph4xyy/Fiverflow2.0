-- Etape 18: Correction de l'erreur 406
-- Problème: La politique RLS cause une erreur 406 "Not Acceptable"

-- Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON user_profiles;

-- Créer une politique plus spécifique pour éviter l'erreur 406
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour les admins (accès complet)
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- Vérifier que les politiques sont créées
SELECT 'Politiques RLS corrigees pour eviter l erreur 406' as status;
