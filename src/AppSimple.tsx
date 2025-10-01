import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Components
import AppErrorBoundary from './components/AppErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleDiagnostic from './components/SimpleDiagnostic';

// Pages - Lazy loaded
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));

// Simple Root Redirect Component
const SimpleRootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  
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
 * Version ULTRA-SIMPLIFIÉE de l'App
 * Élimine tous les composants qui peuvent causer des loading loops
 */
function AppSimple() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <UserDataProvider>
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
                    <Route path="/" element={<SimpleRootRedirect />} />
                    
                    {/* Pages publiques */}
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Pages protégées */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Suspense>
                
                {/* Simple Diagnostic */}
                <SimpleDiagnostic />
                
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
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#f1f5f9',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#f1f5f9',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </UserDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}

export default AppSimple;
