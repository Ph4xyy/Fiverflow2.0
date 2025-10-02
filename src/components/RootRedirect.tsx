import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection racine ULTRA-SIMPLE
 * Ne dépend que de l'AuthContext pour éviter les loops
 */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [forceRedirect, setForceRedirect] = useState(false);

  // 🔥 Timeout de sécurité réduit - 1 seconde max pour une authentification fluide
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('🚨 RootRedirect: Force redirect after timeout');
      setForceRedirect(true);
    }, 1000); // Réduit de 2s à 1s

    return () => clearTimeout(timeout);
  }, []);

  // Redirection immédiate si timeout ou si auth terminé
  if (forceRedirect || !loading) {
    const target = user ? '/dashboard' : '/login';
    console.log('🚀 RootRedirect: Redirecting to', target, {
      user: !!user,
      loading,
      forceRedirect
    });
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
