import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Composant de redirection racine AMÉLIORÉ
 * Garde la session mais évite les loading loops
 */
const RootRedirect: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();
  const [forceRedirect, setForceRedirect] = useState(false);

  // Timeout de sécurité - 3 secondes max
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('🚨 RootRedirect: Force redirect after timeout');
      setForceRedirect(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Redirection si timeout ou si auth terminé
  if (forceRedirect || !authLoading) {
    const target = user ? '/dashboard' : '/login';
    console.log('🚀 RootRedirect: Redirecting to', target, {
      user: !!user,
      authLoading,
      roleLoading,
      role
    });
    return <Navigate to={target} replace />;
  }

  // Écran de chargement avec debug en développement
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="text-white text-sm">Chargement...</p>
        {import.meta.env.DEV && (
          <div className="text-xs text-slate-400 text-center">
            Auth: {authLoading ? 'Loading' : 'Ready'} | Role: {roleLoading ? 'Loading' : 'Ready'} | User: {user ? 'Yes' : 'No'}
          </div>
        )}
      </div>
    </div>
  );
};

export default RootRedirect;
