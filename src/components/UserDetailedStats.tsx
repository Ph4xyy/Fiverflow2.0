import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  FileText, 
  ShoppingCart, 
  Users,
  Crown,
  Activity,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface UserDetailedStatsProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  user_profile: {
    user_id: string;
    full_name: string;
    email: string;
    username: string;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    website?: string;
    phone?: string;
  };
  subscription: {
    plan_name: string;
    plan_price: number;
    subscription_status: string;
    billing_cycle: string;
    amount: number;
    start_date: string;
    end_date?: string;
  };
  stats: {
    orders_count: number;
    invoices_count: number;
    clients_count: number;
    total_orders_revenue: number;
    total_invoices_revenue: number;
    total_revenue: number;
  };
}

const UserDetailedStats: React.FC<UserDetailedStatsProps> = ({ userId, isOpen, onClose }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserStats();
    }
  }, [isOpen, userId]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: statsError } = await supabase
        .rpc('get_user_detailed_stats', { user_uuid: userId });

      if (statsError) {
        console.error('Erreur lors du chargement des statistiques:', statsError);
        setError('Erreur lors du chargement des statistiques');
        return;
      }

      if (data) {
        setStats(data);
        console.log('📊 Statistiques utilisateur chargées:', data);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Statistiques Détaillées
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {stats && (
            <div className="space-y-6">
              {/* Profil Utilisateur */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profil Utilisateur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nom complet</p>
                    <p className="font-medium">{stats.user_profile.full_name || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium">{stats.user_profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                    <p className="font-medium">@{stats.user_profile.username || 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                    <div className="flex items-center">
                      {stats.user_profile.is_admin && (
                        <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stats.user_profile.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {stats.user_profile.is_active ? 'Actif' : 'Inactif'}
                        {stats.user_profile.is_admin && ' • Admin'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Membre depuis</p>
                    <p className="font-medium">{formatDate(stats.user_profile.created_at)}</p>
                  </div>
                  {stats.user_profile.location && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Localisation</p>
                      <p className="font-medium">{stats.user_profile.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Abonnement */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Abonnement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                    <p className="font-medium capitalize">{stats.subscription.plan_name || 'Aucun'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prix</p>
                    <p className="font-medium">{formatCurrency(stats.subscription.amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cycle de facturation</p>
                    <p className="font-medium capitalize">{stats.subscription.billing_cycle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stats.subscription.subscription_status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {stats.subscription.subscription_status || 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques d'Activité */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Statistiques d'Activité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <ShoppingCart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.stats.orders_count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Commandes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatCurrency(stats.stats.total_orders_revenue)} de revenus
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.stats.invoices_count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Factures</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatCurrency(stats.stats.total_invoices_revenue)} de revenus
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.stats.clients_count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Clients</p>
                    </div>
                  </div>
                </div>
                
                {/* Revenus Totaux */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Revenus Totaux
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(stats.stats.total_revenue)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Commandes + Factures
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailedStats;
