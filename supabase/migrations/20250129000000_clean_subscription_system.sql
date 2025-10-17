/*
  # Nettoyage du système d'abonnement
  
  Cette migration finalise la transition du système d'abonnement en :
  1. Supprimant le champ obsolète `is_pro` de la table users
  2. S'assurant que tous les utilisateurs ont un plan cohérent
  3. Mettant à jour les fonctions pour utiliser uniquement les nouveaux champs
  4. Ajoutant des contraintes pour maintenir la cohérence des données
*/

-- 1. S'assurer que tous les utilisateurs ont un plan valide
UPDATE users 
SET 
  current_plan = CASE 
    WHEN current_plan IS NULL OR current_plan = '' THEN 'free'
    WHEN current_plan NOT IN ('free', 'trial', 'pro', 'excellence') THEN 'free'
    ELSE current_plan
  END,
  subscription_status = CASE 
    WHEN subscription_status IS NULL OR subscription_status = '' THEN 'active'
    WHEN subscription_status NOT IN ('active', 'inactive', 'cancelled', 'expired') THEN 'active'
    ELSE subscription_status
  END
WHERE current_plan IS NULL OR current_plan = '' OR subscription_status IS NULL OR subscription_status = '';

-- 2. S'assurer que tous les utilisateurs ont un abonnement dans user_subscriptions
INSERT INTO user_subscriptions (user_id, plan_name, status, price_monthly, price_yearly)
SELECT 
  u.id,
  u.current_plan,
  u.subscription_status,
  CASE 
    WHEN u.current_plan = 'pro' THEN 29.99
    WHEN u.current_plan = 'excellence' THEN 99.99
    ELSE 0
  END,
  CASE 
    WHEN u.current_plan = 'pro' THEN 299.99
    WHEN u.current_plan = 'excellence' THEN 999.99
    ELSE 0
  END
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM user_subscriptions);

-- 3. Mettre à jour la fonction sync_user_pro_status pour qu'elle ne dépende plus de is_pro
CREATE OR REPLACE FUNCTION sync_user_pro_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Cette fonction ne fait plus rien car is_pro sera supprimé
  -- Elle est gardée temporairement pour éviter les erreurs
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Supprimer le trigger qui synchronise is_pro
DROP TRIGGER IF EXISTS sync_user_pro_status_trigger ON users;

-- 5. Supprimer le champ is_pro de la table users
ALTER TABLE users DROP COLUMN IF EXISTS is_pro;

-- 6. Ajouter des contraintes pour s'assurer de la cohérence des données
ALTER TABLE users 
ADD CONSTRAINT users_current_plan_check 
CHECK (current_plan IN ('free', 'trial', 'pro', 'excellence'));

