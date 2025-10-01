import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  // Try to get role from UserDataContext if present; otherwise fallback to cached/session values
  const userData = useUserData();
  const roleFromCache =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    sessionStorage.getItem('role');

  const effectiveRole = (userData?.role ?? roleFromCache ?? null) as string | null;
  const roleLoading = Boolean(userData?.loading);

  // Listen for session refresh to re-evaluate access
  useEffect(() => {
    const onRefreshed = () => {
      console.log('🔄 ProtectedRoute: Session refreshed, re-evaluating access...');
      // Force re-evaluation with a small delay to ensure contexts are updated
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
    };
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', onRefreshed as any);
  }, []);

  if (loading || roleLoading) {
    console.log('🔄 ProtectedRoute: Loading state - auth:', loading, 'role:', roleLoading);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mx-auto" />
          <p className="mt-2 text-gray-600 dark:text-gray-300">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && effectiveRole !== 'admin') {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
