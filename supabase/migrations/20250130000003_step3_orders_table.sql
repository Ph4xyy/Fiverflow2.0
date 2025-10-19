-- Etape 3: Table orders pour FiverFlow 2.0
-- Table pour la gestion des commandes et projets

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Informations de base
  title TEXT NOT NULL,
  description TEXT,
  status order_status DEFAULT 'pending',
  platform TEXT,
  
  -- Informations client (denormalisees pour performance)
  client_name TEXT,
  client_email TEXT,
  
  -- Informations financieres
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Dates
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  
  -- Metadonnees
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT orders_title_check CHECK (LENGTH(title) > 0),
  CONSTRAINT orders_budget_check CHECK (budget IS NULL OR budget >= 0),
  CONSTRAINT orders_dates_check CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);

-- Index pour les performances
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_due_date ON orders(due_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique RLS: les utilisateurs ne peuvent voir que leurs propres commandes
CREATE POLICY "Users can manage their own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON orders TO authenticated;

-- Verifier que la table a ete creee
SELECT 'Table orders creee avec succes!' as status;
