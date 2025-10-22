-- Script pour vérifier la structure réelle de la table orders
-- Ce script vérifie les colonnes existantes dans la table orders

-- 1. Vérifier la structure de la table orders
SELECT 
  'Structure de la table orders' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Vérifier toutes les tables qui contiennent "order"
SELECT 
  'Tables contenant order' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%order%'
ORDER BY table_name;

-- 3. Vérifier les colonnes qui pourraient contenir des dates
SELECT 
  'Colonnes de date dans orders' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'orders'
  AND (data_type LIKE '%date%' OR data_type LIKE '%time%' OR column_name LIKE '%date%' OR column_name LIKE '%time%')
ORDER BY column_name;

-- 4. Voir quelques exemples de données dans orders
SELECT 
  'Exemples de données orders' as info,
  *
FROM orders 
LIMIT 3;
