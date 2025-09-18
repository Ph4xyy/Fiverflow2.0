// src/App.tsx
import "./i18n"; 
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserDataProvider } from './contexts/UserDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppErrorBoundary from './components/AppErrorBoundary';

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

function App() {
  return (
    <AppErrorBoundary>
      <UserDataProvider>
        <Router>
          <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <Routes>
              {/* Pages publiques */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              {/* Autres pages internes du dashboard */}
              <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />

              {/* Pages légales */}
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />

              {/* Invoices */}
              <Route path="/invoices" element={<ProtectedRoute><InvoicesLayout /></ProtectedRoute>}>
                <Route index element={<InvoicesPage />} />
                <Route path="sent" element={<InvoicesPage />} />
                <Route path="create" element={<InvoicesPage />} />
                <Route path="templates" element={<InvoiceTemplatesPage />} />
                <Route path="templates/:id" element={<InvoiceTemplateEditorPage />} />
              </Route>

              {/* Onboarding */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Router>
      </UserDataProvider>
    </AppErrorBoundary>
  );
}

export default App;
