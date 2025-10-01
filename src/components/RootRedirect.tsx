import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection racine simplifié qui :
 * - Redirige vers /dashboard si l'utilisateur est connecté
 * - Redirige vers /login si l'utilisateur n'est pas connecté
 * - Affiche un loader simple avec timeout de sécurité
 */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout de sécurité pour éviter un écran bleu infini
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ RootRedirect timeout reached - forcing redirect');
      setTimeoutReached(true);
    }, 2000); // 2 secondes max

    return () => clearTimeout(timeout);
  }, []);

  // Si timeout atteint ou loading terminé, on redirige
  if (timeoutReached || !loading) {
    const target = user ? '/dashboard' : '/login';
    console.log('🚀 RootRedirect: Redirecting to', target, '| Reason:', timeoutReached ? 'timeout' : 'auth-ready');
    return <Navigate to={target} replace />;
  }

  // Écran de chargement simple
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-500"></div>
        <p className="text-slate-400 text-sm">Chargement...</p>
        <div className="text-xs text-slate-600 text-center max-w-xs">
          Redirection automatique en cours...
        </div>
      </div>
    </div>
  );
};

export default RootRedirect;
