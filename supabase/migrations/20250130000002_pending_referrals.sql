/*
  # Pending Referrals Table
  
  Cette table stocke les referrals créés depuis la landing page externe
  avant que l'utilisateur ne s'inscrive dans l'app.
  
  Quand l'utilisateur s'inscrit, le système vérifie s'il y a un referral en attente
  et l'active automatiquement.
*/

-- Create pending_referrals table
CREATE TABLE IF NOT EXISTS pending_referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_email text NOT NULL,
  referred_name text,
  source text DEFAULT 'landing_page',
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  activated_at timestamp with time zone,
  activated_user_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_referrals_email ON pending_referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_pending_referrals_referrer ON pending_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_pending_referrals_expires ON pending_referrals(expires_at);

-- Add RLS policies
ALTER TABLE pending_referrals ENABLE ROW LEVEL SECURITY;

-- System can insert pending referrals (from landing page)
CREATE POLICY "System can insert pending referrals"
  ON pending_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can read pending referrals
CREATE POLICY "System can read pending referrals"
  ON pending_referrals
  FOR SELECT
  TO authenticated
  USING (true);

-- System can update pending referrals
CREATE POLICY "System can update pending referrals"
  ON pending_referrals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to activate pending referral when user signs up
CREATE OR REPLACE FUNCTION activate_pending_referral(user_email text, user_id uuid)
RETURNS json AS $$
DECLARE
  pending_referral_record RECORD;
  referral_id uuid;
BEGIN
  -- Find pending referral for this email
  SELECT * INTO pending_referral_record
  FROM pending_referrals
  WHERE referred_email = user_email
    AND activated_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No pending referral found'
    );
  END IF;
  
  -- Check if user already has a referrer
  IF EXISTS (
    SELECT 1 FROM referrals WHERE referred_id = user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User already has a referrer'
    );
  END IF;
  
  -- Create the referral relationship
  INSERT INTO referrals (referrer_id, referred_id, subscription_status, source)
  VALUES (
    pending_referral_record.referrer_id,
    user_id,
    'trial',
    pending_referral_record.source
  )
  RETURNING id INTO referral_id;
  
  -- Update pending referral as activated
  UPDATE pending_referrals
  SET activated_at = now(),
      activated_user_id = user_id
  WHERE id = pending_referral_record.id;
  
  -- Update user's referrer_id for backward compatibility
  UPDATE users
  SET referrer_id = pending_referral_record.referrer_id
  WHERE id = user_id;
  
  RETURN json_build_object(
    'success', true,
    'referral_id', referral_id,
    'referrer_id', pending_referral_record.referrer_id,
    'message', 'Pending referral activated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to activate pending referral: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION activate_pending_referral(text, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE pending_referrals IS 'Stores referrals created from external landing page before user registration';
COMMENT ON FUNCTION activate_pending_referral(text, uuid) IS 'Activates pending referral when user signs up';
