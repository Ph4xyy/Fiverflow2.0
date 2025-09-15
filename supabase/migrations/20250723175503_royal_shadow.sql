/*
  # Create referrals table

  1. New Tables
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key to users)
      - `referred_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `subscription_status` (text, default 'trial')

  2. Security
    - Enable RLS on `referrals` table
    - Add policy for users to read their own referrals (as referrer)
    - Add policy for users to read referrals where they are referred
    - Add policy for users to insert referrals where they are the referrer
    - Add policy for users to update referrals where they are the referrer

  3. Indexes
    - Index on referrer_id for performance
    - Index on referred_id for performance
*/

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  subscription_status text DEFAULT 'trial'
);

-- Add foreign key constraints
ALTER TABLE referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referrals 
ADD CONSTRAINT referrals_referred_id_fkey 
FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate referrals
ALTER TABLE referrals 
ADD CONSTRAINT referrals_referred_id_unique 
UNIQUE (referred_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read referrals where they are the referrer
CREATE POLICY "Users can read own referrals as referrer"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Policy: Users can read referrals where they are referred
CREATE POLICY "Users can read referrals where they are referred"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referred_id = auth.uid());

-- Policy: Users can insert referrals where they are the referrer
CREATE POLICY "Users can insert referrals as referrer"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Policy: Users can update referrals where they are the referrer
CREATE POLICY "Users can update own referrals as referrer"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (referrer_id = auth.uid())
  WITH CHECK (referrer_id = auth.uid());