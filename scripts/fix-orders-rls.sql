-- Script pour corriger les politiques RLS de la table orders
-- Ce script s'assure que les utilisateurs peuvent créer et gérer leurs propres orders

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can manage their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

-- Créer des politiques RLS spécifiques pour chaque opération
-- 1. Politique pour SELECT (lecture)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Politique pour INSERT (création)
CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Politique pour UPDATE (modification)
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Politique pour DELETE (suppression)
CREATE POLICY "Users can delete their own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- Vérifier que RLS est activé
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Vérifier les permissions
GRANT ALL ON orders TO authenticated;

-- Afficher un message de confirmation
SELECT 'Politiques RLS pour la table orders configurées avec succès!' as status;
