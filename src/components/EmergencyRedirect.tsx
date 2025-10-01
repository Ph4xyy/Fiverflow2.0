import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection d'urgence - version simplifiée qui ne dépend que de l'auth
 * Utilisé en cas de problème avec UserDataContext
 */
const EmergencyRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [forceRedirect, setForceRedirect] = useState(false);

  // Timeout de sécurité de 3 secondes
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('🚨 EmergencyRedirect: Forcing redirect after timeout');
      setForceRedirect(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Si on force la redirection ou si le loading est terminé
  if (forceRedirect || !loading) {
    console.log('🚨 EmergencyRedirect: Redirecting to', user ? '/dashboard' : '/login');
    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
  }

  // Écran de chargement simple
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-500"></div>
        <p className="text-slate-400 text-sm">Chargement d'urgence...</p>
        <div className="text-xs text-slate-500">
          Auth Loading: {loading ? '⏳' : '✅'}
        </div>
      </div>
    </div>
  );
};

export default EmergencyRedirect;
