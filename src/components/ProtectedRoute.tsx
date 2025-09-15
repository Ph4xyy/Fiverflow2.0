import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Optional: if you have this context, it will be used; otherwise we fall back to sessionStorage/app_metadata
let useUserData: undefined | (() => { role?: string | null; loading?: boolean }) = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-expect-error dynamic optional import
  const mod = require('../contexts/UserDataContext');
  useUserData = mod?.useUserData as typeof useUserData;
} catch { /* no-op */ }

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Try to get role from UserDataContext if present; otherwise fallback to cached/session values
  const userData = useUserData ? useUserData() : { role: null, loading: false };
  const roleFromCache =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    sessionStorage.getItem('role');

  const effectiveRole = (userData?.role ?? roleFromCache ?? null) as string | null;
  const roleLoading = Boolean(userData?.loading);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
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
