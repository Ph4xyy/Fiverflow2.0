-- Script de vérification de la table calendar_events
-- Ce script vérifie l'état actuel de la table et des politiques

-- 1. Vérifier que la table existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'calendar_events';

-- 2. Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'calendar_events'
ORDER BY ordinal_position;

-- 3. Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'calendar_events';

-- 4. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'calendar_events'
ORDER BY policyname;

-- 5. Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'calendar_events';

-- 6. Compter les événements existants (si un utilisateur est connecté)
SELECT 
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users
FROM calendar_events;

-- 7. Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'calendar_events';
