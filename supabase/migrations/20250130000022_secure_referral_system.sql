-- Migration: Sécurisation du système de parrainage
-- Date: 2025-01-30
-- Description: Verrouiller referred_by et sécuriser le système de parrainage

-- =============================================
-- 1. SÉCURISATION DE LA COLONNE referred_by
-- =============================================

-- Empêcher la modification manuelle de referred_by après inscription
-- Seuls les admins et le système peuvent modifier cette colonne

-- Politique RLS pour empêcher la modification de referred_by
DROP POLICY IF EXISTS "Users can update referred_by" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Politique restrictive : les utilisateurs ne peuvent PAS modifier referred_by
CREATE POLICY "Users can update profile except referred_by" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND referred_by IS NOT NULL -- Si referred_by est déjà défini, on ne peut plus le modifier
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND referred_by IS NOT NULL -- Si referred_by est déjà défini, on ne peut plus le modifier
  );

-- Politique pour permettre la définition initiale de referred_by (seulement si NULL)
CREATE POLICY "Users can set referred_by if null" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND referred_by IS NULL -- Seulement si referred_by est NULL
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND referred_by IS NULL -- Seulement si referred_by est NULL
  );

-- Politique pour les admins : peuvent tout modifier
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================
-- 2. FONCTION SÉCURISÉE POUR DÉFINIR LE PARRAIN
-- =============================================

-- Fonction sécurisée pour définir le parrain (seulement lors de l'inscription)
CREATE OR REPLACE FUNCTION secure_set_referrer(
  p_user_id UUID,
  p_referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_id UUID;
  current_referred_by UUID;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Vérifier que referred_by n'est pas déjà défini
  SELECT referred_by INTO current_referred_by
  FROM user_profiles 
  WHERE user_id = p_user_id;

  IF current_referred_by IS NOT NULL THEN
    RAISE EXCEPTION 'User already has a referrer';
  END IF;

  -- Trouver le parrain par son code
  SELECT id INTO referrer_id
  FROM user_profiles 
  WHERE referral_code = p_referral_code;

  IF referrer_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  -- Empêcher l'auto-parrainage
  IF referrer_id = (SELECT id FROM user_profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;

  -- Définir le parrain
  UPDATE user_profiles 
  SET referred_by = referrer_id
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. TRIGGER POUR GÉNÉRER AUTOMATIQUEMENT LES CODES
-- =============================================

-- S'assurer que tous les nouveaux utilisateurs ont un code de parrainage
CREATE OR REPLACE FUNCTION ensure_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer un code si pas déjà défini
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour s'assurer qu'un code est généré
DROP TRIGGER IF EXISTS ensure_referral_code_trigger ON user_profiles;
CREATE TRIGGER ensure_referral_code_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_referral_code();

-- =============================================
-- 4. FONCTION POUR VALIDER UN CODE DE PARRAINAGE
-- =============================================

CREATE OR REPLACE FUNCTION validate_referral_code(p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que le code existe et est valide
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE referral_code = p_code 
    AND referral_code IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. VUE SÉCURISÉE POUR LES STATISTIQUES DE PARRAINAGE
-- =============================================

-- Vue pour les statistiques de parrainage (lecture seule)
CREATE OR REPLACE VIEW secure_referral_stats AS
SELECT 
  p.id as user_id,
  p.referral_code,
  p.referral_earnings,
  p.total_referrals,
  COUNT(rc.id) as total_commissions,
  COALESCE(SUM(CASE WHEN rc.status = 'paid' THEN rc.amount ELSE 0 END), 0) as paid_commissions,
  COALESCE(SUM(CASE WHEN rc.status = 'pending' THEN rc.amount ELSE 0 END), 0) as pending_commissions,
  COALESCE(SUM(CASE WHEN rc.status = 'cancelled' THEN rc.amount ELSE 0 END), 0) as cancelled_commissions
FROM user_profiles p
LEFT JOIN referral_commissions rc ON p.id = rc.referrer_id
WHERE p.user_id = auth.uid() -- Seulement les données de l'utilisateur connecté
GROUP BY p.id, p.referral_code, p.referral_earnings, p.total_referrals;

-- =============================================
-- 6. PERMISSIONS ET SÉCURITÉ
-- =============================================

-- Révoker les permissions de modification directe sur referred_by
REVOKE UPDATE ON user_profiles FROM authenticated;

-- Réattribuer les permissions avec les nouvelles politiques
GRANT UPDATE ON user_profiles TO authenticated;

-- Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION secure_set_referrer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_referral_code(TEXT) TO authenticated;

-- =============================================
-- 7. VÉRIFICATION ET TESTS
-- =============================================

-- Vérifier que les politiques sont en place
SELECT 
  'Sécurisation du système de parrainage terminée!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Afficher les politiques créées
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;





