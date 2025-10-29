-- Script de test pour vérifier les corrections du calendrier et des subscriptions
-- Exécuter ce script après avoir appliqué les corrections

-- 1. Vérifier que la table calendar_events existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'calendar_events'
ORDER BY ordinal_position;

-- 2. Vérifier que les tables de subscription existent
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('user_subscriptions', 'subscription_plans')
ORDER BY table_name, ordinal_position;

-- 3. Vérifier que la table tasks existe et a les bonnes colonnes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name IN ('id', 'title', 'due_date', 'priority', 'user_id')
ORDER BY ordinal_position;

-- 4. Tester l'insertion d'un événement de test (si un utilisateur est connecté)
-- Note: Cette requête ne fonctionnera que si un utilisateur est authentifié
INSERT INTO calendar_events (user_id, title, start, end, type, priority)
VALUES (
  auth.uid(),
  'Test Event - Calendrier',
  NOW(),
  NOW() + INTERVAL '1 hour',
  'meeting',
  'medium'
)
RETURNING id, title, start, end;

-- 5. Vérifier les événements créés
SELECT 
  id,
  title,
  start,
  end,
  type,
  priority,
  created_at
FROM calendar_events 
WHERE user_id = auth.uid()
ORDER BY start DESC
LIMIT 5;

-- 6. Vérifier les tâches avec due_date
SELECT 
  id,
  title,
  due_date,
  priority,
  status
FROM tasks 
WHERE user_id = auth.uid() 
  AND due_date IS NOT NULL
ORDER BY due_date DESC
LIMIT 5;

-- 7. Statistiques des tables
SELECT 
  'calendar_events' as table_name,
  COUNT(*) as row_count
FROM calendar_events
WHERE user_id = auth.uid()

UNION ALL

SELECT 
  'tasks' as table_name,
  COUNT(*) as row_count
FROM tasks
WHERE user_id = auth.uid()

UNION ALL

SELECT 
  'tasks_with_due_date' as table_name,
  COUNT(*) as row_count
FROM tasks
WHERE user_id = auth.uid() 
  AND due_date IS NOT NULL;
