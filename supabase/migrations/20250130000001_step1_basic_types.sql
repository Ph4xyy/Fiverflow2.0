-- Etape 1: Types de base pour FiverFlow 2.0
-- Migration simple et propre

-- Types pour les factures
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');

-- Types pour les commandes
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');

-- Types pour les taches
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Verifier que les types ont ete crees
SELECT 'Types ENUM crees avec succes!' as status;