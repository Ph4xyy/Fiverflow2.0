/**
 * App.tsx - Point d'entrée principal de l'application FiverFlow
 * 
 * Cette application utilise une architecture modulaire avec :
 * - Contextes pour la gestion d'état global (Auth, UserData, Loading, Currency)
 * - Routes protégées avec authentification instantanée
 * - Lazy loading pour optimiser les performances
 * - Système de diagnostic pour le développement
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contextes pour la gestion d'état global
import { AuthProvider } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Composants de protection et d'interface
import InstantProtectedRoute from './components/InstantProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import AnalyticsWrapper from './components/AnalyticsWrapper';
import LoadingDiagnostic from './components/LoadingDiagnostic';

// Hook pour le préchargement des données
import { usePreloadData } from './hooks/usePreloadData';

// Pages principales de l'application
import RootRedirect from './components/RootRedirect';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardExample from './pages/DashboardExample';
import ProtectedRoute from './components/ProtectedRoute';
import CalendarPageNew from './pages/CalendarPageNew';
import PricingPageNew from './pages/PricingPageNew';
import WorkboardPageNew from './pages/WorkboardPageNew';
import ProfilePageNew from './pages/ProfilePageNew';
import ClientsPage from './pages/ClientsPageOptimized';
import OrdersPage from './pages/OrdersPage';
import TemplatesPage from './pages/TemplatesPage';
import StatsPage from './pages/StatsPage';
import UpgradePageNew from './pages/UpgradePageNew';
import OnboardingPage from './pages/OnboardingPage';
import NetworkPage from './pages/NetworkPage';
import AdminDashboard from './pages/AdminDashboard';
import SuccessPage from './pages/SuccessPage';
import SupportPage from './pages/SupportPage';

// Pages légales
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookiePolicy from "./components/CookiePolicy";
import TermsOfService from "./components/TermsOfService";

// Pages de facturation (lazy loading pour optimiser les performances)
const InvoicesLayout = lazy(() => import('./pages/InvoicesLayout'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const InvoiceTemplatesPage = lazy(() => import('./pages/InvoiceTemplatesPage'));
const InvoiceTemplateEditorPage = lazy(() => import('./pages/InvoiceTemplateEditorPage'));


/**
 * AppContent - Composant principal contenant toutes les routes
 * Utilise le préchargement des données pour optimiser les performances
 */
function AppContent() {
  // 🔥 Préchargement des données en arrière-plan pour une navigation instantanée
  usePreloadData();

  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          {/* Redirection racine intelligente */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Pages publiques */}
          <Route path="/pricing" element={<PricingPageNew />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard principal */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardExample />
            </ProtectedRoute>
          } />

          {/* Pages internes du dashboard (toutes protégées) */}
          <Route path="/clients" element={<InstantProtectedRoute><ClientsPage /></InstantProtectedRoute>} />
          <Route path="/orders" element={<InstantProtectedRoute><OrdersPage /></InstantProtectedRoute>} />
          <Route path="/calendar" element={<InstantProtectedRoute><CalendarPageNew /></InstantProtectedRoute>} />
          <Route path="/tasks" element={<InstantProtectedRoute><WorkboardPageNew /></InstantProtectedRoute>} />
          <Route path="/templates" element={<InstantProtectedRoute><TemplatesPage /></InstantProtectedRoute>} />
          <Route path="/stats" element={<InstantProtectedRoute><StatsPage /></InstantProtectedRoute>} />
          <Route path="/profile" element={<InstantProtectedRoute><ProfilePageNew /></InstantProtectedRoute>} />
          <Route path="/network" element={<InstantProtectedRoute><NetworkPage /></InstantProtectedRoute>} />
          <Route path="/upgrade" element={<InstantProtectedRoute><UpgradePageNew /></InstantProtectedRoute>} />
          <Route path="/success" element={<InstantProtectedRoute><SuccessPage /></InstantProtectedRoute>} />

          {/* Administration */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Pages légales */}
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Système de facturation (lazy loaded) */}
          <Route path="/invoices" element={<InstantProtectedRoute><InvoicesLayout /></InstantProtectedRoute>}>
            <Route index element={<InvoicesPage />} />
            <Route path="sent" element={<InvoicesPage />} />
            <Route path="create" element={<InvoicesPage />} />
            <Route path="templates" element={<InvoiceTemplatesPage />} />
            <Route path="templates/:id" element={<InvoiceTemplateEditorPage />} />
          </Route>

          {/* Onboarding pour nouveaux utilisateurs */}
          <Route path="/onboarding" element={<InstantProtectedRoute><OnboardingPage /></InstantProtectedRoute>} />
        </Routes>
      </Suspense>
      
      {/* Composants de debug - seulement en développement */}
      {import.meta.env.DEV && (
        <>
          {/* Debug components removed for cleaner code */}
        </>
      )}
      
      {/* Diagnostic de chargement - visible avec Ctrl+Shift+L */}
      <LoadingDiagnostic />
    </>
  );
}

/**
 * App - Composant racine de l'application
 * Configure tous les contextes et providers nécessaires
 */
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
      </AuthProvider>
    </AppErrorBoundary>
  );
}


export default App;
