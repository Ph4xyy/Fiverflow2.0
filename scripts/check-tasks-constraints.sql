-- Script pour vérifier les contraintes de la table tasks
-- Ce script vérifie les contraintes CHECK sur la table tasks

-- 1. Vérifier les contraintes CHECK sur la table tasks
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'tasks'::regclass 
  AND contype = 'c';

-- 2. Vérifier la structure de la colonne status
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name = 'status';

-- 3. Vérifier les valeurs existantes dans la colonne status
SELECT 
  status,
  COUNT(*) as count
FROM tasks 
GROUP BY status;
