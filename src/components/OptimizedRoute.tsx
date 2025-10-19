import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';
import { useAuth } from '../contexts/AuthContext';

interface OptimizedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
  showLoader?: boolean;
}

const OptimizedRoute: React.FC<OptimizedRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
  showLoader = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const { 
    isInitialized, 
    isLoading, 
    hasPermission, 
    isPagePublic, 
    shouldRedirect 
  } = usePermissions();

  // Configuration des pages protégées
  const PROTECTED_PAGES: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/clients': 'clients',
    '/orders': 'orders',
    '/calendar': 'calendar',
    '/network': 'referrals',
    '/tasks': 'workboard',
    '/stats': 'stats',
    '/invoices': 'invoices',
    '/admin/dashboard': 'admin'
  };

  useEffect(() => {
    // Ne rien faire si la page est publique
    if (isPagePublic(location.pathname)) {
      return;
    }

    // Attendre que l'auth soit prêt
    if (!authReady) {
      return;
    }

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      console.log('🔄 OptimizedRoute: Pas d\'utilisateur, redirection vers /login');
      navigate('/login', { replace: true });
      return;
    }

    // Attendre que les permissions soient initialisées
    if (!isInitialized) {
      return;
    }

    // Vérifier les permissions
    const pagePermission = requiredPermission || PROTECTED_PAGES[location.pathname];
    
    if (pagePermission && !hasPermission(pagePermission as any)) {
      console.log('🔄 OptimizedRoute: Pas de permission pour', location.pathname, 'redirection vers', fallbackPath);
      navigate(fallbackPath, { replace: true });
      return;
    }

    // Vérifier si la page nécessite une redirection
    if (shouldRedirect(location.pathname)) {
      console.log('🔄 OptimizedRoute: Redirection nécessaire pour', location.pathname);
      navigate(fallbackPath, { replace: true });
      return;
    }

  }, [
    location.pathname, 
    user, 
    authReady, 
    isInitialized, 
    hasPermission, 
    isPagePublic, 
    shouldRedirect, 
    requiredPermission, 
    fallbackPath, 
    navigate
  ]);

  // Afficher un loader minimal si nécessaire
  if (showLoader && (!authReady || !isInitialized)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c68f2]"></div>
      </div>
    );
  }

  // Pour les pages publiques, afficher immédiatement
  if (isPagePublic(location.pathname)) {
    return <>{children}</>;
  }

  // Pour les pages protégées, attendre que tout soit prêt
  if (!authReady || !isInitialized) {
    return null; // Pas de loader, juste attendre
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  // Vérifier les permissions une dernière fois
  const pagePermission = requiredPermission || PROTECTED_PAGES[location.pathname];
  if (pagePermission && !hasPermission(pagePermission as any)) {
    return null; // Redirection en cours
  }

  // Tout est OK, afficher le contenu
  return <>{children}</>;
};

export default OptimizedRoute;
