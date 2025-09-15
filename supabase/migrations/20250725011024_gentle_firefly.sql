/*
  # Setup Payout System Functions

  1. Functions
    - `validate_payout_request` - Validates if a user can request a payout
    - `calculate_available_earnings` - Calculates user's available earnings for payout

  2. Security
    - Functions are security definer to allow proper access
    - RLS policies ensure users can only access their own data
*/

-- Function to validate payout requests
CREATE OR REPLACE FUNCTION validate_payout_request(
  target_user_id uuid,
  requested_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_earnings numeric;
  pending_payouts numeric;
  min_payout_amount numeric := 20.00;
  result json;
BEGIN
  -- Calculate available earnings (unpaid referral commissions)
  SELECT COALESCE(SUM(amount_earned), 0)
  INTO available_earnings
  FROM referral_logs
  WHERE referrer_id = target_user_id
    AND is_paid_out = false;

  -- Calculate pending payout amounts
  SELECT COALESCE(SUM(amount_requested), 0)
  INTO pending_payouts
  FROM payout_requests
  WHERE user_id = target_user_id
    AND status IN ('pending', 'processing');

  -- Subtract pending payouts from available earnings
  available_earnings := available_earnings - pending_payouts;

  -- Validate the request
  IF requested_amount < min_payout_amount THEN
    result := json_build_object(
      'valid', false,
      'error', 'Minimum payout amount is $' || min_payout_amount,
      'available_earnings', available_earnings
    );
  ELSIF requested_amount > available_earnings THEN
    result := json_build_object(
      'valid', false,
      'error', 'Requested amount exceeds available earnings',
      'available_earnings', available_earnings
    );
  ELSE
    result := json_build_object(
      'valid', true,
      'available_earnings', available_earnings
    );
  END IF;

  RETURN result;
END;
$$;

-- Function to calculate available earnings for payout
CREATE OR REPLACE FUNCTION calculate_available_earnings(
  target_user_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_earnings numeric;
  pending_payouts numeric;
BEGIN
  -- Calculate total unpaid earnings
  SELECT COALESCE(SUM(amount_earned), 0)
  INTO available_earnings
  FROM referral_logs
  WHERE referrer_id = target_user_id
    AND is_paid_out = false;

  -- Calculate pending payout amounts
  SELECT COALESCE(SUM(amount_requested), 0)
  INTO pending_payouts
  FROM payout_requests
  WHERE user_id = target_user_id
    AND status IN ('pending', 'processing');

  -- Return available earnings minus pending payouts
  RETURN GREATEST(available_earnings - pending_payouts, 0);
END;
$$;