-- =====================================================
-- SCRIPT DE NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- FiverFlow 2.0 - Reconstruction propre
-- =====================================================

-- ⚠️ ATTENTION: Ce script va supprimer TOUTES les données
-- Sauvegardez vos données importantes avant d'exécuter ce script

-- =====================================================
-- 1. SUPPRESSION DE TOUTES LES TABLES EXISTANTES
-- =====================================================

-- Supprimer toutes les tables dans l'ordre correct (dépendances)
DROP TABLE IF EXISTS invoice_payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS invoice_templates CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_2fa CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS pending_referrals CASCADE;

-- Supprimer les types personnalisés
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_invoice_totals() CASCADE;
DROP FUNCTION IF EXISTS ensure_single_default_template() CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_2fa_enabled(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_2fa_info(UUID) CASCADE;
DROP FUNCTION IF EXISTS disable_user_2fa(UUID) CASCADE;

-- Supprimer tous les triggers
-- (Les triggers sont supprimés automatiquement avec les tables)

-- =====================================================
-- 2. RECONSTRUCTION PROPRE DU SCHÉMA
-- =====================================================

-- Créer les types ENUM nécessaires
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- =====================================================
-- 3. TABLE CLIENTS (Optimisée)
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  platform TEXT,
  
  -- Informations étendues
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
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT clients_name_check CHECK (LENGTH(name) > 0),
  CONSTRAINT clients_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =====================================================
-- 4. TABLE ORDERS (Optimisée)
-- =====================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Informations de base
  title TEXT NOT NULL,
  description TEXT,
  status order_status DEFAULT 'pending',
  platform TEXT,
  
  -- Informations client (dénormalisées pour performance)
  client_name TEXT,
  client_email TEXT,
  
  -- Informations financières
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Dates
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT orders_title_check CHECK (LENGTH(title) > 0),
  CONSTRAINT orders_budget_check CHECK (budget IS NULL OR budget >= 0),
  CONSTRAINT orders_dates_check CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);

-- =====================================================
-- 5. TABLE TASKS (Optimisée)
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Informations de base
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  
  -- Dates
  due_date DATE,
  completed_date DATE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT tasks_title_check CHECK (LENGTH(title) > 0)
);

-- =====================================================
-- 6. TABLE SUBSCRIPTIONS (Optimisée)
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  category TEXT,
  
  -- Informations financières
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'quarterly', 'one_time')),
  
  -- Dates
  next_renewal_date DATE NOT NULL,
  
  -- État
  is_active BOOLEAN DEFAULT TRUE,
  color TEXT, -- Hex color pour l'affichage
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT subscriptions_name_check CHECK (LENGTH(name) > 0),
  CONSTRAINT subscriptions_amount_check CHECK (amount >= 0)
);

-- =====================================================
-- 7. TABLE INVOICES (Optimisée)
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Informations de base
  number TEXT NOT NULL,
  status invoice_status DEFAULT 'draft',
  currency TEXT DEFAULT 'USD',
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Montants
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  
  -- Informations supplémentaires
  notes TEXT,
  terms TEXT,
  tags TEXT[],
  template_id UUID, -- Référence vers invoice_templates
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT invoices_subtotal_check CHECK (subtotal >= 0),
  CONSTRAINT invoices_tax_rate_check CHECK (tax_rate >= 0 AND tax_rate <= 100),
  CONSTRAINT invoices_discount_check CHECK (discount >= 0),
  CONSTRAINT invoices_total_check CHECK (total >= 0),
  CONSTRAINT invoices_dates_check CHECK (due_date >= issue_date),
  CONSTRAINT invoices_number_unique UNIQUE (user_id, number)
);

-- =====================================================
-- 8. TABLE INVOICE_ITEMS (Optimisée)
-- =====================================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Informations de base
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  position INTEGER DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT invoice_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT invoice_items_unit_price_check CHECK (unit_price >= 0),
  CONSTRAINT invoice_items_line_total_check CHECK (line_total >= 0)
);

-- =====================================================
-- 9. TABLE INVOICE_TEMPLATES (Optimisée)
-- =====================================================
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  schema JSONB NOT NULL,
  variables TEXT[],
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT invoice_templates_name_check CHECK (LENGTH(name) > 0),
  CONSTRAINT invoice_templates_schema_check CHECK (jsonb_typeof(schema) = 'object')
);

-- =====================================================
-- 10. TABLE INVOICE_PAYMENTS (Optimisée)
-- =====================================================
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Informations de base
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT invoice_payments_amount_check CHECK (amount > 0)
);

-- =====================================================
-- 11. TABLE USER_2FA (Optimisée)
-- =====================================================
CREATE TABLE user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations 2FA
  secret TEXT NOT NULL,
  backup_codes TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT user_2fa_user_id_unique UNIQUE (user_id)
);

-- =====================================================
-- 12. TABLE REFERRALS (Système de parrainage)
-- =====================================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Contraintes
  CONSTRAINT referrals_referrer_referred_check CHECK (referrer_id != referred_id),
  CONSTRAINT referrals_referral_code_unique UNIQUE (referral_code)
);

-- =====================================================
-- 13. TABLE PENDING_REFERRALS (Références en attente)
-- =====================================================
CREATE TABLE pending_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  referral_code TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Contraintes
  CONSTRAINT pending_referrals_referral_code_unique UNIQUE (referral_code)
);

-- =====================================================
-- 14. INDEXES POUR LES PERFORMANCES
-- =====================================================

