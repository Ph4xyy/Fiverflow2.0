/*
  # Ajouter le champ referrer_id à la table users

  1. Modifications
    - Ajouter la colonne `referrer_id` (UUID, nullable)
    - Créer une clé étrangère vers `users.id`
    - Ajouter un index pour les performances

  2. Sécurité
    - Contrainte de clé étrangère avec CASCADE
    - Index pour optimiser les requêtes de parrainage
*/

-- Ajouter la colonne referrer_id à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id uuid;

-- Créer la contrainte de clé étrangère
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_referrer_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_referrer_id_fkey 
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON users(referrer_id);