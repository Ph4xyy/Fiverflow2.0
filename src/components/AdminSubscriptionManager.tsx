import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAdminStats } from '../hooks/useAdminStats';
import { Crown, Users, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminSubscriptionManagerProps {
  startDate: string;
  endDate: string;
}

const AdminSubscriptionManager: React.FC<AdminSubscriptionManagerProps> = ({ startDate, endDate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'trial' | 'pro' | 'excellence'>('free');
  const [durationMonths, setDurationMonths] = useState<number | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(amount);

  const searchUsers = async () => {
    if (!userSearchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, current_plan, role, created_at')
        .or(`email.ilike.%${userSearchQuery}%,name.ilike.%${userSearchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err: any) {
      console.error('Error searching users:', err);
      toast.error('Erreur lors de la recherche');
    }
  };

  const createSubscription = async () => {
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc('set_user_subscription', {
          target_user_id: selectedUser,
          plan_name: selectedPlan,
          duration_months: durationMonths,
          stripe_subscription_id: null,
          stripe_customer_id: null
        });

      if (error) throw error;

      toast.success(`Abonnement ${selectedPlan} créé avec succès !`);
      
      // Reset form
      setSelectedUser('');
      setSelectedPlan('free');
      setDurationMonths(null);
      setUserSearchQuery('');
      setSearchResults([]);
      setShowUserSearch(false);

      // Refresh the page or trigger a reload
      window.location.reload();

    } catch (err: any) {
      console.error('Error creating subscription:', err);
      toast.error('Erreur lors de la création de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'free': return { monthly: 0, yearly: 0 };
      case 'trial': return { monthly: 0, yearly: 0 };
      case 'pro': return { monthly: 29.99, yearly: 299.99 };
      case 'excellence': return { monthly: 99.99, yearly: 999.99 };
      default: return { monthly: 0, yearly: 0 };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gestion des Abonnements
        </h2>
        <Crown className="text-yellow-500" size={24} />
      </div>

      <div className="space-y-6">
        {/* Recherche d'utilisateur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sélectionner un utilisateur
          </label>
          
          {!showUserSearch ? (
            <button
              onClick={() => setShowUserSearch(true)}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg text-left text-gray-500 dark:text-gray-400 hover:border-indigo-500"
            >
              Cliquer pour rechercher un utilisateur...
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Email ou nom d'utilisateur..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                />
                <button
                  onClick={searchUsers}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Rechercher
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user.id);
                        setShowUserSearch(false);
                      }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-600 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name || user.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.current_plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                            user.current_plan === 'excellence' ? 'bg-yellow-100 text-yellow-700' :
                            user.current_plan === 'trial' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.current_plan || 'free'}
                          </span>
                          {user.role === 'admin' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sélection du plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Plan d'abonnement
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['free', 'trial', 'pro', 'excellence'] as const).map((plan) => {
              const price = getPlanPrice(plan);
              return (
                <div
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === plan
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {plan}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {price.monthly > 0 ? `${formatCurrency(price.monthly)}/mois` : 'Gratuit'}
                      </div>
                    </div>
                    {selectedPlan === plan && (
                      <CheckCircle className="text-indigo-600" size={20} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Durée (optionnelle) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Durée en mois (optionnel - laisser vide pour permanent)
          </label>
          <input
            type="number"
            placeholder="Ex: 12 pour 1 an"
            value={durationMonths || ''}
            onChange={(e) => setDurationMonths(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Résumé */}
        {selectedUser && (
          <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Résumé de l'abonnement
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <div>Plan: <span className="font-medium capitalize">{selectedPlan}</span></div>
              <div>Prix: <span className="font-medium">{formatCurrency(getPlanPrice(selectedPlan).monthly)}/mois</span></div>
              {durationMonths && (
                <div>Durée: <span className="font-medium">{durationMonths} mois</span></div>
              )}
            </div>
          </div>
        )}

        {/* Bouton de création */}
        <button
          onClick={createSubscription}
          disabled={loading || !selectedUser}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Création en cours...
            </>
          ) : (
            <>
              <Crown size={16} />
              Créer l'abonnement
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSubscriptionManager;
