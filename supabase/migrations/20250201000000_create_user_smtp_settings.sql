-- Migration: Create user_smtp_settings table for email functionality
-- Date: 2025-02-01

-- =====================================================
-- TABLE USER_SMTP_SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- SMTP connection settings
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  secure BOOLEAN DEFAULT FALSE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  
  -- Sender identity
  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,
  
  -- Status
  enabled BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_smtp_settings_port_check CHECK (port > 0 AND port <= 65535),
  CONSTRAINT user_smtp_settings_one_per_user UNIQUE (user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_smtp_settings_user_id ON user_smtp_settings(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE user_smtp_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own SMTP settings
CREATE POLICY "Users can view their own smtp settings" ON user_smtp_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own SMTP settings
CREATE POLICY "Users can insert their own smtp settings" ON user_smtp_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own SMTP settings
CREATE POLICY "Users can update their own smtp settings" ON user_smtp_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own SMTP settings
CREATE POLICY "Users can delete their own smtp settings" ON user_smtp_settings
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_user_smtp_settings_updated_at
  BEFORE UPDATE ON user_smtp_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

