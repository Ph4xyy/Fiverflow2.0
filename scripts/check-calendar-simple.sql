-- Script de vérification simple et compatible
-- Ce script vérifie l'état de la table calendar_events sans colonnes problématiques

-- 1. Vérifier que la table existe
SELECT 
  'Table calendar_events existe' as status,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'calendar_events';

-- 2. Vérifier la structure de la table
SELECT 
  'Structure de la table' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'calendar_events'
ORDER BY ordinal_position;

-- 3. Vérifier les index
SELECT 
  'Index existants' as info,
  indexname
FROM pg_indexes 
WHERE tablename = 'calendar_events';

-- 4. Vérifier les politiques RLS
SELECT 
  'Politiques RLS' as info,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'calendar_events'
ORDER BY policyname;

-- 5. Vérifier si RLS est activé (version compatible)
SELECT 
  'RLS Status' as info,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'calendar_events';

-- 6. Compter les événements existants
SELECT 
  'Statistiques' as info,
  COUNT(*) as total_events
FROM calendar_events;

-- 7. Vérifier les triggers
SELECT 
  'Triggers' as info,
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'calendar_events';

-- 8. Test final - essayer d'insérer un événement de test
-- (Ne fonctionnera que si un utilisateur est connecté)
INSERT INTO calendar_events (user_id, title, start_time, end_time, type, priority)
VALUES (
  auth.uid(),
  'Test Event - Vérification',
  NOW(),
  NOW() + INTERVAL '1 hour',
  'meeting',
  'medium'
)
RETURNING 
  'Test d''insertion réussi' as status,
  id,
  title;
