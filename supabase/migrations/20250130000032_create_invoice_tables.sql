-- Migration: Création des tables de facturation
-- Date: 2025-01-30

-- =====================================================
-- 1. TABLE INVOICES
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
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
-- 2. TABLE INVOICE_ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
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
-- 3. TABLE INVOICE_TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_templates (
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
-- 4. TABLE INVOICE_PAYMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_payments (
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
-- 5. INDEXES POUR LES PERFORMANCES
-- =====================================================

-- Index pour les factures
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(user_id, number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Index pour les articles de factures
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_position ON invoice_items(invoice_id, position);

-- Index pour les modèles de factures
CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_is_default ON invoice_templates(user_id, is_default);

-- Index pour les paiements
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment_date ON invoice_payments(payment_date);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Politique RLS pour invoice_items
CREATE POLICY "Users can view their own invoice items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoice items" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoice items" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
    )
  );

-- Politique RLS pour invoice_templates
CREATE POLICY "Users can view their own invoice templates" ON invoice_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice templates" ON invoice_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice templates" ON invoice_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice templates" ON invoice_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Politique RLS pour invoice_payments
CREATE POLICY "Users can view their own invoice payments" ON invoice_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_payments.invoice_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invoice payments" ON invoice_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_payments.invoice_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoice payments" ON invoice_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_payments.invoice_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoice payments" ON invoice_payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE id = invoice_payments.invoice_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour générer automatiquement un numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT := 'INV-';
  v_year TEXT := TO_CHAR(NOW(), 'YYYY');
  v_month TEXT := TO_CHAR(NOW(), 'MM');
  v_count INTEGER;
  v_number TEXT;
BEGIN
  -- Compter le nombre de factures pour ce mois
  SELECT COUNT(*) + 1 INTO v_count
  FROM invoices
  WHERE user_id = p_user_id
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
  
  -- Générer le numéro : INV-YYYY-MM-XXXX
  v_number := v_prefix || v_year || '-' || v_month || '-' || LPAD(v_count::TEXT, 4, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les totaux d'une facture
CREATE OR REPLACE FUNCTION calculate_invoice_totals(p_invoice_id UUID)
RETURNS VOID AS $$
DECLARE
  v_subtotal DECIMAL(10,2) := 0;
  v_total DECIMAL(10,2) := 0;
  v_tax_rate DECIMAL(5,2) := 0;
  v_discount DECIMAL(10,2) := 0;
BEGIN
  -- Calculer le subtotal depuis les items
  SELECT COALESCE(SUM(line_total), 0) INTO v_subtotal
  FROM invoice_items
  WHERE invoice_id = p_invoice_id;
  
  -- Récupérer tax_rate et discount
  SELECT tax_rate, discount INTO v_tax_rate, v_discount
  FROM invoices
  WHERE id = p_invoice_id;
  
  -- Calculer le total
  v_total := v_subtotal - v_discount;
  v_total := v_total + (v_total * v_tax_rate / 100);
  
  -- Mettre à jour la facture
  UPDATE invoices
  SET subtotal = v_subtotal,
      total = v_total
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recalculer les totaux quand un item change
CREATE OR REPLACE FUNCTION recalculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_invoice_totals(NEW.invoice_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invoice_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_invoice_totals();

-- Fonction pour créer une facture avec numéro automatique
CREATE OR REPLACE FUNCTION create_invoice_with_number(
  p_user_id UUID,
  p_client_id UUID,
  p_issue_date DATE,
  p_due_date DATE,
  p_currency TEXT DEFAULT 'USD',
  p_notes TEXT DEFAULT NULL,
  p_terms TEXT DEFAULT NULL,
  p_template_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_number TEXT;
BEGIN
  -- Générer le numéro de facture
  v_number := generate_invoice_number(p_user_id);
  
  -- Créer la facture
  INSERT INTO invoices (
    user_id, client_id, number, issue_date, due_date,
    currency, notes, terms, template_id
  )
  VALUES (
    p_user_id, p_client_id, v_number, p_issue_date, p_due_date,
    p_currency, p_notes, p_terms, p_template_id
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
