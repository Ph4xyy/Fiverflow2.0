import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Version ultra-simple de la redirection racine
 * Utilisée en cas de problème avec RootRedirect
 */
const SimpleRootRedirect: React.FC = () => {
  const { user } = useAuth();
  
  console.log('🚀 SimpleRootRedirect: User =', user ? 'connected' : 'not connected');
  
  // Redirection immédiate sans attendre le loading
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default SimpleRootRedirect;
