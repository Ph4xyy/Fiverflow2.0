/*
  # Invoice System Database Schema

  1. New Tables
    - `invoices`: Main invoice table with all invoice data
    - `invoice_items`: Line items for each invoice
    - `invoice_templates`: Customizable invoice templates
    - `invoice_payments`: Payment tracking for invoices

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access invoices, templates, and payments they own

  3. Relationships
    - invoices.user_id → auth.users.id
    - invoices.client_id → clients.id
    - invoice_items.invoice_id → invoices.id
    - invoice_templates.user_id → auth.users.id
    - invoice_payments.invoice_id → invoices.id

  4. Indexes
    - Performance indexes on frequently queried columns
    - Foreign key indexes for joins
*/

-- Create enum for invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status invoice_status DEFAULT 'draft',
  currency TEXT DEFAULT 'USD',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  tags TEXT[],
  template_id UUID REFERENCES invoice_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoices_subtotal_check CHECK (subtotal >= 0),
  CONSTRAINT invoices_tax_rate_check CHECK (tax_rate >= 0 AND tax_rate <= 100),
  CONSTRAINT invoices_discount_check CHECK (discount >= 0),
  CONSTRAINT invoices_total_check CHECK (total >= 0),
  CONSTRAINT invoices_dates_check CHECK (due_date >= issue_date),
  CONSTRAINT invoices_number_unique UNIQUE (user_id, number)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoice_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT invoice_items_unit_price_check CHECK (unit_price >= 0),
  CONSTRAINT invoice_items_line_total_check CHECK (line_total >= 0)
);

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  schema JSONB NOT NULL,
  variables TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoice_templates_name_check CHECK (LENGTH(name) > 0),
  CONSTRAINT invoice_templates_schema_check CHECK (jsonb_typeof(schema) = 'object')
);

-- Create invoice_payments table
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoice_payments_amount_check CHECK (amount > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(user_id, number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_position ON invoice_items(invoice_id, position);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_is_default ON invoice_templates(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment_date ON invoice_payments(payment_date);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can read own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for invoice_items
CREATE POLICY "Users can read invoice items for own invoices"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoice items for own invoices"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice items for own invoices"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice items for own invoices"
  ON invoice_items
  FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for invoice_templates
CREATE POLICY "Users can read own invoice templates"
  ON invoice_templates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own invoice templates"
  ON invoice_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoice templates"
  ON invoice_templates
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own invoice templates"
  ON invoice_templates
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for invoice_payments
CREATE POLICY "Users can read invoice payments for own invoices"
  ON invoice_payments
  FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoice payments for own invoices"
  ON invoice_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice payments for own invoices"
  ON invoice_payments
  FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice payments for own invoices"
  ON invoice_payments
  FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate invoice totals
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
  -- Get invoice_id from the trigger context
  IF TG_OP = 'DELETE' THEN
    invoice_id = OLD.invoice_id;
  ELSE
    invoice_id = NEW.invoice_id;
  END IF;

  -- Calculate subtotal from all items
  SELECT COALESCE(SUM(line_total), 0) INTO subtotal
  FROM invoice_items
  WHERE invoice_id = calculate_invoice_totals.invoice_id;

  -- Get tax rate and discount from invoice
  SELECT COALESCE(tax_rate, 0), COALESCE(discount, 0)
  INTO tax_rate, discount
  FROM invoices
  WHERE id = calculate_invoice_totals.invoice_id;

  -- Calculate tax amount
  tax_amount := (subtotal - discount) * (tax_rate / 100);

  -- Calculate total
  total := subtotal - discount + tax_amount;

  -- Update invoice totals
  UPDATE invoices
  SET 
    subtotal = subtotal,
    total = total,
    updated_at = NOW()
  WHERE id = calculate_invoice_totals.invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically calculate totals when items change
CREATE TRIGGER calculate_invoice_totals_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

-- Create trigger to recalculate totals when tax_rate or discount change
CREATE TRIGGER calculate_invoice_totals_on_invoice_change
  AFTER UPDATE OF tax_rate, discount ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

-- Create function to ensure only one default template per user
CREATE OR REPLACE FUNCTION ensure_single_default_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a template as default, unset all other defaults for this user
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

-- Create trigger to ensure single default template
CREATE TRIGGER ensure_single_default_template_trigger
  BEFORE INSERT OR UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_template();

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get the next sequential number for this user
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'INV-(\d+)$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoices.user_id = generate_invoice_number.user_id
    AND number ~ '^INV-\d+$';

  -- Format as INV-XXXX
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 4, '0');

  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_items TO authenticated;
GRANT ALL ON invoice_templates TO authenticated;
GRANT ALL ON invoice_payments TO authenticated;
GRANT USAGE ON SEQUENCE invoices_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE invoice_items_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE invoice_templates_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE invoice_payments_id_seq TO authenticated;
