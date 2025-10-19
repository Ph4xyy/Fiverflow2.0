-- Etape 9: Créer les profils manquants pour tous les utilisateurs existants
-- Problème: certains utilisateurs n'ont pas de profil dans user_profiles

-- Créer les profils manquants pour tous les utilisateurs
INSERT INTO user_profiles (user_id, full_name, is_admin, is_active)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  FALSE, -- Pas admin par défaut
  TRUE   -- Actif par défaut
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = au.id
);

-- Vérifier le résultat
SELECT 
  'Profils créés avec succès!' as status,
  (SELECT COUNT(*) FROM user_profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users;
