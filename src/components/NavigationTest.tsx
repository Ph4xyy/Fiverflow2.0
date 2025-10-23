/**
 * NavigationTest - Composant de test pour vérifier la navigation instantanée
 * Affiche les informations d'authentification et permet de tester la navigation
 */

import React, { useState } from 'react';
import { useGlobalAuth } from '../contexts/GlobalAuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Shield, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ArrowRight,
  Home,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

const NavigationTest: React.FC = () => {
  const location = useLocation();
  const { 
    user, 
    session, 
    profile, 
    subscription, 
    isAdmin,
    authLoading,
    profileLoading,
    subscriptionLoading,
    authReady,
    refreshUserData,
    invalidateCache
  } = useGlobalAuth();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testNavigation = async () => {
    addTestResult('🧪 Test de navigation démarré...');
    
    try {
      // Test de rafraîchissement des données
      await refreshUserData();
      addTestResult('✅ Rafraîchissement des données réussi');
      
      // Test d'invalidation du cache
      invalidateCache();
      addTestResult('✅ Invalidation du cache réussie');
      
      addTestResult('🎉 Tous les tests de navigation sont passés !');
    } catch (error) {
      addTestResult(`❌ Erreur lors du test: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Pages de test pour la navigation
  const testPages = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧪 Test de Navigation Instantanée</h1>
        <p className="text-gray-400">Vérification du système d'authentification global et de la persistance en mémoire</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Auth Status */}
        <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Authentification</h3>
            {authReady ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <XCircle className="text-red-400" size={20} />
            )}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-gray-300">
              <User size={16} className="mr-2" />
              {user ? user.email : 'Non connecté'}
            </div>
            <div className="flex items-center text-gray-300">
              <Clock size={16} className="mr-2" />
              {authLoading ? 'Chargement...' : 'Prêt'}
            </div>
          </div>
        </div>

        {/* Profile Status */}
        <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Profil</h3>
            {profile ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <XCircle className="text-red-400" size={20} />
            )}
          </div>
          <div className="space-y-1 text-sm">
            <div className="text-gray-300">
              {profile?.name || 'Non chargé'}
            </div>
            <div className="flex items-center text-gray-300">
              <Clock size={16} className="mr-2" />
              {profileLoading ? 'Chargement...' : 'Prêt'}
            </div>
          </div>
        </div>

        {/* Admin Status */}
        <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Rôle Admin</h3>
            {isAdmin ? (
              <Shield className="text-blue-400" size={20} />
            ) : (
              <User className="text-gray-400" size={20} />
            )}
          </div>
          <div className="text-sm text-gray-300">
            {isAdmin ? 'Administrateur' : 'Utilisateur'}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Abonnement</h3>
            {subscription ? (
              <CreditCard className="text-green-400" size={20} />
            ) : (
              <XCircle className="text-red-400" size={20} />
            )}
          </div>
          <div className="space-y-1 text-sm">
            <div className="text-gray-300">
              {subscription?.plan_name || 'Non chargé'}
            </div>
            <div className="flex items-center text-gray-300">
              <Clock size={16} className="mr-2" />
              {subscriptionLoading ? 'Chargement...' : 'Prêt'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Test */}
      <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🧪 Test de Navigation</h2>
        
        {/* Test Pages */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Pages de Test</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {testPages.map((page) => {
              const Icon = page.icon;
              const isActive = location.pathname === page.path;
              
              return (
                <Link
                  key={page.path}
                  to={page.path}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#0f172a] border-[#35414e] text-gray-300 hover:bg-[#1e2938] hover:text-white'
                  }`}
                >
                  <Icon size={20} className="mr-2" />
                  <span className="text-sm font-medium">{page.label}</span>
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Test Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={testNavigation}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Tester la Navigation
          </button>
          <button
            onClick={clearResults}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Effacer les Résultats
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-[#0f172a] border border-[#35414e] rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Résultats des Tests</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300 font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Location */}
      <div className="bg-[#1e2938] border border-[#35414e] rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-2">📍 Page Actuelle</h3>
        <div className="text-gray-300 font-mono">
          {location.pathname}
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;
