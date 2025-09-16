import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UserDataProvider } from './contexts/UserDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import { AnimatePresence, motion } from "framer-motion";

// Core pages
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

// PageWrapper pour animations et scroll en haut
const PageWrapper: React.FC<{ children: React.ReactNode, isDashboard?: boolean }> = ({ children, isDashboard = false }) => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const variants = isDashboard
    ? {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: isDashboard ? 0.5 : 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Routes animées avec AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
        <Route path="/support" element={<PageWrapper><SupportPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        <Route path="/onboarding" element={<ProtectedRoute><PageWrapper><OnboardingPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper isDashboard><DashboardPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><PageWrapper><ClientsPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PageWrapper><OrdersPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><PageWrapper><CalendarPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><PageWrapper><TasksPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><PageWrapper><TemplatesPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><PageWrapper><StatsPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><PageWrapper><NetworkPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><PageWrapper><UpgradePage /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><PageWrapper isDashboard><AdminDashboard /></PageWrapper></AdminRoute>} />
        <Route path="/success" element={<ProtectedRoute><PageWrapper><SuccessPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/terms-of-service" element={<ProtectedRoute><PageWrapper><TermsOfService /></PageWrapper></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<ProtectedRoute><PageWrapper><PrivacyPolicy /></PageWrapper></ProtectedRoute>} />
        <Route path="/cookie-policy" element={<ProtectedRoute><PageWrapper><CookiePolicy /></PageWrapper></ProtectedRoute>} />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <PageWrapper><InvoicesLayout /></PageWrapper>
            </ProtectedRoute>
          }
        >
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
