/*
  # Fix Row Level Security policies for users table

  1. Security Policies
    - Enable RLS on `users` table
    - Add policy for users to read their own profile
    - Add policy for users to create their own profile (during signup)
    - Add policy for users to update their own profile (during onboarding)

  This fixes the authentication and profile management issues by allowing authenticated users
  to properly manage their own user records in the database.
*/

-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can view their own profile" 
  ON users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy to allow users to create their own profile (during signup)
CREATE POLICY "Users can create their own profile" 
  ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own profile (during onboarding)
CREATE POLICY "Users can update their own profile" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id);