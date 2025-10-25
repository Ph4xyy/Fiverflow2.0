import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Button } from './ui/Button';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TestSubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'Lunch' | 'Boost' | 'Scale';
  pageType?: 'admin' | 'pro' | 'premium';
  fallback?: React.ReactNode;
}

/**
 * Version de test du SubscriptionGuard qui permet l'accès à toutes les pages
 * pour tester l'interface sans restrictions d'abonnement
 */
export const TestSubscriptionGuard: React.FC<TestSubscriptionGuardProps> = ({
  children,
  requiredPlan,
  pageType,
  fallback
}) => {
  const { plan, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // En mode test, on autorise l'accès à toutes les pages
  // Mais on affiche un bandeau d'information
  return (
    <div>
      {/* Bandeau d'information pour le mode test */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <strong>Mode Test:</strong> Accès autorisé à toutes les pages. 
              Plan requis: {requiredPlan} | Votre plan: {plan}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contenu de la page */}
      {children}
    </div>
  );
};

export default TestSubscriptionGuard;
