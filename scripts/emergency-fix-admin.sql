-- RÉPARATION D'URGENCE : Restaurer l'accès admin et corriger les politiques RLS
-- À exécuter dans Supabase SQL Editor

-- 1. DÉSACTIVER COMPLÈTEMENT RLS pour permettre la réparation
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier l'état actuel des utilisateurs admin
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin,
  is_active,
  created_at
FROM user_profiles 
WHERE is_admin = TRUE
ORDER BY created_at;

-- 3. Restaurer le statut admin pour ton compte (remplace par ton user_id)
-- Remplace 'd670e08d-ea95-4738-a8b0-93682c9b5814' par ton vrai user_id si différent
UPDATE user_profiles 
SET is_admin = TRUE, is_active = TRUE
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 4. Ajouter un username à ton compte admin
UPDATE user_profiles 
SET username = 'admin'
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814'
AND username IS NULL;

-- 5. Vérifier que la réparation a fonctionné
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin,
  is_active
FROM user_profiles 
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 6. Créer un profil par défaut si nécessaire
INSERT INTO user_profiles (
  user_id, 
  full_name, 
  email, 
  username, 
  is_admin, 
  is_active
)
SELECT 
  'd670e08d-ea95-4738-a8b0-93682c9b5814',
  'Admin User',
  'fx.bergeron011@gmail.com',
  'admin',
  TRUE,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814'
);

-- 7. Réactiver RLS avec des politiques très simples
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Créer une politique simple pour permettre l'accès
CREATE POLICY "Allow all access" ON user_profiles
  FOR ALL USING (true);

-- 9. Vérification finale
SELECT 'Reparation d urgence terminee!' as status;
