-- Etape 2: Table clients pour FiverFlow 2.0
-- Table principale pour la gestion des clients

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  platform TEXT,
  
  -- Informations etendues
  company_name TEXT,
  client_type TEXT,
  email_primary TEXT,
  email_secondary TEXT,
  phone_primary TEXT,
  phone_whatsapp TEXT,
  preferred_contact_method TEXT,
  timezone TEXT,
  preferred_language TEXT,
  country TEXT,
  city TEXT,
  industry TEXT,
  services_needed TEXT[],
  budget_range TEXT,
  collaboration_frequency TEXT,
  acquisition_source TEXT,
  client_status TEXT,
  priority_level TEXT,
  payment_terms TEXT,
  availability_notes TEXT,
  important_notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  tags TEXT[],
  
  -- Metadonnees
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT clients_name_check CHECK (LENGTH(name) > 0),
  CONSTRAINT clients_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour les performances
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Politique RLS: les utilisateurs ne peuvent voir que leurs propres clients
CREATE POLICY "Users can manage their own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre a jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON clients TO authenticated;

-- Verifier que la table a ete creee
SELECT 'Table clients creee avec succes!' as status;
