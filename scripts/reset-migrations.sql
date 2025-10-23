-- =====================================================
-- SCRIPT DE RÉINITIALISATION DES MIGRATIONS
-- FiverFlow 2.0 - Migration propre
-- =====================================================

-- ⚠️ ATTENTION: Ce script va supprimer l'historique des migrations
-- Utilisez ce script seulement si vous voulez repartir de zéro

-- =====================================================
-- 1. SUPPRIMER L'HISTORIQUE DES MIGRATIONS
-- =====================================================

-- Supprimer toutes les entrées de la table des migrations
DELETE FROM supabase_migrations.schema_migrations;

-- =====================================================
-- 2. CRÉER UNE NOUVELLE MIGRATION PROPRE
-- =====================================================

-- Insérer une nouvelle migration avec un timestamp propre
INSERT INTO supabase_migrations.schema_migrations (version, statements, name) VALUES (
  '20250130000000',
  '-- Migration initiale propre pour FiverFlow 2.0
-- Cette migration contient tout le schéma optimisé

-- Exécuter le contenu du script clean-database.sql ici
-- (Le contenu sera inséré automatiquement)',
  'initial_clean_schema'
);

-- =====================================================
-- 3. VÉRIFICATION
-- =====================================================

-- Vérifier que la migration a été créée
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version = '20250130000000';

SELECT 'Migration reset completed successfully!' as status;
