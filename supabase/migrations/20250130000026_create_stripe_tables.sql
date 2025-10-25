-- Migration pour créer les tables Stripe manquantes
-- Tables nécessaires pour le système de paiement Stripe

-- 1. Table stripe_customers - Mapping entre utilisateurs et clients Stripe
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL UNIQUE, -- ID du client Stripe
  email TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Contraintes
  CONSTRAINT stripe_customers_user_id_unique UNIQUE (user_id),
  CONSTRAINT stripe_customers_customer_id_unique UNIQUE (customer_id)
);

-- 2. Table stripe_subscriptions - Abonnements Stripe
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL, -- ID du client Stripe
  subscription_id TEXT NOT NULL UNIQUE, -- ID de l'abonnement Stripe
  status TEXT NOT NULL, -- 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'
  price_id TEXT, -- ID du prix Stripe
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT stripe_subscriptions_subscription_id_unique UNIQUE (subscription_id)
);

-- 3. Table stripe_products - Produits Stripe (optionnel, pour cache)
CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE, -- ID du produit Stripe
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table stripe_prices - Prix Stripe (optionnel, pour cache)
CREATE TABLE IF NOT EXISTS stripe_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id TEXT NOT NULL UNIQUE, -- ID du prix Stripe
  product_id TEXT NOT NULL, -- ID du produit associé
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval TEXT, -- 'month', 'year', 'week', 'day'
  interval_count INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_deleted_at ON stripe_customers(deleted_at);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_stripe_products_product_id ON stripe_products(product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(active);

CREATE INDEX IF NOT EXISTS idx_stripe_prices_price_id ON stripe_prices(price_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_active ON stripe_prices(active);

-- RLS (Row Level Security)
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour stripe_customers
CREATE POLICY "Users can view their own stripe customers" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stripe customers" ON stripe_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stripe customers" ON stripe_customers
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour stripe_subscriptions (lecture seule pour les utilisateurs)
CREATE POLICY "Users can view their own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour stripe_products (lecture publique)
CREATE POLICY "Anyone can view active stripe products" ON stripe_products
  FOR SELECT USING (active = TRUE);

-- Politiques RLS pour stripe_prices (lecture publique)
CREATE POLICY "Anyone can view active stripe prices" ON stripe_prices
  FOR SELECT USING (active = TRUE);

-- Triggers pour updated_at
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_prices_updated_at
  BEFORE UPDATE ON stripe_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON stripe_customers TO authenticated;
GRANT ALL ON stripe_subscriptions TO authenticated;
GRANT ALL ON stripe_products TO authenticated;
GRANT ALL ON stripe_prices TO authenticated;

-- Vérifier que les tables ont été créées
SELECT 'Tables Stripe créées avec succès!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('stripe_customers', 'stripe_subscriptions', 'stripe_products', 'stripe_prices')
ORDER BY table_name;
