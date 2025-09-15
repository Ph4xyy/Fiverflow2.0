/*
  # Add role field to users table

  1. Changes
    - Add `role` column to `users` table
    - Set default value to 'user'
    - Allow manual modification to 'admin' in Supabase dashboard

  2. Security
    - Field is editable manually in Supabase for admin assignment
    - Default role ensures all new users are regular users
*/

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add comment for clarity
COMMENT ON COLUMN users.role IS 'User role: user (default) or admin (manually set)';

-- Create index for role-based queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);