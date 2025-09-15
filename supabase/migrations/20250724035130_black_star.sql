/*
  # Enhance clients table with additional fields

  1. New Columns Added
    - `company_name` (text, optional) - Company name for business clients
    - `client_type` (text, default 'individual') - Type of client (individual/company/freelance)
    - `email_primary` (text, optional) - Primary email address
    - `email_secondary` (text, optional) - Secondary email address
    - `phone_primary` (text, optional) - Primary phone number
    - `phone_whatsapp` (text, optional) - WhatsApp phone number
    - `timezone` (text, optional) - Client's timezone
    - `preferred_language` (text, default 'English') - Preferred communication language
    - `country` (text, optional) - Client's country
    - `city` (text, optional) - Client's city
    - `industry` (text, optional) - Client's industry/sector
    - `services_needed` (text[], optional) - Array of services the client needs
    - `budget_range` (text, optional) - Expected budget range
    - `collaboration_frequency` (text, optional) - How often they work together
    - `acquisition_source` (text, optional) - How the client was acquired
    - `client_status` (text, default 'prospect') - Current client status
    - `priority_level` (text, default 'medium') - Client priority level
    - `payment_terms` (text, optional) - Preferred payment terms
    - `preferred_contact_method` (text, default 'email') - Preferred way to contact
    - `availability_notes` (text, optional) - Notes about client availability
    - `important_notes` (text, optional) - Important notes about the client
    - `first_contact_date` (timestamptz, default now()) - Date of first contact
    - `next_action` (text, optional) - Next planned action
    - `next_action_date` (date, optional) - Date for next action
    - `tags` (text[], optional) - Custom tags for the client

  2. Security
    - All new columns respect existing RLS policies
    - No changes to existing security model
</*/

-- Add company information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE clients ADD COLUMN company_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'client_type'
  ) THEN
    ALTER TABLE clients ADD COLUMN client_type text DEFAULT 'individual';
  END IF;
END $$;

-- Add contact information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'email_primary'
  ) THEN
    ALTER TABLE clients ADD COLUMN email_primary text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'email_secondary'
  ) THEN
    ALTER TABLE clients ADD COLUMN email_secondary text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'phone_primary'
  ) THEN
    ALTER TABLE clients ADD COLUMN phone_primary text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'phone_whatsapp'
  ) THEN
    ALTER TABLE clients ADD COLUMN phone_whatsapp text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE clients ADD COLUMN timezone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE clients ADD COLUMN preferred_language text DEFAULT 'English';
  END IF;
END $$;

-- Add location information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'country'
  ) THEN
    ALTER TABLE clients ADD COLUMN country text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'city'
  ) THEN
    ALTER TABLE clients ADD COLUMN city text;
  END IF;
END $$;

-- Add business information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'industry'
  ) THEN
    ALTER TABLE clients ADD COLUMN industry text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'services_needed'
  ) THEN
    ALTER TABLE clients ADD COLUMN services_needed text[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'budget_range'
  ) THEN
    ALTER TABLE clients ADD COLUMN budget_range text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'collaboration_frequency'
  ) THEN
    ALTER TABLE clients ADD COLUMN collaboration_frequency text;
  END IF;
END $$;

-- Add commercial management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'acquisition_source'
  ) THEN
    ALTER TABLE clients ADD COLUMN acquisition_source text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'client_status'
  ) THEN
    ALTER TABLE clients ADD COLUMN client_status text DEFAULT 'prospect';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'priority_level'
  ) THEN
    ALTER TABLE clients ADD COLUMN priority_level text DEFAULT 'medium';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE clients ADD COLUMN payment_terms text;
  END IF;
END $$;

-- Add communication preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'preferred_contact_method'
  ) THEN
    ALTER TABLE clients ADD COLUMN preferred_contact_method text DEFAULT 'email';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'availability_notes'
  ) THEN
    ALTER TABLE clients ADD COLUMN availability_notes text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'important_notes'
  ) THEN
    ALTER TABLE clients ADD COLUMN important_notes text;
  END IF;
END $$;

-- Add tracking information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'first_contact_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN first_contact_date timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'next_action'
  ) THEN
    ALTER TABLE clients ADD COLUMN next_action text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'next_action_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN next_action_date date;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'tags'
  ) THEN
    ALTER TABLE clients ADD COLUMN tags text[];
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_client_status ON clients(client_status);
CREATE INDEX IF NOT EXISTS idx_clients_priority_level ON clients(priority_level);
CREATE INDEX IF NOT EXISTS idx_clients_country ON clients(country);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);
CREATE INDEX IF NOT EXISTS idx_clients_first_contact_date ON clients(first_contact_date);
CREATE INDEX IF NOT EXISTS idx_clients_next_action_date ON clients(next_action_date);