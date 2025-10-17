import { useMemo } from 'react';

interface UseReferralLinkOptions {
  username?: string;
  baseUrl?: string;
}

interface UseReferralLinkReturn {
  referralLink: string;
  referralCode: string;
  baseUrl: string;
  isReady: boolean;
}

/**
 * Hook pour gérer les liens de referral
 * Centralise la logique de génération des URLs de referral
 */
export const useReferralLink = (options: UseReferralLinkOptions = {}): UseReferralLinkReturn => {
  const { username, baseUrl: customBaseUrl } = options;
  
  // URL de base configurable via environnement ou props
  const baseUrl = useMemo(() => {
    return customBaseUrl || 
           import.meta.env.VITE_REFERRAL_BASE_URL || 
           'https://fiverflow.com';
  }, [customBaseUrl]);
  
  // Code de referral (nom d'utilisateur)
  const referralCode = username || '';
  
  // Lien de referral complet
  const referralLink = useMemo(() => {
    if (!referralCode) return '';
    return `${baseUrl}/app/${referralCode}`;
  }, [baseUrl, referralCode]);
  
  // Indique si le lien est prêt à être utilisé
  const isReady = Boolean(referralCode && baseUrl);
  
  return {
    referralLink,
    referralCode,
    baseUrl,
    isReady
  };
};

/**
 * Hook pour valider un nom d'utilisateur depuis une URL de referral
 * Utile pour la landing page externe
 */
export const useReferralValidation = (referralUrl: string) => {
  return useMemo(() => {
    try {
      const url = new URL(referralUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      // Format attendu : /app/username
      if (pathParts.length === 2 && pathParts[0] === 'app') {
        return {
          isValid: true,
          username: pathParts[1],
          baseUrl: `${url.protocol}//${url.host}`
        };
      }
      
      return {
        isValid: false,
        username: null,
        baseUrl: null
      };
    } catch (error) {
      return {
        isValid: false,
        username: null,
        baseUrl: null
      };
    }
  }, [referralUrl]);
};

/**
 * Fonction utilitaire pour générer un lien de referral
 * Peut être utilisée en dehors des composants React
 */
export const generateReferralLink = (username: string, baseUrl?: string): string => {
  const url = baseUrl || 
              import.meta.env.VITE_REFERRAL_BASE_URL || 
              'https://fiverflow.com';
  
  if (!username) return '';
  
  return `${url}/app/${username}`;
};

/**
 * Fonction utilitaire pour extraire le nom d'utilisateur d'un lien de referral
 * Utile pour la landing page externe
 */
export const extractUsernameFromReferralLink = (referralUrl: string): string | null => {
  try {
    const url = new URL(referralUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Format attendu : /app/username
    if (pathParts.length === 2 && pathParts[0] === 'app') {
      return pathParts[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Fonction utilitaire pour valider un nom d'utilisateur
 * Vérifie le format et les caractères autorisés
 */
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters and numbers' };
  }
  
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'user', 'users', 'api', 'www', 'mail',
    'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login',
    'register', 'signup', 'signin', 'dashboard', 'profile', 'settings',
    'account', 'billing', 'payment', 'pricing', 'features', 'blog', 'news',
    'fiverflow', 'fiver', 'flow', 'app', 'home', 'index', 'main'
  ];
  
  if (reservedUsernames.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }
  
  return { isValid: true };
};
