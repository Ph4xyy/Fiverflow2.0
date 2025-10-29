import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

interface TempSubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'Lunch' | 'Boost' | 'Scale';
  pageType?: 'admin' | 'pro' | 'premium';
  fallback?: React.ReactNode;
}

/**
 * Version temporaire du SubscriptionGuard qui autorise l'accès à toutes les pages
 * pour les tests de développement
 */
export const TempSubscriptionGuard: React.FC<TempSubscriptionGuardProps> = ({
  children,
  requiredPlan,
  pageType,
  fallback
}) => {
  const { plan, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // En mode temporaire, on autorise l'accès à toutes les pages
  // Mais on affiche un bandeau d'information
  return (
    <div>
      {/* Bandeau d'information pour le mode temporaire */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <strong>Mode Test:</strong> Accès temporaire autorisé. 
              Plan requis: <span className="font-semibold">{requiredPlan}</span> | 
              Votre plan: <span className="font-semibold">{plan}</span>
            </p>
            <p className="text-xs mt-1">
              Pour activer cette fonctionnalité en production, mettez à jour votre plan d'abonnement.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contenu de la page */}
      {children}
    </div>
  );
};

export default TempSubscriptionGuard;


