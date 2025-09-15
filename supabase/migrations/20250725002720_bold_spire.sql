/*
  # Payout System for Referral Commissions

  1. New Tables
    - `user_payout_details`
      - `user_id` (uuid, foreign key to users)
      - `stripe_account_id` (text, Stripe Connect account ID)
      - `account_status` (text, verification status)
      - `payout_enabled` (boolean, whether user can receive payouts)
      - `bank_account_last4` (text, last 4 digits for display)
      - `bank_account_country` (text, country code)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payout_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_requested` (numeric, amount user wants to withdraw)
      - `amount_fee` (numeric, transaction fee)
      - `amount_net` (numeric, net amount after fees)
      - `status` (enum: pending, processing, completed, failed, cancelled)
      - `stripe_transfer_id` (text, Stripe transfer ID)
      - `requested_at` (timestamp)
      - `processed_at` (timestamp)
      - `failure_reason` (text, reason if failed)
      - `notes` (text, admin notes)

  2. Updates to Existing Tables
    - `referral_logs`: Add `payout_request_id` and `is_paid_out` columns

  3. Security
    - Enable RLS on all new tables
    - Add policies for users to manage their own payout data
    - Add admin policies for oversight

  4. Functions
    - `calculate_available_earnings`: Calculate user's available earnings for payout
    - `validate_payout_request`: Validate payout request before processing
*/

-- Create enum for payout request status
CREATE TYPE payout_status AS ENUM (
  'pending',
  'processing', 
  'completed',
  'failed',
  'cancelled'
);

-- Create user_payout_details table
CREATE TABLE IF NOT EXISTS user_payout_details (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id text UNIQUE,
  account_status text DEFAULT 'unverified',
  payout_enabled boolean DEFAULT false,
  bank_account_last4 text,
  bank_account_country text,
  minimum_payout_amount numeric(10,2) DEFAULT 20.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_requested numeric(10,2) NOT NULL CHECK (amount_requested > 0),
  amount_fee numeric(10,2) DEFAULT 0.00,
  amount_net numeric(10,2) NOT NULL CHECK (amount_net > 0),
  status payout_status DEFAULT 'pending',
  stripe_transfer_id text,
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  failure_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to referral_logs for payout tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_logs' AND column_name = 'payout_request_id'
  ) THEN
    ALTER TABLE referral_logs ADD COLUMN payout_request_id uuid REFERENCES payout_requests(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_logs' AND column_name = 'is_paid_out'
  ) THEN
    ALTER TABLE referral_logs ADD COLUMN is_paid_out boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE user_payout_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Policies for user_payout_details
CREATE POLICY "Users can view own payout details"
  ON user_payout_details
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payout details"
  ON user_payout_details
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payout details"
  ON user_payout_details
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for payout_requests
CREATE POLICY "Users can view own payout requests"
  ON payout_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payout requests"
  ON payout_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payout requests"
  ON payout_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin policies (for users with role = 'admin')
CREATE POLICY "Admins can view all payout details"
  ON user_payout_details
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all payout requests"
  ON payout_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate available earnings for payout
CREATE OR REPLACE FUNCTION calculate_available_earnings(target_user_id uuid)
RETURNS numeric AS $$
DECLARE
  total_earnings numeric := 0;
  paid_out_earnings numeric := 0;
  available_earnings numeric := 0;
BEGIN
  -- Calculate total earnings from referral_logs
  SELECT COALESCE(SUM(amount_earned), 0)
  INTO total_earnings
  FROM referral_logs
  WHERE referrer_id = target_user_id;
  
  -- Calculate already paid out earnings
  SELECT COALESCE(SUM(amount_earned), 0)
  INTO paid_out_earnings
  FROM referral_logs
  WHERE referrer_id = target_user_id
    AND is_paid_out = true;
  
  -- Calculate available earnings
  available_earnings := total_earnings - paid_out_earnings;
  
  RETURN GREATEST(available_earnings, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate payout request
CREATE OR REPLACE FUNCTION validate_payout_request(
  target_user_id uuid,
  requested_amount numeric
)
RETURNS json AS $$
DECLARE
  available_earnings numeric;
  minimum_payout numeric;
  payout_enabled boolean;
  pending_requests_count integer;
BEGIN
  -- Get available earnings
  available_earnings := calculate_available_earnings(target_user_id);
  
  -- Get minimum payout amount and payout enabled status
  SELECT 
    COALESCE(upd.minimum_payout_amount, 20.00),
    COALESCE(upd.payout_enabled, false)
  INTO minimum_payout, payout_enabled
  FROM user_payout_details upd
  WHERE upd.user_id = target_user_id;
  
  -- If no payout details exist, use defaults
  IF minimum_payout IS NULL THEN
    minimum_payout := 20.00;
    payout_enabled := false;
  END IF;
  
  -- Count pending payout requests
  SELECT COUNT(*)
  INTO pending_requests_count
  FROM payout_requests
  WHERE user_id = target_user_id
    AND status IN ('pending', 'processing');
  
  -- Validate request
  IF NOT payout_enabled THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Payout not enabled. Please complete account verification.',
      'available_earnings', available_earnings
    );
  END IF;
  
  IF pending_requests_count > 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'You have a pending payout request. Please wait for it to complete.',
      'available_earnings', available_earnings
    );
  END IF;
  
  IF requested_amount < minimum_payout THEN
    RETURN json_build_object(
      'valid', false,
      'error', format('Minimum payout amount is $%.2f', minimum_payout),
      'available_earnings', available_earnings
    );
  END IF;
  
  IF requested_amount > available_earnings THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Requested amount exceeds available earnings',
      'available_earnings', available_earnings
    );
  END IF;
  
  RETURN json_build_object(
    'valid', true,
    'available_earnings', available_earnings,
    'minimum_payout', minimum_payout
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_payout_details_user_id ON user_payout_details(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payout_details_stripe_account_id ON user_payout_details(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON payout_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_referral_logs_payout_request_id ON referral_logs(payout_request_id);
CREATE INDEX IF NOT EXISTS idx_referral_logs_is_paid_out ON referral_logs(is_paid_out);

-- Update trigger for user_payout_details
CREATE OR REPLACE FUNCTION update_user_payout_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_payout_details_updated_at
  BEFORE UPDATE ON user_payout_details
  FOR EACH ROW
  EXECUTE FUNCTION update_user_payout_details_updated_at();

-- Update trigger for payout_requests
CREATE OR REPLACE FUNCTION update_payout_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_requests_updated_at();