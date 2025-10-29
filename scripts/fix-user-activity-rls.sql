-- Script de correction des politiques RLS pour user_activity
-- Ce script corrige l'erreur 406 sur la table user_activity

-- 1. Activer RLS sur la table user_activity si ce n'est pas déjà fait
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON user_activity;
DROP POLICY IF EXISTS "Admins can manage all activity" ON user_activity;

-- 3. Créer de nouvelles politiques RLS sécurisées

-- Politique pour la lecture : les utilisateurs peuvent voir leur propre activité
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour l'insertion : les utilisateurs peuvent créer leur propre activité
CREATE POLICY "Users can insert their own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour la mise à jour : les utilisateurs peuvent modifier leur propre activité
CREATE POLICY "Users can update their own activity" ON user_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour la suppression : les utilisateurs peuvent supprimer leur propre activité
CREATE POLICY "Users can delete their own activity" ON user_activity
  FOR DELETE USING (auth.uid() = user_id);

-- Politique pour les admins : accès complet à toutes les activités
CREATE POLICY "Admins can manage all activity" ON user_activity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 4. Vérifier que les politiques sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_activity';

-- 5. Test de la politique (optionnel - à exécuter manuellement si nécessaire)
-- SELECT * FROM user_activity WHERE user_id = auth.uid() LIMIT 1;

COMMENT ON TABLE user_activity IS 'Table des activités utilisateur avec politiques RLS sécurisées';
