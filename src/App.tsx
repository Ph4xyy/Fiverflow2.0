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
import { ThemeProvider } from './contexts/ThemeContext';
import { ReferralProvider } from './contexts/ReferralContext';

// Composants de protection et d'interface
import InstantProtectedRoute from './components/InstantProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import AnalyticsWrapper from './components/AnalyticsWrapper';
import LoadingDiagnostic from './components/LoadingDiagnostic';
import SubscriptionGuard from './components/SubscriptionGuard';

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
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ClientsPage from './pages/ClientsPageOptimized';
import OrdersPage from './pages/OrdersPage';
import TemplatesPage from './pages/TemplatesPage';
import StatsPage from './pages/StatsPage';
import UpgradePageNew from './pages/UpgradePageNew';
import OnboardingPage from './pages/OnboardingPage';
import NetworkPage from './pages/NetworkPage';
import AdminDashboard from './pages/AdminDashboard';
import ReferralsPage from './pages/ReferralsPage';
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

          {/* Dashboard principal - Accessible à tous les abonnements */}
          <Route path="/dashboard" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="launch" pageName="dashboard">
                <DashboardExample />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />

          {/* Pages internes du dashboard avec protection par abonnement */}
          <Route path="/clients" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="launch" pageName="clients" description="Gestion des clients (max 5 avec Launch)">
                <ClientsPage />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/orders" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="launch" pageName="orders" description="Gestion des commandes (max 10 avec Launch)">
                <OrdersPage />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/calendar" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="boost" pageName="calendar" description="Calendrier disponible avec Boost">
                <CalendarPageNew />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/tasks" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="boost" pageName="workboard" description="Tableau de travail disponible avec Boost">
                <WorkboardPageNew />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/templates" element={<InstantProtectedRoute><TemplatesPage /></InstantProtectedRoute>} />
          <Route path="/stats" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="scale" pageName="stats" description="Statistiques avancées disponibles avec Scale">
                <StatsPage />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/profile" element={<InstantProtectedRoute><ProfilePageNew /></InstantProtectedRoute>} />
          <Route path="/profile-settings" element={<InstantProtectedRoute><ProfileSettingsPage /></InstantProtectedRoute>} />
          <Route path="/network" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="boost" pageName="referrals" description="Système de parrainage disponible avec Boost">
                <NetworkPage />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/upgrade" element={<InstantProtectedRoute><UpgradePageNew /></InstantProtectedRoute>} />
          <Route path="/success" element={<InstantProtectedRoute><SuccessPage /></InstantProtectedRoute>} />
          <Route path="/referrals" element={<InstantProtectedRoute><ReferralsPage /></InstantProtectedRoute>} />

          {/* Administration */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Pages légales */}
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Système de facturation (lazy loaded) - Scale uniquement */}
          <Route path="/invoices" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="scale" pageName="invoices" description="Système de facturation disponible avec Scale">
                <InvoicesLayout />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          }>
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
        <ThemeProvider>
          <ReferralProvider>
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
          </ReferralProvider>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}


export default App;
