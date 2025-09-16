// src/App.tsx
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import { UserDataProvider } from './contexts/UserDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
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
import TasksPage from './pages/TasksPage';
import SuccessPage from './pages/SuccessPage';
import SupportPage from './pages/SupportPage';
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookiePolicy from "./components/CookiePolicy";
import TermsOfService from "./components/TermsOfService";

// Lazy invoices
const InvoicesLayout = lazy(() => import('./pages/InvoicesLayout'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const InvoiceTemplatesPage = lazy(() => import('./pages/InvoiceTemplatesPage'));
const InvoiceTemplateEditorPage = lazy(() => import('./pages/InvoiceTemplateEditorPage'));

// === Wrappers pour animations === //

// Pages normales (animation quasi nulle)
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 1 }}
  >
    {children}
  </motion.div>
);

// Dashboard (animation "portal" uniquement si playAnimation = true)
const DashboardWrapper: React.FC<{ children: React.ReactNode; playAnimation: boolean }> = ({ children, playAnimation }) => (
  <motion.div
    initial={playAnimation ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: playAnimation ? 0.8 : 0 }}
  >
    {children}
  </motion.div>
);

// Gestion des routes animées
const AnimatedRoutes = () => {
  const location = useLocation();
  const [prevPath, setPrevPath] = useState<string>('');
  const [playDashboardAnimation, setPlayDashboardAnimation] = useState(false);

  useEffect(() => {
    // Animation dashboard seulement quand on arrive depuis une autre page
    if (location.pathname === '/dashboard' && prevPath !== '/dashboard') {
      setPlayDashboardAnimation(true);
    } else {
      setPlayDashboardAnimation(false);
    }
    setPrevPath(location.pathname);
    // Scroll top automatique à chaque changement de page
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Pages publiques */}
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
        <Route path="/support" element={<PageWrapper><SupportPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        {/* Pages protégées */}
        <Route path="/onboarding" element={<ProtectedRoute><PageWrapper><OnboardingPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardWrapper playAnimation={playDashboardAnimation}>
              <DashboardPage />
            </DashboardWrapper>
          </ProtectedRoute>
        } />
        <Route path="/clients" element={<ProtectedRoute><PageWrapper><ClientsPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PageWrapper><OrdersPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><PageWrapper><CalendarPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><PageWrapper><TasksPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><PageWrapper><TemplatesPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><PageWrapper><StatsPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><PageWrapper><NetworkPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><PageWrapper><UpgradePage /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><PageWrapper><AdminDashboard /></PageWrapper></AdminRoute>} />
        <Route path="/success" element={<ProtectedRoute><PageWrapper><SuccessPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/terms-of-service" element={<ProtectedRoute><PageWrapper><TermsOfService /></PageWrapper></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<ProtectedRoute><PageWrapper><PrivacyPolicy /></PageWrapper></ProtectedRoute>} />
        <Route path="/cookie-policy" element={<ProtectedRoute><PageWrapper><CookiePolicy /></PageWrapper></ProtectedRoute>} />

        {/* Invoices */}
        <Route path="/invoices" element={<ProtectedRoute><PageWrapper><InvoicesLayout /></PageWrapper></ProtectedRoute>} >
          <Route index element={<InvoicesPage />} />
          <Route path="sent" element={<InvoicesPage />} />
          <Route path="create" element={<InvoicesPage />} />
          <Route path="templates" element={<InvoiceTemplatesPage />} />
          <Route path="templates/:id" element={<InvoiceTemplateEditorPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

// === App principal === //
function App() {
  return (
    <AppErrorBoundary>
      <UserDataProvider>
        <Router>
          <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <AnimatedRoutes />
          </Suspense>
        </Router>
      </UserDataProvider>
    </AppErrorBoundary>
  );
}

export default App;
