import React, { useEffect } from 'react';

/**
 * Composant pour diagnostiquer les problèmes d'environnement
 */
export const EnvironmentDiagnostic: React.FC = () => {
  useEffect(() => {
    // Log des informations d'environnement
    const envInfo = {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      performance: typeof performance !== 'undefined',
      location: {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        hostname: window.location.hostname,
        protocol: window.location.protocol
      }
    };

    console.log('🌍 Environment Diagnostic:', envInfo);

    // Vérifier les problèmes potentiels
    const issues: string[] = [];

    if (!localStorage) issues.push('localStorage not available');
    if (!sessionStorage) issues.push('sessionStorage not available');
    if (!fetch) issues.push('fetch not available');
    if (!performance) issues.push('performance API not available');

    // Vérifier les variables d'environnement Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) issues.push('VITE_SUPABASE_URL not defined');
    if (!supabaseKey) issues.push('VITE_SUPABASE_ANON_KEY not defined');

    if (issues.length > 0) {
      console.warn('⚠️ Environment Issues:', issues);
    } else {
      console.log('✅ Environment looks good');
    }

    // Vérifier le cache du navigateur
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        console.log('🗄️ Available caches:', cacheNames);
      }).catch(err => {
        console.warn('⚠️ Cache API error:', err);
      });
    }

  }, []);

  return null; // Ce composant ne rend rien
};

export default EnvironmentDiagnostic;
