import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface InstantProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

/**
 * Protected route that requires authentication
 */
const InstantProtectedRoute: React.FC<InstantProtectedRouteProps> = ({ children }) => {
  const { user, authReady } = useAuth();
  
  // Show loading while auth is initializing
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c68f2] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  return <>{children}</>;
};

export default InstantProtectedRoute;