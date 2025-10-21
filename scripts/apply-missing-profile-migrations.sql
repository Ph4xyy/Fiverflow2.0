-- Script pour appliquer les migrations manquantes du profil
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si les colonnes existent déjà
DO $$
BEGIN
    -- Ajouter les colonnes manquantes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'banner_url') THEN
        ALTER TABLE user_profiles ADD COLUMN banner_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'location') THEN
        ALTER TABLE user_profiles ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'website') THEN
        ALTER TABLE user_profiles ADD COLUMN website TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'professional_title') THEN
        ALTER TABLE user_profiles ADD COLUMN professional_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
        ALTER TABLE user_profiles ADD COLUMN status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'do_not_disturb'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'show_email') THEN
        ALTER TABLE user_profiles ADD COLUMN show_email BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'show_phone') THEN
        ALTER TABLE user_profiles ADD COLUMN show_phone BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'github_url') THEN
        ALTER TABLE user_profiles ADD COLUMN github_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'discord_username') THEN
        ALTER TABLE user_profiles ADD COLUMN discord_username TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'twitter_url') THEN
        ALTER TABLE user_profiles ADD COLUMN twitter_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'linkedin_url') THEN
        ALTER TABLE user_profiles ADD COLUMN linkedin_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'contact_email') THEN
        ALTER TABLE user_profiles ADD COLUMN contact_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'contact_phone') THEN
        ALTER TABLE user_profiles ADD COLUMN contact_phone TEXT;
    END IF;
    
    RAISE NOTICE 'Colonnes ajoutées avec succès à user_profiles';
END $$;

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);

-- 3. Vérifier la structure finale
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Migration des profils appliquée avec succès!' as status;
