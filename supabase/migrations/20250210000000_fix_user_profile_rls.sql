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

-- =============================================
-- 2. CREATE USER_PROFILES POLICIES
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

-- Policy 4: Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- =============================================
-- 3. CREATE REFERRAL_COMMISSIONS POLICIES
-- =============================================

CREATE POLICY "Users can view their own referral commissions" ON referral_commissions
  FOR SELECT USING (
    referrer_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR
    referred_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert referral commissions" ON referral_commissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referral commissions" ON referral_commissions
  FOR UPDATE USING (true);

-- =============================================
-- 4. FIX HANDLE_NEW_USER FUNCTION
-- =============================================

-- Make sure handle_new_user doesn't specify id if it has DEFAULT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Générer un username unique
  generated_username := public.generate_unique_username(
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    )
  );
  
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. FIX REFERRAL CODE TRIGGER FUNCTION
-- =============================================

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
-- 6. VERIFY POLICIES AND PERMISSIONS
-- =============================================

-- Show all policies for user_profiles
SELECT 
  'User profile RLS policies configured' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

SELECT 'Migration completed successfully!' as status;
