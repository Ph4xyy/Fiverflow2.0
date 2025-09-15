/*
  # Fonctions pour la gestion de l'essai gratuit Pro

  1. Nouvelles Fonctions
    - `activate_pro_trial(user_id)` - Active l'essai Pro de 7 jours
    - `check_expired_trials()` - Vérifie et rétrograde les essais expirés
    - `get_trial_status(user_id)` - Obtient le statut d'essai d'un utilisateur

  2. Automatisation
    - Fonction cron pour vérifier les essais expirés toutes les heures
    - Trigger pour vérifier à chaque connexion

  3. Sécurité
    - Vérifications pour éviter les abus d'essai
    - Logs des changements d'abonnement
*/

-- Fonction pour activer l'essai Pro de 7 jours
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
  FROM subscriptions
  WHERE user_id = target_user_id;

  -- Si pas d'abonnement, en créer un
  IF existing_subscription IS NULL THEN
    INSERT INTO subscriptions (user_id, plan)
    VALUES (target_user_id, 'free');
    
    SELECT * INTO existing_subscription
    FROM subscriptions
    WHERE user_id = target_user_id;
  END IF;

  -- Vérifier si l'utilisateur a déjà utilisé son essai
  IF existing_subscription.trial_end IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Trial already used',
      'message', 'Vous avez déjà utilisé votre essai gratuit'
    );
  END IF;

  -- Vérifier si l'utilisateur est déjà Pro
  IF existing_subscription.plan = 'pro' AND existing_subscription.is_trial_active = false THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Already pro subscriber',
      'message', 'Vous êtes déjà abonné au plan Pro'
    );
  END IF;

  -- Calculer la date de fin d'essai (7 jours)
  trial_end_date := NOW() + INTERVAL '7 days';

  -- Activer l'essai Pro
  UPDATE subscriptions
  SET 
    plan = 'pro',
    trial_end = trial_end_date,
    is_trial_active = true,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Mettre à jour le statut Pro de l'utilisateur
  UPDATE users
  SET is_pro = true
  WHERE id = target_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Essai Pro activé avec succès',
    'trial_end', trial_end_date,
    'days_remaining', 7
  );
END;
$$;

-- Fonction pour vérifier et rétrograder les essais expirés
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
    SELECT user_id, trial_end
    FROM subscriptions
    WHERE is_trial_active = true
    AND trial_end < NOW()
  LOOP
    -- Rétrograder vers le plan gratuit
    UPDATE subscriptions
    SET 
      plan = 'free',
      is_trial_active = false,
      updated_at = NOW()
    WHERE user_id = expired_user.user_id;

    -- Mettre à jour le statut Pro de l'utilisateur
    UPDATE users
    SET is_pro = false
    WHERE id = expired_user.user_id;

    -- Créer une notification pour informer l'utilisateur
    INSERT INTO notifications (user_id, type, content, is_read)
    VALUES (
      expired_user.user_id,
      'trial_expired',
      'Votre essai gratuit Pro a expiré. Vous avez été rétrogradé vers le plan gratuit.',
      false
    );

    expired_count := expired_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'expired_trials', expired_count,
    'message', format('Processed %s expired trials', expired_count)
  );
END;
$$;

-- Fonction pour obtenir le statut d'essai d'un utilisateur
CREATE OR REPLACE FUNCTION get_trial_status(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_data RECORD;
  days_remaining INTEGER;
  hours_remaining INTEGER;
  result JSON;
BEGIN
  -- Obtenir les données d'abonnement
  SELECT * INTO subscription_data
  FROM subscriptions
  WHERE user_id = target_user_id;

  -- Si pas d'abonnement, retourner le statut gratuit
  IF subscription_data IS NULL THEN
    RETURN json_build_object(
      'plan', 'free',
      'is_trial_active', false,
      'trial_end', null,
      'days_remaining', null,
      'trial_available', true
    );
  END IF;

  -- Calculer les jours restants si essai actif
  IF subscription_data.is_trial_active AND subscription_data.trial_end IS NOT NULL THEN
    days_remaining := EXTRACT(DAY FROM (subscription_data.trial_end - NOW()));
    hours_remaining := EXTRACT(HOUR FROM (subscription_data.trial_end - NOW()));
    
    -- Si moins d'un jour, afficher en heures
    IF days_remaining <= 0 THEN
      days_remaining := 0;
    END IF;
  END IF;

  RETURN json_build_object(
    'plan', subscription_data.plan,
    'is_trial_active', subscription_data.is_trial_active,
    'trial_end', subscription_data.trial_end,
    'days_remaining', days_remaining,
    'hours_remaining', hours_remaining,
    'trial_available', (subscription_data.trial_end IS NULL)
  );
END;
$$;

-- Programmer la vérification des essais expirés toutes les heures
SELECT cron.schedule(
  'check-expired-trials',
  '0 * * * *', -- Toutes les heures à la minute 0
  'SELECT check_expired_trials();'
);

-- Fonction trigger pour vérifier les essais à chaque connexion
CREATE OR REPLACE FUNCTION check_user_trial_on_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'essai de cet utilisateur a expiré
  PERFORM check_expired_trials();
  RETURN NEW;
END;
$$;

-- Note: Le trigger sur auth.users n'est pas possible directement
-- La vérification se fera côté application lors de la connexion