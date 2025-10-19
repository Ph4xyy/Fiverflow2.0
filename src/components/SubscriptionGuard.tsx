import React from 'react';
import { useSubscriptionPermissions } from '../hooks/useSubscriptionPermissions';
import { Lock, Crown, Zap, TrendingUp } from 'lucide-react';
import ModernButton from './ModernButton';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'launch' | 'boost' | 'scale';
  pageName: string;
  description?: string;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredPlan,
  pageName,
  description
}) => {
  const { subscription, canAccessPage, loading } = useSubscriptionPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9c68f2]"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a accès à cette page
  const hasAccess = canAccessPage(pageName as any);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1e2938] border border-[#35414e] rounded-xl shadow-2xl p-8 text-center">
          {/* Icône de verrouillage */}
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-white" />
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Page Verrouillée
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-6">
            {description || `Cette page nécessite un abonnement ${requiredPlan.toUpperCase()}.`}
          </p>

          {/* Plan actuel */}
          <div className="bg-[#35414e] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {subscription?.plan_name === 'launch' && <Crown size={20} className="text-yellow-500" />}
              {subscription?.plan_name === 'boost' && <Zap size={20} className="text-blue-500" />}
              {subscription?.plan_name === 'scale' && <TrendingUp size={20} className="text-purple-500" />}
              <span className="text-white font-semibold">
                Plan Actuel: {subscription?.plan_display_name || 'Launch'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {subscription?.plan_name === 'launch' && 'Accès limité aux fonctionnalités de base'}
              {subscription?.plan_name === 'boost' && 'Accès aux fonctionnalités premium'}
              {subscription?.plan_name === 'scale' && 'Accès complet à toutes les fonctionnalités'}
            </p>
          </div>

          {/* Plans disponibles */}
          <div className="space-y-3 mb-6">
            <h3 className="text-white font-semibold mb-3">Plans Disponibles:</h3>
            
            <div className="bg-[#35414e] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-yellow-500" />
                  <span className="text-white font-medium">Launch</span>
                </div>
                <span className="text-green-400 font-semibold">Gratuit</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Dashboard, Clients (5 max), Orders (10 max)</p>
            </div>

            <div className="bg-[#35414e] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-blue-500" />
                  <span className="text-white font-medium">Boost</span>
                </div>
                <span className="text-blue-400 font-semibold">24€/mois</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Tout de Launch + Calendar, Referrals, Workboard</p>
            </div>

            <div className="bg-[#35414e] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  <span className="text-white font-medium">Scale</span>
                </div>
                <span className="text-purple-400 font-semibold">59€/mois</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Tout de Boost + Stats, Invoices</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <ModernButton
              onClick={() => window.location.href = '/upgrade'}
              className="w-full"
            >
              <Crown size={16} className="mr-2" />
              Voir les Plans
            </ModernButton>
            
            <ModernButton
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Retour
            </ModernButton>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
