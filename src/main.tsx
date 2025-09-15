import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.tsx';
import './index.css';

/** Pare-chocs global pour éviter l’écran blanc en cas d’erreur non rattrapée */
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // log optionnel
    console.error('[GlobalErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
          <div className="max-w-md w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Oups, une erreur est survenue</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              L’application a rencontré un problème. Essayez d’actualiser la page. Si cela persiste, reconnectez-vous.
            </p>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Actualiser
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      {/* Un seul AuthProvider ici (on retire celui de App.tsx) */}
      <AuthProvider>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#064e3b',
                  color: '#d1fae5',
                  border: '1px solid #059669',
                },
                iconTheme: {
                  primary: '#39d353',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#7f1d1d',
                  color: '#fecaca',
                  border: '1px solid #dc2626',
                },
                iconTheme: {
                  primary: '#ff6b6b',
                  secondary: '#fff',
                },
              },
              loading: {
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                },
                iconTheme: {
                  primary: '#4a9eff',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
