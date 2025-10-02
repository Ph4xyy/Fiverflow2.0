import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Components
import AppErrorBoundary from './components/AppErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import MinimalDiagnostic from './components/MinimalDiagnostic';

// Pages - Lazy loaded
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

// Ultra-simple Root Redirect
const MinimalRootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  
  console.log('🔍 MinimalRootRedirect:', { user: !!user, loading });
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-white text-sm">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

/**
 * Version ULTRA-MINIMALE de l'App
 * Pour identifier le problème exact
 */
function AppMinimal() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-slate-900">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    <p className="text-white text-sm">Chargement...</p>
                  </div>
                </div>
              }>
                <Routes>
                  {/* Redirection racine */}
                  <Route path="/" element={<MinimalRootRedirect />} />
                  
                  {/* Pages de base */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Dashboard protégé */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
              
              {/* Minimal Diagnostic */}
              <MinimalDiagnostic />
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#f1f5f9',
                    border: '1px solid #334155',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}

export default AppMinimal;
