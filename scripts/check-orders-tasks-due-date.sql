-- Script corrigé pour vérifier les commandes avec due_date
-- Ce script vérifie que les commandes ont des due_date et peuvent apparaître dans le calendrier

-- 1. Vérifier la structure de la table orders
SELECT 
  'Structure de la table orders' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Vérifier les commandes avec due_date
SELECT 
  'Commandes avec due_date' as info,
  COUNT(*) as total_orders_with_due_date
FROM orders 
WHERE due_date IS NOT NULL;

-- 3. Voir quelques exemples de commandes avec due_date
SELECT 
  'Exemples de commandes' as info,
  id,
  title,
  due_date,
  status,
  amount
FROM orders 
WHERE due_date IS NOT NULL
ORDER BY due_date DESC
LIMIT 5;

-- 4. Vérifier les tâches avec due_date
SELECT 
  'Tâches avec due_date' as info,
  COUNT(*) as total_tasks_with_due_date
FROM tasks 
WHERE due_date IS NOT NULL;

-- 5. Voir quelques exemples de tâches avec due_date
SELECT 
  'Exemples de tâches' as info,
  id,
  title,
  due_date,
  priority,
  status
FROM tasks 
WHERE due_date IS NOT NULL
ORDER BY due_date DESC
LIMIT 5;

-- 6. Statistiques générales
SELECT 
  'Statistiques générales' as info,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM orders WHERE due_date IS NOT NULL) as orders_with_due_date,
  (SELECT COUNT(*) FROM tasks) as total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE due_date IS NOT NULL) as tasks_with_due_date,
  (SELECT COUNT(*) FROM calendar_events) as calendar_events;
