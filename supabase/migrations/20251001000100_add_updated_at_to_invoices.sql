-- Ensure invoices.updated_at column exists and is maintained

-- Add updated_at column if missing
ALTER TABLE IF EXISTS invoices
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace helper function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- Recreate trigger on invoices to auto-update updated_at
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

