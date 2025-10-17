/*
  # Username Uniqueness and Referral Links Enhancement

  1. Username Uniqueness
    - Add unique constraint on username field
    - Add validation function for username availability
    - Update registration to check username availability

  2. Referral Links Enhancement
    - Change referral links to use username instead of referral_code
    - Update referral link format to /app/username
    - Add function to get user by username for referral processing

  3. Security Improvements
    - Username validation (alphanumeric, length constraints)
    - Prevent reserved usernames
    - Case-insensitive username matching
*/

-- First, let's ensure we have a username field and it's properly indexed
-- Add username field if it doesn't exist (it should exist as 'name' but let's be sure)
DO $$
BEGIN
  -- Check if username column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    -- Add username column based on existing name field
    ALTER TABLE users ADD COLUMN username text;
    
    -- Populate username from name field for existing users
    UPDATE users 
    SET username = lower(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g'))
    WHERE username IS NULL AND name IS NOT NULL;
    
    -- For users without names, generate username from email
    UPDATE users 
    SET username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
    WHERE username IS NULL;
    
    -- For any remaining users, generate username from ID
    UPDATE users 
    SET username = 'user' || substring(id::text from 1 for 8)
    WHERE username IS NULL;
  END IF;
END $$;

-- Add unique constraint on username (case-insensitive)
ALTER TABLE users 
ADD CONSTRAINT users_username_unique 
UNIQUE (lower(username));

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(lower(username));

-- Add constraint to ensure username is not empty
ALTER TABLE users 
ADD CONSTRAINT users_username_not_empty 
CHECK (username IS NOT NULL AND username != '' AND length(username) >= 3);

-- Function to validate username availability
CREATE OR REPLACE FUNCTION is_username_available(username_to_check text)
RETURNS boolean AS $$
DECLARE
  reserved_usernames text[] := ARRAY[
    'admin', 'administrator', 'root', 'user', 'users', 'api', 'www', 'mail', 
    'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login', 
    'register', 'signup', 'signin', 'dashboard', 'profile', 'settings',
    'account', 'billing', 'payment', 'pricing', 'features', 'blog', 'news',
    'fiverflow', 'fiver', 'flow', 'app', 'app', 'home', 'index', 'main'
  ];
BEGIN
  -- Check if username is empty or too short
  IF username_to_check IS NULL OR username_to_check = '' OR length(username_to_check) < 3 THEN
    RETURN false;
  END IF;
  
  -- Check if username is too long
  IF length(username_to_check) > 20 THEN
    RETURN false;
  END IF;
  
  -- Check if username contains only alphanumeric characters
  IF NOT username_to_check ~ '^[a-zA-Z0-9]+$' THEN
    RETURN false;
  END IF;
  
  -- Check if username is reserved
  IF lower(username_to_check) = ANY(reserved_usernames) THEN
    RETURN false;
  END IF;
  
  -- Check if username already exists (case-insensitive)
  IF EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(username_to_check)) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by username for referral processing
CREATE OR REPLACE FUNCTION get_user_by_username(username_to_find text)
RETURNS TABLE(
  id uuid,
  username text,
  name text,
  email text,
  referral_code text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.name,
    u.email,
    u.referral_code
  FROM users u
  WHERE lower(u.username) = lower(username_to_find);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create referral relationship using username
CREATE OR REPLACE FUNCTION create_referral_by_username(
  referrer_username text,
  referred_user_id uuid
)
RETURNS json AS $$
DECLARE
  referrer_id uuid;
  existing_referral boolean;
  result json;
BEGIN
  -- Get referrer by username
  SELECT id INTO referrer_id
  FROM users 
  WHERE lower(username) = lower(referrer_username);
  
  IF referrer_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Prevent self-referral
  IF referrer_id = referred_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot refer yourself'
    );
  END IF;
  
  -- Check if user already has a referrer
  SELECT EXISTS(
    SELECT 1 FROM referrals WHERE referred_id = referred_user_id
  ) INTO existing_referral;
  
  IF existing_referral THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already has a referrer'
    );
  END IF;
  
  -- Create the referral relationship
  INSERT INTO referrals (referrer_id, referred_id, subscription_status)
  VALUES (referrer_id, referred_user_id, 'trial');
  
  -- Update user's referrer_id for backward compatibility with webhook
  UPDATE users 
  SET referrer_id = referrer_id
  WHERE id = referred_user_id;
  
  RETURN json_build_object(
    'success', true,
    'referrer_id', referrer_id,
    'referrer_username', referrer_username,
    'message', 'Referral relationship created successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to create referral relationship: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to also generate username if not provided
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate referral_code if null or empty
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_secure_referral_code();
  END IF;
  
  -- Generate username if not provided
  IF NEW.username IS NULL OR NEW.username = '' THEN
    -- Try to generate from name first
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
      NEW.username := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]', '', 'g'));
      
      -- Ensure username is at least 3 characters
      IF length(NEW.username) < 3 THEN
        NEW.username := NEW.username || substring(NEW.id::text from 1 for 3);
      END IF;
      
      -- Ensure username is unique
      WHILE EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(NEW.username)) LOOP
        NEW.username := NEW.username || substring(NEW.id::text from 1 for 4);
      END LOOP;
    ELSE
      -- Generate from email
      NEW.username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
      
      -- Ensure username is at least 3 characters
      IF length(NEW.username) < 3 THEN
        NEW.username := 'user' || substring(NEW.id::text from 1 for 6);
      END IF;
      
      -- Ensure username is unique
      WHILE EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(NEW.username)) LOOP
        NEW.username := NEW.username || substring(NEW.id::text from 1 for 4);
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_username_available(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_referral_by_username(text, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN users.username IS 'Unique username for user identification and referral links';
COMMENT ON FUNCTION is_username_available(text) IS 'Validates if a username is available for registration';
COMMENT ON FUNCTION get_user_by_username(text) IS 'Retrieves user information by username for referral processing';
COMMENT ON FUNCTION create_referral_by_username(text, uuid) IS 'Creates referral relationship using username instead of referral code';
