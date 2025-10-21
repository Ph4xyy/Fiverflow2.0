import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ReferralService } from '../services/referralService';
import { supabase } from '../lib/supabase';

interface ReferralContextType {
  // État du code de parrainage
  referralCode: string | null;
  referrerInfo: {
    id: string;
    name: string;
    email: string;
  } | null;
  
  // États
  loading: boolean;
  error: string | null;
  
  // Actions
  setReferralCode: (code: string | null) => void;
  clearReferralCode: () => void;
  validateReferralCode: (code: string) => Promise<boolean>;
  applyReferralCode: (userId: string) => Promise<boolean>;
  
  // Utilitaires
  extractReferralCodeFromUrl: (url?: string) => string | null;
  getReferralLink: (code: string) => string;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

export const ReferralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [referralCode, setReferralCodeState] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================
  // GESTION DU STOCKAGE LOCAL
  // =============================================

  // Charger le code de parrainage depuis localStorage
  const loadReferralCode = useCallback(() => {
    try {
      const storedCode = localStorage.getItem('referral_code');
      if (storedCode) {
        setReferralCodeState(storedCode);
        console.log('🎯 Referral code loaded from localStorage:', storedCode);
      }
    } catch (error) {
      console.error('Error loading referral code from localStorage:', error);
    }
  }, []);

  // Sauvegarder le code de parrainage dans localStorage
  const saveReferralCode = useCallback((code: string | null) => {
    try {
      if (code) {
        localStorage.setItem('referral_code', code);
        console.log('🎯 Referral code saved to localStorage:', code);
      } else {
        localStorage.removeItem('referral_code');
        console.log('🎯 Referral code removed from localStorage');
      }
    } catch (error) {
      console.error('Error saving referral code to localStorage:', error);
    }
  }, []);

  // =============================================
  // DÉTECTION AUTOMATIQUE DU CODE DANS L'URL
  // =============================================

  // Détecter le code de parrainage dans l'URL actuelle
  const detectReferralCodeFromUrl = useCallback(() => {
    const currentUrl = window.location.href;
    const extractedCode = ReferralService.extractReferralCodeFromUrl(currentUrl);
    
    if (extractedCode) {
      console.log('🎯 Referral code detected in URL:', extractedCode);
      setReferralCode(extractedCode);
      return extractedCode;
    }
    
    return null;
  }, []);

  // =============================================
  // VALIDATION ET RÉCUPÉRATION DES INFORMATIONS DU PARRAIN
  // =============================================

  // Valider un code de parrainage et récupérer les infos du parrain
  const validateReferralCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code) return false;

    try {
      setLoading(true);
      setError(null);

      // Vérifier que le code existe dans la base de données
      const { data: referrer, error: referrerError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('referral_code', code)
        .single();

      if (referrerError || !referrer) {
        console.warn('Invalid referral code:', code);
        setError('Code de parrainage invalide');
        return false;
      }

      // Stocker les informations du parrain
      setReferrerInfo({
        id: referrer.id,
        name: referrer.full_name || 'Utilisateur',
        email: referrer.email || ''
      });

      console.log('✅ Referral code validated:', code, 'Referrer:', referrer.full_name);
      return true;

    } catch (error) {
      console.error('Error validating referral code:', error);
      setError('Erreur lors de la validation du code de parrainage');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================================
  // ACTIONS PUBLIQUES
  // =============================================

  // Définir un code de parrainage
  const setReferralCode = useCallback(async (code: string | null) => {
    if (!code) {
      setReferralCodeState(null);
      setReferrerInfo(null);
      saveReferralCode(null);
      return;
    }

    // Valider le code avant de le stocker
    const isValid = await validateReferralCode(code);
    if (isValid) {
      setReferralCodeState(code);
      saveReferralCode(code);
    } else {
      setReferralCodeState(null);
      setReferrerInfo(null);
      saveReferralCode(null);
    }
  }, [validateReferralCode, saveReferralCode]);

  // Effacer le code de parrainage
  const clearReferralCode = useCallback(() => {
    setReferralCodeState(null);
    setReferrerInfo(null);
    saveReferralCode(null);
    setError(null);
  }, [saveReferralCode]);

  // Appliquer le code de parrainage lors de l'inscription
  const applyReferralCode = useCallback(async (userId: string): Promise<boolean> => {
    if (!referralCode || !user) {
      console.log('No referral code to apply');
      return true; // Pas d'erreur, juste pas de parrain
    }

    try {
      setLoading(true);
      
      // Utiliser le service pour enregistrer le parrain
      const success = await ReferralService.setReferrer(userId, referralCode);
      
      if (success) {
        console.log('✅ Referral code applied successfully for user:', userId);
        // Nettoyer le code après application réussie
        clearReferralCode();
        return true;
      } else {
        console.warn('Failed to apply referral code');
        setError('Impossible d\'appliquer le code de parrainage');
        return false;
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      setError('Erreur lors de l\'application du code de parrainage');
      return false;
    } finally {
      setLoading(false);
    }
  }, [referralCode, user, clearReferralCode]);

  // Extraire le code de parrainage d'une URL
  const extractReferralCodeFromUrl = useCallback((url?: string): string | null => {
    return ReferralService.extractReferralCodeFromUrl(url);
  }, []);

  // Générer un lien de parrainage
  const getReferralLink = useCallback((code: string): string => {
    return ReferralService.generateReferralLink(code).url;
  }, []);

  // =============================================
  // INITIALISATION ET DÉTECTION AUTOMATIQUE
  // =============================================

  useEffect(() => {
    // Charger le code depuis localStorage au démarrage
    loadReferralCode();
    
    // Détecter le code dans l'URL si pas de code stocké
    if (!referralCode) {
      const urlCode = detectReferralCodeFromUrl();
      if (urlCode) {
        setReferralCode(urlCode);
      }
    }
  }, [loadReferralCode, detectReferralCodeFromUrl, referralCode]);

  // Détecter les changements d'URL (pour les SPA)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlCode = detectReferralCodeFromUrl();
      if (urlCode && urlCode !== referralCode) {
        setReferralCode(urlCode);
      }
    };

    // Écouter les changements d'URL
    window.addEventListener('popstate', handleUrlChange);
    
    // Observer les changements d'URL pour les SPA
    const observer = new MutationObserver(handleUrlChange);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      observer.disconnect();
    };
  }, [detectReferralCodeFromUrl, referralCode]);

  const value: ReferralContextType = {
    referralCode,
    referrerInfo,
    loading,
    error,
    setReferralCode,
    clearReferralCode,
    validateReferralCode,
    applyReferralCode,
    extractReferralCodeFromUrl,
    getReferralLink
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};
