import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection racine ULTRA-SIMPLIFIÉ
 * Élimine tous les problèmes de loading loops
 */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [forceRedirect, setForceRedirect] = useState(false);

  // Timeout de sécurité ABSOLU - 2 secondes max
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('🚨 RootRedirect: Force redirect after timeout');
      setForceRedirect(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Redirection immédiate si :
  // 1. Force redirect (timeout)
  // 2. Auth loading terminé
  if (forceRedirect || !loading) {
    const target = user ? '/dashboard' : '/login';
    console.log('🚀 RootRedirect: Redirecting to', target);
    return <Navigate to={target} replace />;
  }

  // Écran de chargement minimal
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="text-white text-sm">Chargement...</p>
      </div>
    </div>
  );
};

export default RootRedirect;
