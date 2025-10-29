-- Migration pour corriger les colonnes manquantes dans la table orders
-- Assure que client_name et platform existent

-- Ajouter la colonne client_name si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'client_name') THEN
        ALTER TABLE orders ADD COLUMN client_name TEXT;
    END IF;
END $$;

-- Ajouter la colonne platform si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'platform') THEN
        ALTER TABLE orders ADD COLUMN platform TEXT;
    END IF;
END $$;

-- Ajouter la colonne amount si elle n'existe pas (pour compatibilité)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'amount') THEN
        ALTER TABLE orders ADD COLUMN amount DECIMAL(10,2);
    END IF;
END $$;

-- Ajouter la colonne deadline si elle n'existe pas (pour compatibilité)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'deadline') THEN
        ALTER TABLE orders ADD COLUMN deadline DATE;
    END IF;
END $$;

-- Mettre à jour les données existantes si nécessaire
UPDATE orders 
SET client_name = COALESCE(client_name, 'Client inconnu')
WHERE client_name IS NULL;

UPDATE orders 
SET platform = COALESCE(platform, 'Direct')
WHERE platform IS NULL;

-- Vérifier que les colonnes existent
SELECT 'Colonnes orders corrigees:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('client_name', 'platform', 'amount', 'deadline')
ORDER BY column_name;
