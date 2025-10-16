// src/App.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import InstantProtectedRoute from './components/InstantProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import AnalyticsWrapper from './components/AnalyticsWrapper';
import { usePreloadData } from './hooks/usePreloadData';
// import { GlobalLoadingManager } from './components/GlobalLoadingManager';
import DiagnosticPanel from './components/DiagnosticPanel';
import EnvironmentDiagnostic from './components/EnvironmentDiagnostic';
import SessionTest from './components/SessionTest';
import AuthDiagnostic from './components/AuthDiagnostic';
import SessionDiagnostic from './components/SessionDiagnostic';
import LoadingDiagnostic from './components/LoadingDiagnostic';
//import { useSessionManager } from './hooks/useSessionManager';

// Core pages
import RootRedirect from './components/RootRedirect';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPageOptimized';
import ClientsPage from './pages/ClientsPageOptimized';
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


function AppContent() {
  // 🔥 Préchargement des données en arrière-plan
  usePreloadData();

  return (
    <>
      <Suspense fallback={null}>
        <Routes>
              {/* Redirection racine intelligente */}
              <Route path="/" element={<RootRedirect />} />
              {/* Pages publiques */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={
                <InstantProtectedRoute>
                  <DashboardPage />
                </InstantProtectedRoute>
              } />

              {/* Autres pages internes du dashboard */}
              <Route path="/clients" element={<InstantProtectedRoute><ClientsPage /></InstantProtectedRoute>} />
              <Route path="/orders" element={<InstantProtectedRoute><OrdersPage /></InstantProtectedRoute>} />
              <Route path="/calendar" element={<InstantProtectedRoute><CalendarPage /></InstantProtectedRoute>} />
              <Route path="/tasks" element={<InstantProtectedRoute><WorkboardPage /></InstantProtectedRoute>} />
              <Route path="/templates" element={<InstantProtectedRoute><TemplatesPage /></InstantProtectedRoute>} />
              <Route path="/stats" element={<InstantProtectedRoute><StatsPage /></InstantProtectedRoute>} />
              <Route path="/profile" element={<InstantProtectedRoute><ProfilePage /></InstantProtectedRoute>} />
              <Route path="/network" element={<InstantProtectedRoute><NetworkPage /></InstantProtectedRoute>} />
              <Route path="/upgrade" element={<InstantProtectedRoute><UpgradePage /></InstantProtectedRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/success" element={<InstantProtectedRoute><SuccessPage /></InstantProtectedRoute>} />

              {/* Old To-Do route removed; consolidated into /tasks (Workboard) */}

              {/* Pages légales */}
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />

              {/* Invoices */}
              <Route path="/invoices" element={<InstantProtectedRoute><InvoicesLayout /></InstantProtectedRoute>}>
                <Route index element={<InvoicesPage />} />
                <Route path="sent" element={<InvoicesPage />} />
                <Route path="create" element={<InvoicesPage />} />
                <Route path="templates" element={<InvoiceTemplatesPage />} />
                <Route path="templates/:id" element={<InvoiceTemplateEditorPage />} />
              </Route>

              {/* Onboarding */}
              <Route path="/onboarding" element={<InstantProtectedRoute><OnboardingPage /></InstantProtectedRoute>} />
              </Routes>
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
    </>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <Router>
          <AnalyticsWrapper>
            <LoadingProvider>
              <CurrencyProvider>
                <UserDataProvider>
                  <AppContent />
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


export default App;
