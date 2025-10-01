import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection racine qui :
 * - Redirige vers /dashboard si l'utilisateur est connecté
 * - Redirige vers /login si l'utilisateur n'est pas connecté
 * - Affiche un loader pendant le chargement de l'authentification
 */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  // Affiche un loader pendant que l'authentification se charge
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-500"></div>
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirection basée sur l'état de connexion
  // replace=true évite que l'utilisateur puisse revenir à "/" avec le bouton retour
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default RootRedirect;
