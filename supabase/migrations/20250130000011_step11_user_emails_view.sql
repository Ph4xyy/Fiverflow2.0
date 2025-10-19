-- Etape 11: Créer une vue pour accéder aux emails des utilisateurs
-- Problème: auth.users n'est pas accessible directement

-- Créer une vue qui joint user_profiles avec auth.users
CREATE OR REPLACE VIEW user_emails_view AS
SELECT 
  up.id as profile_id,
  up.user_id,
  up.full_name,
  up.is_admin,
  up.is_active,
  up.created_at,
  au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;

-- Permissions pour la vue
GRANT SELECT ON user_emails_view TO authenticated;

-- Vérifier que la vue a été créée
SELECT 'Vue user_emails_view créée avec succès!' as status;
