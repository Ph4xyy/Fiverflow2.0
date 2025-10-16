// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import InstantProtectedRoute from './components/InstantProtectedRoute';
import SmartProtectedRoute from './components/SmartProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import AnalyticsWrapper from './components/AnalyticsWrapper';
// import { GlobalLoadingManager } from './components/GlobalLoadingManager';
import DiagnosticPanel from './components/DiagnosticPanel';
import EnvironmentDiagnostic from './components/EnvironmentDiagnostic';
import SessionTest from './components/SessionTest';
import AuthDiagnostic from './components/AuthDiagnostic';
import SessionDiagnostic from './components/SessionDiagnostic';
import LoadingDiagnostic from './components/LoadingDiagnostic';
import { usePlanRestrictions } from './hooks/usePlanRestrictions';
//import { useSessionManager } from './hooks/useSessionManager';

// Core pages
import RootRedirect from './components/RootRedirect';
import SmartRootRedirect from './components/SmartRootRedirect';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import OrdersPage from './pages/OrdersPage';
import TemplatesPage from './pages/TemplatesPage';
import StatsPage from './pages/StatsPage';
import UpgradePage from './pages/UpgradePage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import PricingPage from './pages/PricingPage';
import NetworkPage from './pages/NetworkPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CalendarPage from './pages/CalendarPage';
import WorkboardPage from './pages/TasksPage';
import SuccessPage from './pages/SuccessPage';
import SupportPage from './pages/SupportPage';
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookiePolicy from "./components/CookiePolicy";
import TermsOfService from "./components/TermsOfService";
// removed old TodoListPage after consolidation

// Lazy invoices
const InvoicesLayout = lazy(() => import('./pages/InvoicesLayout'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const InvoiceTemplatesPage = lazy(() => import('./pages/InvoiceTemplatesPage'));
const InvoiceTemplateEditorPage = lazy(() => import('./pages/InvoiceTemplateEditorPage'));

/** 
 * PlanGate : garde d'accès par feature
 */
const PlanGate: React.FC<{ feature: 'calendar' | 'referrals' | 'stats' | 'tasks' | 'invoices'; children: React.ReactNode }> = ({ feature, children }) => {
  const { checkAccess, loading } = usePlanRestrictions();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }
  if (!checkAccess(feature)) {
    return <Navigate to="/upgrade" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <Router>
          <AnalyticsWrapper>
            <LoadingProvider>
              <CurrencyProvider>
                <UserDataProvider>
                <Suspense fallback={<div />}>
  <Routes>...</Routes>
</Suspense>
                     {/* Composants de debug - seulement en développement */}
                     {import.meta.env.DEV && (
                       <>
                         <DiagnosticPanel />
                         <EnvironmentDiagnostic />
                         <SessionTest />
                         <AuthDiagnostic />
                         <SessionDiagnostic />
                       </>
                     )}
                     {/* Loading Diagnostic - visible avec Ctrl+Shift+L */}
                     <LoadingDiagnostic />
                </UserDataProvider>
              </CurrencyProvider>
            </LoadingProvider>
          </AnalyticsWrapper>
        </Router>
        {/* EmergencyFallback temporairement désactivé pour debugging */}
        {/* <EmergencyFallback /> */}
      </AuthProvider>
    </AppErrorBoundary>
  );
}

/**
 * Wrapper pour initialiser le gestionnaire de session
 */
const SessionManagerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSessionManager(); // Initialiser le gestionnaire de session
  return <>{children}</>;
};

export default App;
