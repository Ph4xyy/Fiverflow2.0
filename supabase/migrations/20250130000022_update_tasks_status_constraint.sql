-- Migration pour mettre à jour la contrainte de vérification des statuts de tâches
-- Date: 2025-01-30
-- Description: Ajoute les nouveaux statuts (on_hold, cancelled, archived) à la contrainte CHECK

-- Supprimer l'ancienne contrainte
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Créer la nouvelle contrainte avec tous les statuts
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled', 'archived'));
