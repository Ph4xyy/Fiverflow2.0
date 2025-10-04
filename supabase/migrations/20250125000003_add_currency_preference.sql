/*
  # Add currency preference to user_preferences table
  
  1. New Column
    - `default_currency` (text, default 'USD') - User's preferred currency
*/

-- Add currency column to user_preferences table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'default_currency'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN default_currency text DEFAULT 'USD' NOT NULL;
  END IF;
END $$;

-- Update existing records to have USD as default currency
UPDATE user_preferences SET default_currency = 'USD' WHERE default_currency IS NULL;
