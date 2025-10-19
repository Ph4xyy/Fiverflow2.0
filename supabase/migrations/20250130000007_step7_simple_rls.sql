-- Etape 7: RLS simple sans récursion
-- Solution définitive avec des politiques simples

-- Réactiver RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique simple: tous les utilisateurs authentifiés peuvent tout faire
-- (pour l'instant, on peut restreindre plus tard si nécessaire)
CREATE POLICY "Authenticated users can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- Vérifier que RLS est réactivé
SELECT 'RLS simple activé pour user_profiles' as status;