ALTER TABLE users 
ADD CONSTRAINT users_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- 7. Créer une fonction pour obtenir le plan actif basé uniquement sur user_subscriptions
CREATE OR REPLACE FUNCTION get_user_active_subscription_plan(target_user_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  active_plan VARCHAR(50);
BEGIN
  -- Vérifier d'abord dans user_subscriptions
  SELECT plan_name INTO active_plan
  FROM user_subscriptions
  WHERE user_id = target_user_id 
    AND status = 'active' 
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Si pas d'abonnement actif, retourner le plan de base
  IF active_plan IS NULL THEN
    SELECT current_plan INTO active_plan
    FROM users
    WHERE id = target_user_id;
  END IF;
  
  RETURN COALESCE(active_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Mettre à jour la fonction get_user_active_plan pour utiliser la nouvelle logique
CREATE OR REPLACE FUNCTION get_user_active_plan(target_user_id UUID)
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN get_user_active_subscription_plan(target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Créer une fonction pour synchroniser current_plan avec user_subscriptions
CREATE OR REPLACE FUNCTION sync_user_current_plan()
RETURNS TRIGGER AS $$
DECLARE
  active_plan VARCHAR(50);
BEGIN
  -- Obtenir le plan actif depuis user_subscriptions
  SELECT get_user_active_subscription_plan(NEW.user_id) INTO active_plan;
  
  -- Mettre à jour current_plan dans users si nécessaire
  IF active_plan IS NOT NULL THEN
    UPDATE users 
    SET current_plan = active_plan
    WHERE id = NEW.user_id AND current_plan != active_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Créer un trigger pour synchroniser current_plan quand user_subscriptions change
CREATE TRIGGER sync_current_plan_on_subscription_change
  AFTER INSERT OR UPDATE OR DELETE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_current_plan();

-- 11. Fonction pour vérifier les permissions d'accès aux pages
CREATE OR REPLACE FUNCTION can_access_page(target_user_id UUID, page_type VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
  user_plan VARCHAR(50);
  user_role TEXT;
BEGIN
  -- Récupérer le rôle et le plan
  SELECT role, get_user_active_plan(target_user_id) INTO user_role, user_plan
  FROM users
  WHERE id = target_user_id;
  
  -- Logique d'accès aux pages
  CASE page_type
    WHEN 'admin' THEN 
      RETURN (user_role = 'admin');
    WHEN 'pro_pages' THEN 
      RETURN user_plan IN ('pro', 'excellence');
    WHEN 'excellence_pages' THEN 
      RETURN user_plan = 'excellence';
    WHEN 'trial_pages' THEN 
      RETURN user_plan IN ('trial', 'pro', 'excellence');
    ELSE 
      RETURN TRUE; -- Pages gratuites accessibles à tous
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Mettre à jour la fonction get_user_permissions pour être plus précise
CREATE OR REPLACE FUNCTION get_user_permissions(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_role TEXT;
  user_plan VARCHAR(50);
  permissions JSON;
BEGIN
  -- Récupérer le rôle et le plan
  SELECT role, get_user_active_plan(target_user_id) INTO user_role, user_plan
  FROM users
  WHERE id = target_user_id;
  
  -- Définir les permissions basées sur le rôle et le plan
  permissions := json_build_object(
    'role', COALESCE(user_role, 'user'),
    'plan', COALESCE(user_plan, 'free'),
    'can_access_admin', (user_role = 'admin'),
    'can_access_pro_pages', user_plan IN ('pro', 'excellence'),
    'can_access_excellence_pages', user_plan = 'excellence'),
    'can_access_trial_pages', user_plan IN ('trial', 'pro', 'excellence'),
    'can_create_invoices', user_plan IN ('pro', 'excellence'),
    'can_create_templates', user_plan IN ('trial', 'pro', 'excellence'),
    'can_export_data', user_plan IN ('pro', 'excellence'),
    'can_manage_clients', TRUE, -- Tous les utilisateurs peuvent gérer leurs clients
    'can_manage_tasks', TRUE, -- Tous les utilisateurs peuvent gérer leurs tâches
    'max_invoices_per_month', CASE user_plan 
      WHEN 'free' THEN 3
      WHEN 'trial' THEN 10
      WHEN 'pro' THEN 100
      WHEN 'excellence' THEN -1 -- Illimité
      ELSE 3
    END,
    'max_clients', CASE user_plan 
      WHEN 'free' THEN 5
      WHEN 'trial' THEN 20
      WHEN 'pro' THEN 100
      WHEN 'excellence' THEN -1 -- Illimité
      ELSE 5
    END
  );
  
  RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Donner les permissions d'exécution pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION get_user_active_subscription_plan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_page(UUID, VARCHAR) TO authenticated;

-- 14. Commentaires pour la documentation
COMMENT ON FUNCTION get_user_active_subscription_plan(UUID) IS 'Retourne le plan actif basé uniquement sur user_subscriptions';
COMMENT ON FUNCTION can_access_page(UUID, VARCHAR) IS 'Vérifie si un utilisateur peut accéder à un type de page spécifique';
COMMENT ON FUNCTION sync_user_current_plan() IS 'Synchronise current_plan avec les changements dans user_subscriptions';

-- 15. Nettoyer les fonctions obsolètes qui utilisaient is_pro
DROP FUNCTION IF EXISTS activate_pro_trial(UUID);
DROP FUNCTION IF EXISTS check_expired_trials();

-- 16. Créer une nouvelle fonction pour activer l'essai Pro
CREATE OR REPLACE FUNCTION activate_pro_trial(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_subscription RECORD;
  trial_end_date TIMESTAMPTZ;
  result JSON;
BEGIN
  -- Vérifier si l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Obtenir l'abonnement existant
  SELECT * INTO existing_subscription
  FROM user_subscriptions
  WHERE user_id = target_user_id AND status = 'active';

  -- Si pas d'abonnement, en créer un gratuit
  IF existing_subscription IS NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_name, status, price_monthly, price_yearly)
    VALUES (target_user_id, 'free', 'active', 0, 0);
    
    SELECT * INTO existing_subscription
    FROM user_subscriptions
    WHERE user_id = target_user_id AND status = 'active';
  END IF;

  -- Vérifier si l'utilisateur a déjà utilisé son essai
  IF existing_subscription.plan_name = 'trial' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Trial already used',
      'message', 'Vous avez déjà utilisé votre essai gratuit'
    );
  END IF;

  -- Vérifier si l'utilisateur est déjà Pro ou Excellence
  IF existing_subscription.plan_name IN ('pro', 'excellence') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Already pro subscriber',
      'message', 'Vous êtes déjà abonné à un plan payant'
    );
  END IF;

  -- Calculer la date de fin d'essai (7 jours)
  trial_end_date := NOW() + INTERVAL '7 days';

  -- Désactiver l'abonnement actuel
  UPDATE user_subscriptions
  SET status = 'inactive', updated_at = NOW()
  WHERE user_id = target_user_id AND status = 'active';

  -- Créer l'essai Pro
  INSERT INTO user_subscriptions (
    user_id, plan_name, status, start_date, end_date,
    price_monthly, price_yearly
  ) VALUES (
    target_user_id, 'trial', 'active', NOW(), trial_end_date,
    0, 0
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Essai Pro activé avec succès',
    'trial_end', trial_end_date,
    'days_remaining', 7
  );
END;
$$;

-- 17. Créer une nouvelle fonction pour vérifier les essais expirés
CREATE OR REPLACE FUNCTION check_expired_trials()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER := 0;
  expired_user RECORD;
BEGIN
  -- Trouver tous les essais expirés
  FOR expired_user IN
    SELECT user_id, end_date
    FROM user_subscriptions
    WHERE plan_name = 'trial'
      AND status = 'active'
      AND end_date < NOW()
  LOOP
    -- Rétrograder vers le plan gratuit
    UPDATE user_subscriptions
    SET status = 'inactive', updated_at = NOW()
    WHERE user_id = expired_user.user_id AND status = 'active';

    -- Créer un nouvel abonnement gratuit
    INSERT INTO user_subscriptions (user_id, plan_name, status, price_monthly, price_yearly)
    VALUES (expired_user.user_id, 'free', 'active', 0, 0);

    expired_count := expired_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'expired_count', expired_count,
    'message', 'Vérification des essais expirés terminée'
  );
END;
$$;

-- 18. Donner les permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION activate_pro_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_expired_trials() TO authenticated;

-- 19. Commentaires finaux
COMMENT ON FUNCTION activate_pro_trial(UUID) IS 'Active un essai Pro de 7 jours pour un utilisateur';
COMMENT ON FUNCTION check_expired_trials() IS 'Vérifie et rétrograde les essais expirés vers le plan gratuit';
