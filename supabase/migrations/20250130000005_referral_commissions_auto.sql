-- Migration: Système de commissions automatiques
-- Date: 2025-01-30
-- Description: Fonctions pour créer automatiquement les commissions de parrainage

-- =============================================
-- 1. FONCTION POUR CRÉER UNE COMMISSION AUTOMATIQUE
-- =============================================

CREATE OR REPLACE FUNCTION create_automatic_referral_commission(
    p_customer_id TEXT,
    p_amount DECIMAL(10,2),
    p_currency TEXT DEFAULT 'eur',
    p_payment_reference TEXT DEFAULT NULL,
    p_order_id UUID DEFAULT NULL,
    p_subscription_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    commission_id UUID;
    user_id UUID;
    referrer_id UUID;
    commission_amount DECIMAL(10,2);
BEGIN
    -- Trouver l'utilisateur par son customer_id Stripe
    SELECT id, referred_by INTO user_id, referrer_id
    FROM profiles 
    WHERE stripe_customer_id = p_customer_id;
    
    -- Vérifier si l'utilisateur existe et a un parrain
    IF user_id IS NULL THEN
        RAISE NOTICE 'User not found for customer_id: %', p_customer_id;
        RETURN NULL;
    END IF;
    
    IF referrer_id IS NULL THEN
        RAISE NOTICE 'No referrer found for user: %', user_id;
        RETURN NULL;
    END IF;
    
    -- Calculer la commission (20%)
    commission_amount := (p_amount * 20.00) / 100;
    
    -- Créer la commission
    INSERT INTO referral_commissions (
        referrer_id,
        referred_id,
        amount,
        percentage,
        status,
        payment_method,
        payment_reference,
        order_id,
        subscription_id
    ) VALUES (
        referrer_id,
        user_id,
        commission_amount,
        20.00,
        'pending',
        'stripe',
        p_payment_reference,
        p_order_id,
        p_subscription_id
    ) RETURNING id INTO commission_id;
    
    -- Mettre à jour les statistiques du parrain
    UPDATE profiles 
    SET 
        referral_earnings = referral_earnings + commission_amount,
        total_referrals = total_referrals + 1
    WHERE id = referrer_id;
    
    RAISE NOTICE 'Referral commission created: % for referrer: %', commission_id, referrer_id;
    RETURN commission_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating referral commission: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. FONCTION POUR MARQUER UNE COMMISSION COMME PAYÉE
-- =============================================

CREATE OR REPLACE FUNCTION mark_referral_commission_paid(
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
-- 3. FONCTION POUR ANNULER LES COMMISSIONS D'UN PAIEMENT
-- =============================================

CREATE OR REPLACE FUNCTION cancel_referral_commissions_for_payment(
    p_payment_reference TEXT
)
RETURNS INTEGER AS $$
DECLARE
    cancelled_count INTEGER;
BEGIN
    -- Annuler les commissions correspondantes
    UPDATE referral_commissions 
    SET 
        status = 'cancelled',
        updated_at = NOW()
    WHERE 
        payment_reference = p_payment_reference
        AND status IN ('pending', 'paid');
    
    GET DIAGNOSTICS cancelled_count = ROW_COUNT;
    
    -- Mettre à jour les statistiques du parrain (soustraire les montants annulés)
    UPDATE profiles 
    SET 
        referral_earnings = referral_earnings - (
            SELECT COALESCE(SUM(amount), 0)
            FROM referral_commissions 
            WHERE payment_reference = p_payment_reference
            AND status = 'cancelled'
        )
    WHERE id IN (
        SELECT DISTINCT referrer_id 
        FROM referral_commissions 
        WHERE payment_reference = p_payment_reference
        AND status = 'cancelled'
    );
    
    RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. FONCTION POUR ANNULER LES COMMISSIONS D'UN ABONNEMENT
-- =============================================

CREATE OR REPLACE FUNCTION cancel_referral_commissions_for_subscription(
    p_subscription_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
    cancelled_count INTEGER;
BEGIN
    -- Annuler les commissions correspondantes
    UPDATE referral_commissions 
    SET 
        status = 'cancelled',
        updated_at = NOW()
    WHERE 
        subscription_id = p_subscription_id
        AND status IN ('pending', 'paid');
    
    GET DIAGNOSTICS cancelled_count = ROW_COUNT;
    
    -- Mettre à jour les statistiques du parrain
    UPDATE profiles 
    SET 
        referral_earnings = referral_earnings - (
            SELECT COALESCE(SUM(amount), 0)
            FROM referral_commissions 
            WHERE subscription_id = p_subscription_id
            AND status = 'cancelled'
        )
    WHERE id IN (
        SELECT DISTINCT referrer_id 
        FROM referral_commissions 
        WHERE subscription_id = p_subscription_id
        AND status = 'cancelled'
    );
    
    RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. TRIGGER POUR METTRE À JOUR LES STATISTIQUES AUTOMATIQUEMENT
-- =============================================

-- Fonction trigger pour mettre à jour les stats quand une commission change de statut
CREATE OR REPLACE FUNCTION update_referral_stats_on_commission_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le statut change vers 'paid'
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        -- Mettre à jour les statistiques du parrain
        UPDATE profiles 
        SET 
            referral_earnings = referral_earnings + NEW.amount
        WHERE id = NEW.referrer_id;
    END IF;
    
    -- Si le statut change vers 'cancelled' ou 'refunded'
    IF NEW.status IN ('cancelled', 'refunded') AND OLD.status NOT IN ('cancelled', 'refunded') THEN
        -- Soustraire le montant des statistiques
        UPDATE profiles 
        SET 
            referral_earnings = GREATEST(referral_earnings - NEW.amount, 0)
        WHERE id = NEW.referrer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_referral_stats ON referral_commissions;
CREATE TRIGGER trigger_update_referral_stats
    AFTER UPDATE ON referral_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_stats_on_commission_change();

-- =============================================
-- 6. VUE POUR LES COMMISSIONS EN ATTENTE
-- =============================================

CREATE OR REPLACE VIEW pending_referral_commissions AS
SELECT 
    rc.id,
    rc.referrer_id,
    rc.referred_id,
    p_referrer.full_name as referrer_name,
    p_referrer.email as referrer_email,
    p_referred.full_name as referred_name,
    p_referred.email as referred_email,
    rc.amount,
    rc.percentage,
    rc.status,
    rc.payment_method,
    rc.payment_reference,
    rc.created_at,
    rc.updated_at
FROM referral_commissions rc
JOIN profiles p_referrer ON rc.referrer_id = p_referrer.id
JOIN profiles p_referred ON rc.referred_id = p_referred.id
WHERE rc.status = 'pending'
ORDER BY rc.created_at DESC;

-- =============================================
-- 7. PERMISSIONS POUR LES EDGE FUNCTIONS
-- =============================================

-- Donner les permissions nécessaires aux Edge Functions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
