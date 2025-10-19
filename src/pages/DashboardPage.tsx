/**
 * DashboardPage - Page d'accueil du dashboard
 * 
 * Fonctionnalités :
 * - Affichage des informations utilisateur
 * - Bouton de déconnexion
 * - Interface moderne et responsive
 * - Gestion de la déconnexion
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail, Calendar, Settings } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold text-white">FiverFlow</h1>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenue, {user?.user_metadata?.first_name || 'Utilisateur'} !
          </h2>
          <p className="text-slate-400">
            Gérez vos projets et clients depuis votre tableau de bord FiverFlow
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations du compte
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Membre depuis</p>
                  <p className="text-white font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Nom complet</p>
                  <p className="text-white font-medium">
                    {user?.user_metadata?.full_name || 'Non défini'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Statut</p>
                  <p className="text-green-400 font-medium">
                    {user?.email_confirmed_at ? 'Compte vérifié' : 'En attente de vérification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Clients</h3>
            <p className="text-slate-400 text-sm mb-4">Gérez vos clients et prospects</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Voir les clients
            </button>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Projets</h3>
            <p className="text-slate-400 text-sm mb-4">Suivez vos projets en cours</p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
              Voir les projets
            </button>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Factures</h3>
            <p className="text-slate-400 text-sm mb-4">Gérez vos factures et paiements</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
              Voir les factures
            </button>
          </div>
        </div>

        {/* Debug Info (en développement) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Debug Info</h3>
            <pre className="text-xs text-slate-400 bg-slate-900/50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
