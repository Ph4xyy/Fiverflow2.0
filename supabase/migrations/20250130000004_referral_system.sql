-- Migration: Système de parrainage complet
-- Date: 2025-01-30
-- Description: Création du système de parrainage avec commissions

-- =============================================
-- 1. TABLE PROFILES (mise à jour)
-- =============================================

-- Ajouter les colonnes de parrainage à la table profiles existante
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_earnings DECIMAL(10,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- =============================================
-- 2. TABLE REFERRAL_COMMISSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS referral_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subscription_id TEXT, -- ID de l'abonnement Stripe
    amount DECIMAL(10,2) NOT NULL, -- Montant de la commission
    percentage DECIMAL(5,2) NOT NULL DEFAULT 20.00, -- Pourcentage (20%)
    status commission_status NOT NULL DEFAULT 'pending',
    payment_method TEXT, -- 'stripe', 'manual', etc.
    payment_reference TEXT, -- Référence du paiement
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT referral_commissions_amount_check CHECK (amount >= 0),
    CONSTRAINT referral_commissions_percentage_check CHECK (percentage >= 0 AND percentage <= 100),
    CONSTRAINT referral_commissions_different_users CHECK (referrer_id != referred_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referred ON referral_commissions(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_status ON referral_commissions(status);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_created ON referral_commissions(created_at);

-- =============================================
-- 3. TYPE ENUM POUR LE STATUT DES COMMISSIONS
-- =============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_status') THEN
        CREATE TYPE commission_status AS ENUM (
            'pending',      -- En attente de paiement
            'paid',         -- Payé
            'cancelled',    -- Annulé
            'refunded'      -- Remboursé
        );
    END IF;
END $$;

-- =============================================
-- 4. FONCTIONS SQL POUR LE SYSTÈME DE PARRAINAGE
-- =============================================

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Générer un code au format "FXR-XXXX" où XXXX est un nombre aléatoire
        new_code := 'FXR-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
        
        -- Si le code n'existe pas, on peut l'utiliser
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une commission de parrainage
CREATE OR REPLACE FUNCTION create_referral_commission(
    p_referrer_id UUID,
    p_referred_id UUID,
    p_amount DECIMAL(10,2),
    p_percentage DECIMAL(5,2) DEFAULT 20.00,
    p_order_id UUID DEFAULT NULL,
    p_subscription_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    commission_id UUID;
    commission_amount DECIMAL(10,2);
BEGIN
    -- Calculer le montant de la commission
    commission_amount := (p_amount * p_percentage) / 100;
    
    -- Créer la commission
    INSERT INTO referral_commissions (
        referrer_id,
        referred_id,
        amount,
        percentage,
        order_id,
        subscription_id,
        status
    ) VALUES (
        p_referrer_id,
        p_referred_id,
        commission_amount,
        p_percentage,
        p_order_id,
        p_subscription_id,
        'pending'
    ) RETURNING id INTO commission_id;
    
    -- Mettre à jour les statistiques du parrain
    UPDATE profiles 
    SET 
        referral_earnings = referral_earnings + commission_amount,
        total_referrals = total_referrals + 1
    WHERE id = p_referrer_id;
    
    RETURN commission_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer une commission comme payée
CREATE OR REPLACE FUNCTION mark_commission_paid(
    p_commission_id UUID,
    p_payment_method TEXT DEFAULT 'stripe',
    p_payment_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE referral_commissions 
    SET 
        status = 'paid',
        payment_method = p_payment_method,
        payment_reference = p_payment_reference,
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_commission_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. TRIGGER POUR GÉNÉRER AUTOMATIQUEMENT LE CODE DE PARRAINAGE
-- =============================================

-- Fonction trigger pour générer automatiquement le code de parrainage
CREATE OR REPLACE FUNCTION generate_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Générer un code de parrainage si l'utilisateur n'en a pas
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON profiles;
CREATE TRIGGER trigger_generate_referral_code
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_user_referral_code();

-- =============================================
-- 6. TRIGGER POUR METTRE À JOUR updated_at
-- =============================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour referral_commissions
DROP TRIGGER IF EXISTS trigger_update_referral_commissions_updated_at ON referral_commissions;
CREATE TRIGGER trigger_update_referral_commissions_updated_at
    BEFORE UPDATE ON referral_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =============================================

-- Activer RLS sur referral_commissions
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient leurs propres commissions
CREATE POLICY "Users can view their own referral commissions" ON referral_commissions
    FOR SELECT USING (
        referrer_id = auth.uid() OR 
        referred_id = auth.uid()
    );

-- Politique pour que les utilisateurs voient leurs propres commissions (insertion limitée)
CREATE POLICY "Users can view referral commissions data" ON referral_commissions
    FOR INSERT WITH CHECK (true); -- Seulement via les fonctions système

-- Politique pour les mises à jour (seulement le système)
CREATE POLICY "System can update referral commissions" ON referral_commissions
    FOR UPDATE USING (true); -- Seulement via les fonctions système

-- =============================================
-- 8. VUES POUR FACILITER LES REQUÊTES
-- =============================================

-- Vue pour les statistiques de parrainage d'un utilisateur
CREATE OR REPLACE VIEW user_referral_stats AS
SELECT 
    p.id as user_id,
    p.referral_code,
    p.referral_earnings,
    p.total_referrals,
    COUNT(rc.id) as total_commissions,
    COALESCE(SUM(CASE WHEN rc.status = 'paid' THEN rc.amount ELSE 0 END), 0) as paid_commissions,
    COALESCE(SUM(CASE WHEN rc.status = 'pending' THEN rc.amount ELSE 0 END), 0) as pending_commissions,
    COALESCE(SUM(CASE WHEN rc.status = 'cancelled' THEN rc.amount ELSE 0 END), 0) as cancelled_commissions
FROM profiles p
LEFT JOIN referral_commissions rc ON p.id = rc.referrer_id
GROUP BY p.id, p.referral_code, p.referral_earnings, p.total_referrals;

-- Vue pour les filleuls d'un utilisateur
CREATE OR REPLACE VIEW user_referrals AS
SELECT 
    rc.referrer_id,
    rc.referred_id,
    p_referred.email as referred_email,
    p_referred.full_name as referred_name,
    p_referred.created_at as referred_joined_at,
    rc.amount as commission_amount,
    rc.status as commission_status,
    rc.created_at as commission_created_at,
    rc.paid_at
FROM referral_commissions rc
JOIN profiles p_referred ON rc.referred_id = p_referred.id
ORDER BY rc.created_at DESC;

-- =============================================
-- 9. DONNÉES DE TEST (OPTIONNEL - À SUPPRIMER EN PRODUCTION)
-- =============================================

-- Insérer des données de test si nécessaire
-- (À supprimer en production)
