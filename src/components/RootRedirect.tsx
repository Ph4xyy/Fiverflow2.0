import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection racine ULTRA-SIMPLE
 * Ne dépend que de l'AuthContext pour éviter les loops
 */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  // 🔥 SUPPRESSION COMPLÈTE DES TIMEOUTS - Navigation instantanée
  // Plus de timeout, redirection immédiate

  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Redirection immédiate sans délai
  const target = user ? '/dashboard' : '/login';
  console.log('🚀 RootRedirect: Instant redirect to', target, {
    user: !!user,
    loading
  });
  return <Navigate to={target} replace />;

  // 🔥 SUPPRESSION COMPLÈTE - Plus jamais d'écran de chargement
};

export default RootRedirect;
