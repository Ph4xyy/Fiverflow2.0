-- Script pour supprimer toutes les tables et repartir de zéro
-- ATTENTION: Ceci va supprimer TOUTES les données !

-- Supprimer toutes les tables dans l'ordre correct (dépendances)
DROP TABLE IF EXISTS invoice_payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS invoice_templates CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_2fa CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS pending_referrals CASCADE;

-- Supprimer les types personnalisés
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_invoice_totals() CASCADE;
DROP FUNCTION IF EXISTS ensure_single_default_template() CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_2fa_enabled(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_2fa_info(UUID) CASCADE;
DROP FUNCTION IF EXISTS disable_user_2fa(UUID) CASCADE;

-- Vérifier que tout a été supprimé
SELECT 'Toutes les tables ont été supprimées!' as status;
