-- Migration: Fix user profile RLS policies to allow new user creation
-- Date: 2025-02-10
-- Description: Fix RLS policies to prevent 500 errors on user registration

-- =============================================
-- 1. DROP ALL CONFLICTING POLICIES
-- =============================================

-- Drop conflicting user_profiles policies
DROP POLICY IF EXISTS "Users can update profile except referred_by" ON user_profiles;
DROP POLICY IF EXISTS "Users can set referred_by if null" ON user_profiles;
DROP POLICY IF EXISTS "Simple user access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Drop conflicting referral_commissions policies
DROP POLICY IF EXISTS "System can update referral commissions" ON referral_commissions;
DROP POLICY IF EXISTS "Users can view referral commissions data" ON referral_commissions;
DROP POLICY IF EXISTS "Users can view their own referral commissions" ON referral_commissions;
DROP POLICY IF EXISTS "System can insert referral commissions" ON referral_commissions;

-- =============================================
-- 2. CREATE REFERRAL CODE VALIDATION FUNCTION
-- =============================================

-- Function to check user admin status (needed for admin policy)
CREATE OR REPLACE FUNCTION get_user_admin_status(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les privilèges du créateur
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur est admin
  SELECT is_admin INTO admin_status
  FROM user_profiles
  WHERE user_id = user_uuid;
  
  -- Retourner false si aucun profil trouvé
  RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- Function to get referrer info by code (returns only public info)
CREATE OR REPLACE FUNCTION get_referrer_info_by_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.full_name,
    up.email
  FROM user_profiles up
  WHERE up.referral_code = p_code
  AND up.referral_code IS NOT NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (and anonymous for signup)
GRANT EXECUTE ON FUNCTION get_referrer_info_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referrer_info_by_code(TEXT) TO anon;

-- Alternative: Function to get just the referrer ID
CREATE OR REPLACE FUNCTION get_referrer_id_by_code(p_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  SELECT id INTO v_referrer_id
  FROM user_profiles
  WHERE referral_code = p_code
  AND referral_code IS NOT NULL
  LIMIT 1;
  
  RETURN v_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION get_referrer_id_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referrer_id_by_code(TEXT) TO anon;

-- Function to check if user owns a referral commission
CREATE OR REPLACE FUNCTION user_owns_referral_commission(commission_referrer_id UUID, commission_referred_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_profile_id UUID;
BEGIN
  -- Get current user's profile ID
  SELECT id INTO current_user_profile_id
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Check if current user is either referrer or referred
  RETURN current_user_profile_id IS NOT NULL AND 
         (commission_referrer_id = current_user_profile_id OR 
          commission_referred_id = current_user_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION user_owns_referral_commission(UUID, UUID) TO authenticated;

-- =============================================
-- 3. CREATE USER_PROFILES POLICIES
-- =============================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile (CRITICAL for signup)
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can manage all profiles (using RPC function to avoid recursion)
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (get_user_admin_status(auth.uid()));

-- =============================================
-- 4. CREATE REFERRAL_COMMISSIONS POLICIES
-- =============================================

CREATE POLICY "Users can view their own referral commissions" ON referral_commissions
  FOR SELECT USING (user_owns_referral_commission(referrer_id, referred_id));

CREATE POLICY "System can insert referral commissions" ON referral_commissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referral commissions" ON referral_commissions
  FOR UPDATE USING (true);

-- =============================================
-- 5. FIX HANDLE_NEW_USER FUNCTION
-- =============================================

-- Make sure handle_new_user doesn't specify id if it has DEFAULT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN;
BEGIN
  -- Obtenir le username de base
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Nettoyer le username de base (enlever caractères spéciaux, limiter la longueur)
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  base_username := left(base_username, 15); -- Limiter à 15 caractères
  
  -- Si le username est vide après nettoyage, utiliser "user"
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Vérifier si le username existe déjà (avec bypass RLS grâce à SECURITY DEFINER)
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles 
      WHERE username = final_username
    ) INTO username_exists;
    
    -- Si le username n'existe pas, on peut l'utiliser
    IF NOT username_exists THEN
      EXIT;
    END IF;
    
    -- Sinon, ajouter un numéro
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
    
    -- Sécurité : éviter les boucles infinies
    IF counter > 999 THEN
      final_username := base_username || extract(epoch from now())::bigint::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  generated_username := final_username;
  
  -- Insérer dans user_profiles avec le username généré
  -- NOTE: Don't specify id - let it use gen_random_uuid() default
  INSERT INTO public.user_profiles (
    email, 
    username, 
    subscription, 
    role, 
    created_at,
    user_id,
    full_name
  )
  VALUES (
    NEW.email,
    generated_username,
    'Lunch',
    'member',
    NOW(),
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer la création de l'utilisateur auth
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Retourner NEW quand même pour ne pas bloquer l'inscription
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. FIX REFERRAL CODE FUNCTIONS
-- =============================================

-- Make generate_referral_code SECURITY DEFINER to bypass RLS when checking existing codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Générer un code au format "FXR-XXXX" où XXXX est un nombre aléatoire
        new_code := 'FXR-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = new_code) INTO code_exists;
        
        -- Si le code n'existe pas, on peut l'utiliser
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix generate_user_referral_code if it exists (from migration 20250130000004)
CREATE OR REPLACE FUNCTION generate_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Générer un code de parrainage si l'utilisateur n'en a pas
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make ensure_referral_code SECURITY DEFINER to bypass RLS when checking existing codes
CREATE OR REPLACE FUNCTION ensure_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer un code si pas déjà défini
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. ENSURE TRIGGER EXISTS
-- =============================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger pour appeler handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 8. VERIFY POLICIES AND PERMISSIONS
-- =============================================

-- Show all policies for user_profiles
SELECT 
  'User profile RLS policies configured' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- Grant execute on handle_new_user to service role (needed for trigger)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

SELECT 'Migration completed successfully!' as status;
