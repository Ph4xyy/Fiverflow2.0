-- Script pour mettre à jour la contrainte de vérification des statuts de tâches
-- Ce script ajoute les nouveaux statuts à la contrainte CHECK existante

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- 2. Créer la nouvelle contrainte avec tous les statuts
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled', 'archived'));

-- 3. Vérifier que la contrainte a été créée
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'tasks'::regclass 
  AND contype = 'c'
  AND conname = 'tasks_status_check';
