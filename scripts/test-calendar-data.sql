-- Script de test simple pour vérifier les données du calendrier
-- Ce script vérifie que les données sont bien récupérées pour le calendrier

-- 1. Vérifier les commandes avec due_date (pour le calendrier)
SELECT 
  'Commandes pour le calendrier' as type,
  COUNT(*) as count
FROM orders 
WHERE due_date IS NOT NULL

UNION ALL

-- 2. Vérifier les tâches avec due_date (pour le calendrier)
SELECT 
  'Tâches pour le calendrier' as type,
  COUNT(*) as count
FROM tasks 
WHERE due_date IS NOT NULL

UNION ALL

-- 3. Vérifier les événements du calendrier
SELECT 
  'Événements du calendrier' as type,
  COUNT(*) as count
FROM calendar_events;

-- 4. Voir quelques exemples de commandes avec due_date
SELECT 
  'Exemples de commandes avec due_date' as info,
  id,
  title,
  due_date,
  status,
  budget
FROM orders 
WHERE due_date IS NOT NULL
ORDER BY due_date DESC
LIMIT 3;

-- 5. Voir quelques exemples de tâches avec due_date
SELECT 
  'Exemples de tâches avec due_date' as info,
  id,
  title,
  due_date,
  priority,
  status
FROM tasks 
WHERE due_date IS NOT NULL
ORDER BY due_date DESC
LIMIT 3;
