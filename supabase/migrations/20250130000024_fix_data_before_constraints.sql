-- Migration pour corriger les données avant d'appliquer les contraintes
-- Date: 2025-01-30

-- 1. D'abord, voir quelles sont les valeurs actuelles
SELECT DISTINCT role FROM user_profiles;
SELECT DISTINCT subscription_plan FROM user_profiles;

-- 2. Corriger les rôles existants
-- Mapper les anciens rôles vers les nouveaux
UPDATE user_profiles 
SET role = 'Member' 
WHERE role IS NULL OR role = '' OR role NOT IN ('Member', 'Moderator', 'Admin');

-- Corriger les rôles spécifiques
UPDATE user_profiles 
SET role = 'Admin' 
WHERE role IN ('admin', 'administrator', 'super_admin');

UPDATE user_profiles 
SET role = 'Moderator' 
WHERE role IN ('moderator', 'mod', 'staff');

UPDATE user_profiles 
SET role = 'Member' 
WHERE role IN ('user', 'client', 'customer', 'member');

-- 3. Corriger les plans d'abonnement existants
-- Mapper les anciens plans vers les nouveaux
UPDATE user_profiles 
SET subscription_plan = 'Lunch' 
WHERE subscription_plan IS NULL OR subscription_plan = '' OR subscription_plan NOT IN ('Lunch', 'Boost', 'Scale');

-- Corriger les plans spécifiques
UPDATE user_profiles 
SET subscription_plan = 'Lunch' 
WHERE subscription_plan IN ('free', 'basic', 'launch', 'starter');

UPDATE user_profiles 
SET subscription_plan = 'Boost' 
WHERE subscription_plan IN ('boost', 'pro', 'premium', 'advanced');

UPDATE user_profiles 
SET subscription_plan = 'Scale' 
WHERE subscription_plan IN ('scale', 'enterprise', 'business', 'ultimate');

-- 4. Vérifier qu'il n'y a plus de valeurs invalides
SELECT DISTINCT role FROM user_profiles;
SELECT DISTINCT subscription_plan FROM user_profiles;

-- 5. Maintenant appliquer les contraintes
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_subscription_plan_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_plan_check 
CHECK (subscription_plan IN ('Lunch', 'Boost', 'Scale'));

ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('Member', 'Moderator', 'Admin'));

-- 6. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN user_profiles.subscription_plan IS 'Plan d''abonnement: Lunch (gratuit), Boost (payant), Scale (premium)';
COMMENT ON COLUMN user_profiles.role IS 'Rôle utilisateur: Member (membre), Moderator (modérateur), Admin (administrateur)';

-- 7. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 8. Ajouter des valeurs par défaut
ALTER TABLE user_profiles 
ALTER COLUMN subscription_plan SET DEFAULT 'Lunch';

ALTER TABLE user_profiles 
ALTER COLUMN role SET DEFAULT 'Member';
