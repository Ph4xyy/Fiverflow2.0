/*
  # Activer Row-Level Security pour la table clients

  1. Sécurité
    - Active RLS sur la table `clients`
    - Ajoute une politique pour que seul le propriétaire puisse accéder à ses clients
    - Utilise `user_id` pour correspondre à la structure existante
*/

-- Active Row-Level Security pour la table clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Politique : Seul le freelance propriétaire peut voir ses données
CREATE POLICY "Freelancer can access own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour permettre l'insertion de nouveaux clients
CREATE POLICY "Freelancer can insert own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Politique pour permettre la mise à jour de ses propres clients
CREATE POLICY "Freelancer can update own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour permettre la suppression de ses propres clients
CREATE POLICY "Freelancer can delete own clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());