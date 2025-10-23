import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import ModernButton from './ModernButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-[#2a3441] rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Oups ! Quelque chose s'est mal passé
              </h1>
              
              <p className="text-gray-400 mb-6">
                Une erreur inattendue s'est produite. Ne vous inquiétez pas, vos données sont en sécurité.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="bg-[#1a1f2e] rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Détails de l'erreur :</h3>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <ModernButton 
                  variant="outline" 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Réessayer
                </ModernButton>
                
                <ModernButton 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home size={16} />
                  Retour au tableau de bord
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
