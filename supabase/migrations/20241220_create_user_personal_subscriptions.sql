-- Create user_personal_subscriptions table for tracking personal subscriptions (Netflix, Spotify, etc.)
CREATE TABLE IF NOT EXISTS user_personal_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'quarterly', 'one_time')),
    next_renewal_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    color TEXT NOT NULL DEFAULT '#8b5cf6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_personal_subscriptions_user_id ON user_personal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_personal_subscriptions_next_renewal_date ON user_personal_subscriptions(next_renewal_date);
CREATE INDEX IF NOT EXISTS idx_user_personal_subscriptions_is_active ON user_personal_subscriptions(is_active);

-- Enable Row Level Security
ALTER TABLE user_personal_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own personal subscriptions" ON user_personal_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal subscriptions" ON user_personal_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal subscriptions" ON user_personal_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal subscriptions" ON user_personal_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_personal_subscriptions_updated_at 
    BEFORE UPDATE ON user_personal_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
