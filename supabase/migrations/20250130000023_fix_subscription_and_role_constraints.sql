-- Migration pour corriger les contraintes de subscription_plan et role
-- Date: 2025-01-30

-- 1. Ajouter une contrainte CHECK pour subscription_plan
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_subscription_plan_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_plan_check 
CHECK (subscription_plan IN ('Lunch', 'Boost', 'Scale'));

-- 2. Ajouter une contrainte CHECK pour role
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('Member', 'Moderator', 'Admin'));

-- 3. Mettre à jour les valeurs existantes pour qu'elles respectent les contraintes
-- Corriger les rôles existants
UPDATE user_profiles 
SET role = 'Member' 
WHERE role NOT IN ('Member', 'Moderator', 'Admin');

-- Corriger les plans d'abonnement existants
UPDATE user_profiles 
SET subscription_plan = 'Lunch' 
WHERE subscription_plan NOT IN ('Lunch', 'Boost', 'Scale');

-- 4. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN user_profiles.subscription_plan IS 'Plan d''abonnement: Lunch (gratuit), Boost (payant), Scale (premium)';
COMMENT ON COLUMN user_profiles.role IS 'Rôle utilisateur: Member (membre), Moderator (modérateur), Admin (administrateur)';

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 6. Ajouter des valeurs par défaut
ALTER TABLE user_profiles 
ALTER COLUMN subscription_plan SET DEFAULT 'Lunch';

ALTER TABLE user_profiles 
ALTER COLUMN role SET DEFAULT 'Member';