-- Index pour les clients
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Index pour les commandes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_due_date ON orders(due_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Index pour les tâches
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_order_id ON tasks(order_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Index pour les abonnements
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_renewal ON subscriptions(next_renewal_date);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active) WHERE is_active = TRUE;

-- Index pour les factures
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(user_id, number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- Index pour les articles de factures
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_position ON invoice_items(invoice_id, position);

-- Index pour les modèles de factures
CREATE INDEX idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX idx_invoice_templates_is_default ON invoice_templates(user_id, is_default);

-- Index pour les paiements
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_payment_date ON invoice_payments(payment_date);

-- Index pour 2FA
CREATE INDEX idx_user_2fa_user_id ON user_2fa(user_id);

-- Index pour les références
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Index pour les références en attente
CREATE INDEX idx_pending_referrals_referrer_id ON pending_referrals(referrer_id);
CREATE INDEX idx_pending_referrals_referral_code ON pending_referrals(referral_code);
CREATE INDEX idx_pending_referrals_status ON pending_referrals(status);

-- =====================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_referrals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 16. POLITIQUES RLS
-- =====================================================

-- Politiques pour les clients
CREATE POLICY "Users can manage their own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les commandes
CREATE POLICY "Users can manage their own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les tâches
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les abonnements
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les factures
CREATE POLICY "Users can manage their own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les articles de factures
CREATE POLICY "Users can manage invoice items for their invoices" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- Politiques pour les modèles de factures
CREATE POLICY "Users can manage their own invoice templates" ON invoice_templates
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les paiements
CREATE POLICY "Users can manage payments for their invoices" ON invoice_payments
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- Politiques pour 2FA
CREATE POLICY "Users can manage their own 2FA" ON user_2fa
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les références
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Politiques pour les références en attente
CREATE POLICY "Users can manage their own pending referrals" ON pending_referrals
  FOR ALL USING (auth.uid() = referrer_id);

-- =====================================================
-- 17. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les totaux de factures
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_id UUID;
  subtotal DECIMAL(10,2);
  tax_rate DECIMAL(5,2);
  discount DECIMAL(10,2);
  tax_amount DECIMAL(10,2);
  total DECIMAL(10,2);
BEGIN
  -- Obtenir l'ID de la facture
  IF TG_OP = 'DELETE' THEN
    invoice_id = OLD.invoice_id;
  ELSE
    invoice_id = NEW.invoice_id;
  END IF;

  -- Calculer le sous-total
  SELECT COALESCE(SUM(line_total), 0) INTO subtotal
  FROM invoice_items
  WHERE invoice_id = calculate_invoice_totals.invoice_id;

  -- Obtenir le taux de taxe et la remise
  SELECT COALESCE(tax_rate, 0), COALESCE(discount, 0)
  INTO tax_rate, discount
  FROM invoices
  WHERE id = calculate_invoice_totals.invoice_id;

  -- Calculer le montant de la taxe
  tax_amount := (subtotal - discount) * (tax_rate / 100);

  -- Calculer le total
  total := subtotal - discount + tax_amount;

  -- Mettre à jour la facture
  UPDATE invoices
  SET 
    subtotal = subtotal,
    total = total,
    updated_at = NOW()
  WHERE id = calculate_invoice_totals.invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour s'assurer qu'un seul modèle par défaut par utilisateur
CREATE OR REPLACE FUNCTION ensure_single_default_template()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE invoice_templates
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des numéros de facture
CREATE OR REPLACE FUNCTION generate_invoice_number(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'INV-(\d+)$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoices.user_id = generate_invoice_number.user_id
    AND number ~ '^INV-\d+$';

  invoice_number := 'INV-' || LPAD(next_number::TEXT, 4, '0');
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Fonctions 2FA
CREATE OR REPLACE FUNCTION user_has_2fa_enabled(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_2fa 
    WHERE user_id = user_uuid AND enabled = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_2fa_info(user_uuid UUID)
RETURNS TABLE(
  enabled BOOLEAN,
  backup_codes TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u2f.enabled,
    u2f.backup_codes
  FROM user_2fa u2f
  WHERE u2f.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION disable_user_2fa(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_2fa 
  SET 
    enabled = FALSE,
    secret = NULL,
    backup_codes = '{}',
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 18. TRIGGERS
-- =====================================================

-- Triggers pour updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_2fa_updated_at
  BEFORE UPDATE ON user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les calculs automatiques
CREATE TRIGGER calculate_invoice_totals_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER calculate_invoice_totals_on_invoice_change
  AFTER UPDATE OF tax_rate, discount ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

-- Trigger pour un seul modèle par défaut
CREATE TRIGGER ensure_single_default_template_trigger
  BEFORE INSERT OR UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_template();

-- =====================================================
-- 19. PERMISSIONS
-- =====================================================

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_items TO authenticated;
GRANT ALL ON invoice_templates TO authenticated;
GRANT ALL ON invoice_payments TO authenticated;
GRANT ALL ON user_2fa TO authenticated;
GRANT ALL ON referrals TO authenticated;
GRANT ALL ON pending_referrals TO authenticated;

-- =====================================================
-- 20. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer des données de test si nécessaire
-- (Décommentez les lignes suivantes si vous voulez des données de test)

/*
-- Exemple de client de test
INSERT INTO clients (user_id, name, email, company, platform) VALUES
('00000000-0000-0000-0000-000000000000', 'Client Test', 'test@example.com', 'Test Company', 'Fiverr');

-- Exemple d'abonnement de test
INSERT INTO subscriptions (user_id, name, description, provider, category, amount, currency, billing_cycle, next_renewal_date) VALUES
('00000000-0000-0000-0000-000000000000', 'Netflix', 'Abonnement Netflix Premium', 'Netflix', 'entertainment', 15.99, 'USD', 'monthly', CURRENT_DATE + INTERVAL '1 month');
*/

-- =====================================================
-- FIN DU SCRIPT DE NETTOYAGE
-- =====================================================

-- Vérifier que tout a été créé correctement
SELECT 'Database cleanup completed successfully!' as status;
