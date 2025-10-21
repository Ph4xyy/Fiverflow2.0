-- Migration: Générer les codes de parrainage manquants
-- Date: 2025-01-30
-- Description: Générer les codes de parrainage pour tous les utilisateurs existants

-- =============================================
-- 1. FONCTION POUR GÉNÉRER UN CODE UNIQUE
-- =============================================

CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Générer un code au format "FXR-XXXX" où XXXX est un nombre aléatoire
        new_code := 'FXR-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = new_code) INTO code_exists;
        
        -- Si le code n'existe pas, on peut l'utiliser
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
        
        -- Éviter la boucle infinie
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Impossible de générer un code unique après % tentatives', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. GÉNÉRER LES CODES MANQUANTS
-- =============================================

-- Mettre à jour tous les profils qui n'ont pas de code de parrainage
UPDATE user_profiles 
SET referral_code = generate_unique_referral_code()
WHERE referral_code IS NULL;

-- =============================================
-- 3. VÉRIFICATION
-- =============================================

-- Vérifier que tous les profils ont maintenant un code
SELECT 
    'Codes de parrainage générés!' as status,
    COUNT(*) as total_profiles,
    COUNT(referral_code) as profiles_with_code,
    COUNT(*) - COUNT(referral_code) as profiles_without_code
FROM user_profiles;

-- Afficher quelques exemples de codes générés
SELECT 
    user_id,
    full_name,
    referral_code,
    created_at
FROM user_profiles 
WHERE referral_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- =============================================
-- 4. NETTOYER LA FONCTION TEMPORAIRE
-- =============================================

DROP FUNCTION IF EXISTS generate_unique_referral_code();
