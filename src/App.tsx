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
import TempSubscriptionGuard from './components/TempSubscriptionGuard';
import Layout from './components/Layout';
import Error406Diagnostic from './components/Error406Diagnostic';

// Hook pour le préchargement des données
import { usePreloadData } from './hooks/usePreloadData';

// Pages principales de l'application
import RootRedirect from './components/RootRedirect';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardExample from './pages/DashboardExample';
import PageCalendar from './pages/PageCalendar';
import PagePricing from './pages/PagePricing';
import WorkboardPage from './pages/TasksPage';
import ProfileRedirect from './pages/ProfileRedirect';
import ProfileUsername from './pages/ProfileUsername';
import PageSettings from './pages/PageSettings';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PageClients from './pages/PageClients';
import PageOrders from './pages/PageOrders';
import TemplatesPage from './pages/TemplatesPage';
import StatsPage from './pages/StatsPage';
import OnboardingPage from './pages/OnboardingPage';
import NetworkPage from './pages/NetworkPage';
import PageReferrals from './pages/PageReferrals';
import SuccessPage from './pages/SuccessPage';
import SupportPage from './pages/SupportPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminAIPage from './pages/admin/AdminAIPage';

// Pages d'abonnement Stripe
import CancelPage from './pages/CancelPage';

// Pages légales
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookiePolicy from "./components/CookiePolicy";
import TermsOfService from "./components/TermsOfService";

// Pages de facturation (lazy loading pour optimiser les performances)
const InvoicesLayout = lazy(() => import('./pages/InvoicesLayout'));
const PageInvoices = lazy(() => import('./pages/PageInvoices'));
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
    <Layout>
      <Suspense fallback={null}>
        <Routes>
          {/* Redirection racine intelligente */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Pages publiques */}
          <Route path="/pricing" element={<PagePricing />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard principal - Accessible à tous les abonnements */}
          <Route path="/dashboard" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="Lunch" pageName="dashboard">
                <DashboardExample />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />

          {/* Pages internes du dashboard avec protection par abonnement */}
          <Route path="/clients" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="Lunch" pageName="clients" description="Gestion des clients (max 5 avec Lunch)">
                <PageClients />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/orders" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="Lunch" pageName="orders" description="Gestion des commandes (max 10 avec Lunch)">
                <PageOrders />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/calendar" element={
            <InstantProtectedRoute>
              <TempSubscriptionGuard requiredPlan="Boost" pageName="calendar" description="Calendrier disponible avec Boost">
                <PageCalendar />
              </TempSubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/tasks" element={
            <InstantProtectedRoute>
              <TempSubscriptionGuard requiredPlan="Boost" pageName="workboard" description="Tableau de travail disponible avec Boost">
                <WorkboardPage />
              </TempSubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/templates" element={<InstantProtectedRoute><TemplatesPage /></InstantProtectedRoute>} />
          <Route path="/stats" element={
            <InstantProtectedRoute>
              <TempSubscriptionGuard requiredPlan="Scale" pageName="stats" description="Statistiques avancées disponibles avec Scale">
                <StatsPage />
              </TempSubscriptionGuard>
            </InstantProtectedRoute>
          } />
          {/* Système de profil universel */}
          <Route path="/profile" element={<InstantProtectedRoute><ProfileRedirect /></InstantProtectedRoute>} />
          <Route path="/profile/:username" element={<InstantProtectedRoute><ProfileUsername /></InstantProtectedRoute>} />
          <Route path="/settings" element={<InstantProtectedRoute><PageSettings /></InstantProtectedRoute>} />
          <Route path="/project/:projectId" element={<InstantProtectedRoute><ProjectDetailPage /></InstantProtectedRoute>} />
          <Route path="/network" element={
            <InstantProtectedRoute>
              <TempSubscriptionGuard requiredPlan="Boost" pageName="referrals" description="Système de parrainage disponible avec Boost">
                <NetworkPage />
              </TempSubscriptionGuard>
            </InstantProtectedRoute>
          } />
          <Route path="/upgrade" element={<InstantProtectedRoute><PagePricing /></InstantProtectedRoute>} />
          <Route path="/success" element={<InstantProtectedRoute><SuccessPage /></InstantProtectedRoute>} />
          <Route path="/referrals" element={<InstantProtectedRoute><PageReferrals /></InstantProtectedRoute>} />

          {/* Assistant AI */}
          <Route path="/assistant" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="Lunch" pageName="assistant" description="Assistant AI disponible avec Lunch">
                <AIAssistantPage />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          } />

          {/* Administration - Accès libre pour les admins */}
          <Route path="/admin/dashboard" element={
            <InstantProtectedRoute>
              <AdminRoute><AdminDashboard /></AdminRoute>
            </InstantProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <InstantProtectedRoute>
              <AdminRoute><AdminUsersPage /></AdminRoute>
            </InstantProtectedRoute>
          } />
          <Route path="/admin/stats" element={
            <InstantProtectedRoute>
              <AdminRoute><AdminStatsPage /></AdminRoute>
            </InstantProtectedRoute>
          } />
          <Route path="/admin/ai" element={
            <InstantProtectedRoute>
              <AdminRoute><AdminAIPage /></AdminRoute>
            </InstantProtectedRoute>
          } />

          {/* Diagnostic Erreur 406 (développement uniquement) */}
          {import.meta.env.DEV && (
            <Route path="/error-406-diagnostic" element={<InstantProtectedRoute><Error406Diagnostic /></InstantProtectedRoute>} />
          )}

          {/* Pages légales */}
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Système de facturation (lazy loaded) - Scale uniquement */}
          <Route path="/invoices" element={
            <InstantProtectedRoute>
              <SubscriptionGuard requiredPlan="Scale" pageName="invoices" description="Système de facturation disponible avec Scale">
                <InvoicesLayout />
              </SubscriptionGuard>
            </InstantProtectedRoute>
          }>
            <Route index element={<PageInvoices />} />
            <Route path="sent" element={<PageInvoices />} />
            <Route path="create" element={<PageInvoices />} />
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
    </Layout>
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
