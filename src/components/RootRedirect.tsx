/**
 * RootRedirect - Redirection intelligente basée sur l'état d'authentification
 * 
 * Fonctionnalités :
 * - Redirection automatique vers /dashboard si connecté
 * - Affiche la landing page si non connecté
 * - Gestion des états de chargement
 * - Interface de chargement élégante
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RootRedirect: React.FC = () => {
  const { user, loading, authReady } = useAuth();

  // Afficher le loading pendant l'initialisation
  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">FiverFlow</h2>
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirection basée sur l'état d'authentification
  if (user) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/landing" replace />;
  }
};

export default RootRedirect;