import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ReferralService } from '../services/referralService';
import { 
  ReferralProfile, 
  ReferralStats, 
  ReferralData, 
  ReferralLink,
  ReferralAnalytics,
  ReferralCommission,
  CommissionStatus
} from '../types/referral';

interface UseReferralReturn {
  // Profil de parrainage
  profile: ReferralProfile | null;
  stats: ReferralStats | null;
  analytics: ReferralAnalytics | null;
  
  // Liens et codes
  referralLink: ReferralLink | null;
  
  // Données
  referrals: ReferralData[];
  commissions: ReferralCommission[];
  
  // États
  loading: boolean;
  error: string | null;
  
  // Actions
  generateNewCode: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  getCommissionsByStatus: (status: CommissionStatus) => Promise<ReferralCommission[]>;
  
  // Utilitaires
  extractReferralCode: (url?: string) => string | null;
  validateReferralCode: (code: string) => Promise<boolean>;
}

export const useReferral = (): UseReferralReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [referralLink, setReferralLink] = useState<ReferralLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de parrainage
  const loadReferralData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Charger le profil de parrainage
      const userProfile = await ReferralService.getUserReferralProfile(user.id);
      setProfile(userProfile);

      if (userProfile) {
        // Générer le lien de parrainage
        const link = ReferralService.generateReferralLink(userProfile.referral_code);
        setReferralLink(link);

        // Charger les statistiques
        const userStats = await ReferralService.getUserReferralStats(user.id);
        setStats(userStats);

        // Charger les analytics
        const userAnalytics = await ReferralService.getReferralAnalytics(user.id);
        setAnalytics(userAnalytics);

        // Charger les filleuls
        const userReferrals = await ReferralService.getUserReferrals(user.id);
        setReferrals(userReferrals);

        // Charger les commissions
        const userCommissions = await ReferralService.getUserCommissions(user.id);
        setCommissions(userCommissions);
      }
    } catch (err) {
      console.error('Error loading referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Générer un nouveau code de parrainage
  const generateNewCode = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const newCode = await ReferralService.generateReferralCode(user.id);
      if (newCode) {
        // Recharger les données
        await loadReferralData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error generating new referral code:', err);
      setError('Failed to generate new referral code');
      return false;
    }
  }, [user, loadReferralData]);

  // Rafraîchir les données
  const refreshData = useCallback(async (): Promise<void> => {
    await loadReferralData();
  }, [loadReferralData]);

  // Obtenir les commissions par statut
  const getCommissionsByStatus = useCallback(async (status: CommissionStatus): Promise<ReferralCommission[]> => {
    if (!user) return [];

    try {
      return await ReferralService.getUserCommissions(user.id, status);
    } catch (err) {
      console.error('Error fetching commissions by status:', err);
      return [];
    }
  }, [user]);

  // Extraire le code de parrainage d'une URL
  const extractReferralCode = useCallback((url?: string): string | null => {
    return ReferralService.extractReferralCodeFromUrl(url);
  }, []);

  // Valider un code de parrainage
  const validateReferralCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      return await ReferralService.validateReferralCode(code);
    } catch (err) {
      console.error('Error validating referral code:', err);
      return false;
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  return {
    profile,
    stats,
    analytics,
    referralLink,
    referrals,
    commissions,
    loading,
    error,
    generateNewCode,
    refreshData,
    getCommissionsByStatus,
    extractReferralCode,
    validateReferralCode
  };
};
