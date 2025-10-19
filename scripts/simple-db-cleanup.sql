-- Script simple de nettoyage de la base de données
-- Ce script peut être exécuté directement dans l'interface Supabase

-- Vérifier les tables existantes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les colonnes de la table clients
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ajouter les colonnes manquantes à la table clients si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter email si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'email') THEN
        ALTER TABLE clients ADD COLUMN email TEXT;
    END IF;
    
    -- Ajouter phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
        ALTER TABLE clients ADD COLUMN phone TEXT;
    END IF;
    
    -- Ajouter company si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'company') THEN
        ALTER TABLE clients ADD COLUMN company TEXT;
    END IF;
    
    -- Ajouter platform si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'platform') THEN
        ALTER TABLE clients ADD COLUMN platform TEXT;
    END IF;
    
    -- Ajouter les colonnes étendues si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'company_name') THEN
        ALTER TABLE clients ADD COLUMN company_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
        ALTER TABLE clients ADD COLUMN client_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'email_primary') THEN
        ALTER TABLE clients ADD COLUMN email_primary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'email_secondary') THEN
        ALTER TABLE clients ADD COLUMN email_secondary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone_primary') THEN
        ALTER TABLE clients ADD COLUMN phone_primary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone_whatsapp') THEN
        ALTER TABLE clients ADD COLUMN phone_whatsapp TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'preferred_contact_method') THEN
        ALTER TABLE clients ADD COLUMN preferred_contact_method TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'timezone') THEN
        ALTER TABLE clients ADD COLUMN timezone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'preferred_language') THEN
        ALTER TABLE clients ADD COLUMN preferred_language TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'country') THEN
        ALTER TABLE clients ADD COLUMN country TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'city') THEN
        ALTER TABLE clients ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'industry') THEN
        ALTER TABLE clients ADD COLUMN industry TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'services_needed') THEN
        ALTER TABLE clients ADD COLUMN services_needed TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'budget_range') THEN
        ALTER TABLE clients ADD COLUMN budget_range TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'collaboration_frequency') THEN
        ALTER TABLE clients ADD COLUMN collaboration_frequency TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'acquisition_source') THEN
        ALTER TABLE clients ADD COLUMN acquisition_source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_status') THEN
        ALTER TABLE clients ADD COLUMN client_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'priority_level') THEN
        ALTER TABLE clients ADD COLUMN priority_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'payment_terms') THEN
        ALTER TABLE clients ADD COLUMN payment_terms TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'availability_notes') THEN
        ALTER TABLE clients ADD COLUMN availability_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'important_notes') THEN
        ALTER TABLE clients ADD COLUMN important_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'next_action') THEN
        ALTER TABLE clients ADD COLUMN next_action TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'next_action_date') THEN
        ALTER TABLE clients ADD COLUMN next_action_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'tags') THEN
        ALTER TABLE clients ADD COLUMN tags TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updated_at') THEN
        ALTER TABLE clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Créer les index manquants
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Vérifier que tout a été ajouté
SELECT 'Colonnes ajoutées avec succès!' as status;
