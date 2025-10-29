-- Script pour corriger tous les clients cassés créés par Jett
-- Exécutez ce script dans Supabase Dashboard → SQL Editor

-- Corriger tous les clients qui ont email mais pas email_primary
UPDATE clients
SET 
  email_primary = COALESCE(email_primary, email),
  phone_primary = COALESCE(phone_primary, phone),
  company_name = COALESCE(company_name, company),
  client_status = COALESCE(client_status, 'active')
WHERE 
  (email_primary IS NULL AND email IS NOT NULL)
  OR (phone_primary IS NULL AND phone IS NOT NULL)
  OR (company_name IS NULL AND company IS NOT NULL)
  OR (client_status IS NULL);

-- Vérifier les résultats
SELECT 
  id,
  name,
  email,
  email_primary,
  company,
  company_name,
  client_status,
  created_at
FROM clients
WHERE 
  email IS NOT NULL 
  AND (email_primary IS NULL OR company_name IS NULL OR client_status IS NULL)
ORDER BY created_at DESC
LIMIT 10;

