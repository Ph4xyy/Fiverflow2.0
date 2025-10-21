import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import App from './App.tsx';
import './index.css';
import './utils/cleanAuth'; // Importer l'utilitaire de nettoyage
import { ReferralTracker } from './services/referralTracker';

/** Initialisation du thème - sera géré par ThemeProvider */
try {
  // Ne pas forcer le thème, laisser ThemeProvider gérer cela
} catch {}

/** Initialisation du tracking des parrainages */
try {
  ReferralTracker.initialize();
} catch {}

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
    console.error('[GlobalErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
          <div className="max-w-md w-full rounded-xl border border-slate-700 bg-slate-900 p-6 text-center">
            <h1 className="text-lg font-semibold text-white mb-2">Oops, an error occurred</h1>
            <p className="text-sm text-gray-300 mb-4">
              The application encountered a problem. Try refreshing the page. If this persists, please sign in again.
            </p>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
            >
              Refresh
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
      <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937', // gris foncé
              color: '#f9fafb', // texte clair
              border: '1px solid #374151',
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
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              iconTheme: {
                primary: '#4a9eff',
                secondary: '#fff',
              },
            },
          }}
        />
    </GlobalErrorBoundary>
  </StrictMode>
);
