/*
  # Add dark_mode column to users table

  1. Changes
    - Add `dark_mode` column to `users` table
    - Set default value to `false` (light mode by default)
    - Column is nullable to handle existing users gracefully

  2. Security
    - No RLS changes needed as existing policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'dark_mode'
  ) THEN
    ALTER TABLE users ADD COLUMN dark_mode boolean DEFAULT false;
  END IF;
END $$;