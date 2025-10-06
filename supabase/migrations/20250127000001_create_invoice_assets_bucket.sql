-- Migration pour créer le bucket invoice-assets
-- Cette migration crée le bucket nécessaire pour stocker les assets des factures

-- Créer le bucket invoice-assets s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-assets',
  'invoice-assets', 
  true, -- public pour permettre les URLs publiques
  5242880, -- 5MB limit
  ARRAY['image/*'] -- seulement les images
)
ON CONFLICT (id) DO NOTHING;

-- Note: Les politiques RLS sont configurées dans la migration suivante
-- 20250127000000_fix_storage_policies.sql
