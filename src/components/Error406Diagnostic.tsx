/**
 * Error406Diagnostic - Composant de diagnostic pour l'erreur 406
 * 
 * Affiche les informations de diagnostic et propose des solutions
 * pour résoudre l'erreur 406 "Not Acceptable"
 */

import React, { useState, useEffect } from 'react';
import { diagnoseError406, checkSupabaseHealth } from '../utils/errorDiagnostic';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Info,
  Database,
  Shield,
  User,
  Settings
} from 'lucide-react';

interface DiagnosticResult {
  hasError: boolean;
  errorType: string;
  errorMessage: string;
  suggestions: string[];
  canContinue: boolean;
}

interface HealthResult {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}

const Error406Diagnostic: React.FC = () => {
  const { user } = useAuth();
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const [diagnosticResult, healthResult] = await Promise.all([
        diagnoseError406(),
        checkSupabaseHealth()
      ]);
      
      setDiagnostic(diagnosticResult);
      setHealth(healthResult);
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (hasError: boolean) => {
    if (hasError) {
      return <XCircle className="text-red-400" size={24} />;
    }
    return <CheckCircle className="text-green-400" size={24} />;
  };

  const getStatusColor = (hasError: boolean) => {
    return hasError ? 'text-red-400' : 'text-green-400';
  };

  const getStatusBg = (hasError: boolean) => {
    return hasError ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🔍 Diagnostic Erreur 406</h1>
        <p className="text-gray-400">Diagnostic et résolution de l'erreur "Not Acceptable"</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Diagnostic en cours...' : 'Relancer le Diagnostic'}
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Info size={16} className="mr-2" />
          {showDetails ? 'Masquer les Détails' : 'Afficher les Détails'}
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diagnostic Status */}
        <div className={`p-4 rounded-lg border ${diagnostic ? getStatusBg(diagnostic.hasError) : 'bg-gray-900/20 border-gray-500/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold flex items-center">
              <Database size={20} className="mr-2" />
              Diagnostic Général
            </h3>
            {diagnostic && getStatusIcon(diagnostic.hasError)}
          </div>
          <div className="text-sm">
            {diagnostic ? (
              <div className={`${getStatusColor(diagnostic.hasError)}`}>
                {diagnostic.hasError ? (
                  <div>
                    <div className="font-medium">{diagnostic.errorType}</div>
                    <div className="text-gray-300 mt-1">{diagnostic.errorMessage}</div>
                  </div>
                ) : (
                  <div>Aucune erreur détectée</div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Diagnostic en cours...</div>
            )}
          </div>
        </div>

        {/* Health Status */}
        <div className={`p-4 rounded-lg border ${health ? getStatusBg(!health.isHealthy) : 'bg-gray-900/20 border-gray-500/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold flex items-center">
              <Shield size={20} className="mr-2" />
              Santé Supabase
            </h3>
            {health && getStatusIcon(!health.isHealthy)}
          </div>
          <div className="text-sm">
            {health ? (
              <div className={`${getStatusColor(health.isHealthy)}`}>
                {health.isHealthy ? (
                  <div>Système en bonne santé</div>
                ) : (
                  <div>
                    <div className="font-medium">{health.issues.length} problème(s) détecté(s)</div>
                    <div className="text-gray-300 mt-1">{health.issues[0]}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Vérification en cours...</div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
          <h3 className="text-white font-semibold flex items-center mb-2">
            <User size={20} className="mr-2" />
            Informations Utilisateur
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div>ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Authentifié: {user ? 'Oui' : 'Non'}</div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {showDetails && (
        <div className="space-y-4">
          {/* Diagnostic Details */}
          {diagnostic && (
            <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Détails du Diagnostic</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Type d'erreur:</span>
                  <span className="ml-2 text-white">{diagnostic.errorType || 'Aucune'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Message:</span>
                  <span className="ml-2 text-white">{diagnostic.errorMessage || 'Aucune erreur'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Peut continuer:</span>
                  <span className={`ml-2 ${diagnostic.canContinue ? 'text-green-400' : 'text-red-400'}`}>
                    {diagnostic.canContinue ? 'Oui' : 'Non'}
                  </span>
                </div>
                {diagnostic.suggestions.length > 0 && (
                  <div>
                    <span className="text-gray-400">Suggestions:</span>
                    <ul className="mt-1 ml-4 list-disc text-gray-300">
                      {diagnostic.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Details */}
          {health && (
            <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Détails de Santé</h3>
              <div className="space-y-3 text-sm">
                {health.issues.length > 0 && (
                  <div>
                    <span className="text-red-400 font-medium">Problèmes détectés:</span>
                    <ul className="mt-1 ml-4 list-disc text-gray-300">
                      {health.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {health.recommendations.length > 0 && (
                  <div>
                    <span className="text-blue-400 font-medium">Recommandations:</span>
                    <ul className="mt-1 ml-4 list-disc text-gray-300">
                      {health.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
        <h3 className="text-white font-semibold flex items-center mb-3">
          <Settings size={20} className="mr-2" />
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Recharger la Page
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <AlertTriangle size={16} className="mr-2" />
            Nettoyer le Cache
          </button>
          <button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.location.href = window.location.href;
              }
            }}
            className="flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Info size={16} className="mr-2" />
            Nouvel Onglet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error406Diagnostic;
