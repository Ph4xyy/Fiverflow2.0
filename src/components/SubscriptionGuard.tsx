import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Button } from './ui/Button';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'Lunch' | 'Boost' | 'Scale';
  pageType?: 'admin' | 'pro' | 'premium';
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredPlan,
  pageType,
  fallback
}) => {
  const { plan, isLoading, canAccess } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = pageType ? canAccess(pageType) : plan === requiredPlan || (requiredPlan === 'Lunch' && plan === 'Lunch');

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Accès Restreint
            </h1>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité nécessite un abonnement {requiredPlan}.
            </p>
            <p className="text-sm text-gray-500">
              Votre plan actuel : <span className="font-semibold">{plan}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Fonctionnalités Disponibles</h3>
              <div className="space-y-2 text-sm text-blue-700">
                {requiredPlan === 'Boost' && (
                  <>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      <span>Analyses avancées</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      <span>Rapports personnalisés</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      <span>Support prioritaire</span>
                    </div>
                  </>
                )}
                {requiredPlan === 'Scale' && (
                  <>
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      <span>Gestionnaire de compte dédié</span>
                    </div>
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      <span>Développement personnalisé</span>
                    </div>
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      <span>Support 24/7</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Mettre à Niveau vers {requiredPlan}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Retour au Tableau de Bord
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;