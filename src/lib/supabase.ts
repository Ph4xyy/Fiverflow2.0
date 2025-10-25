import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://arnuyyyryvbfcvqauqur.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Fonction pour détecter Safari/iFrame/PWA et vérifier l'accès au storage
const detectStorageIssues = (): { 
  hasIssue: boolean; 
  isSafari: boolean; 
  isIFrame: boolean; 
  isPWA: boolean;
  canAccessStorage: boolean;
} => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIFrame = window.self !== window.top;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;

  let canAccessStorage = true;
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    canAccessStorage = retrieved === 'test';
  } catch (e) {
    canAccessStorage = false;
  }

  const hasIssue = (isSafari && isIFrame) || !canAccessStorage;

  return { hasIssue, isSafari, isIFrame, isPWA, canAccessStorage };
};

// Détecter les problèmes de storage
const storageInfo = detectStorageIssues();

// Storage diagnostics - logs supprimés pour la propreté

// Avertir si problème détecté (logs supprimés pour la propreté)

// Custom storage avec gestion d'erreurs robuste
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      // Log supprimé pour la propreté
      return item;
    } catch (e) {
      // Erreur de storage - gérée silencieusement
      // Si le storage échoue, essayer sessionStorage en fallback
      try {
        return window.sessionStorage.getItem(key);
      } catch (e2) {
        // Erreur de fallback - gérée silencieusement
        return null;
      }
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
      // Log supprimé pour la propreté
    } catch (e) {
      // Erreur de storage - gérée silencieusement
      // Fallback vers sessionStorage
      try {
        window.sessionStorage.setItem(key, value);
        // Fallback vers sessionStorage - géré silencieusement
      } catch (e2) {
        // Erreur de fallback - gérée silencieusement
      }
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      // Log supprimé pour la propreté
    } catch (e) {
      // Erreur de storage - gérée silencieusement
      try {
        window.sessionStorage.removeItem(key);
      } catch (e2) {
        // Erreur de fallback - gérée silencieusement
      }
    }
  }
};

// SINGLETON Supabase Client - UNE SEULE initialisation avec options UNIFORMES
let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured && !supabaseInstance) {
  console.log('[Supabase] Initializing singleton client...');
  
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      // Options uniformes pour tous les environnements
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      multiTab: true,
      storageKey: 'fiverflow.auth',
      flowType: 'pkce',
      storage: customStorage,
      debug: import.meta.env.DEV,
      // Paramètres de refresh optimisés
      refreshTokenRetryInterval: 2000,
      refreshTokenRetryAttempts: 5,
      refreshTokenMargin: 60, // Rafraîchir 60s avant expiration
    },
  });

  console.log('[Supabase] ✅ Singleton client initialized successfully');
}

export const supabase = supabaseInstance;

// Exposer les informations de storage pour diagnostic
export const storageSupport = {
  ...storageInfo,
  shouldWarnUser: storageInfo.hasIssue,
  message: storageInfo.hasIssue 
    ? 'Votre navigateur limite l\'accès au stockage. Pour une meilleure expérience, ouvrez l\'application dans un nouvel onglet.'
    : 'Storage accessible'
};

// Vérification de cohérence des variables d'environnement
if (typeof window !== 'undefined') {
  console.log('[Supabase] Environment check:', {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL,
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseAnonKey,
    supabaseUrlPreview: supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : 'undefined',
    // Vérifier que les valeurs sont cohérentes
    urlMatchesExpected: supabaseUrl?.includes('.supabase.co'),
    keyLength: supabaseAnonKey?.length || 0
  });
}
