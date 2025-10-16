import React from 'react';

interface InstantLoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
  maxDuration?: number;
}

/**
 * Composant de chargement instantané
 * - Aucun délai d'affichage
 * - Affichage immédiat
 * - Optimisé pour la navigation instantanée
 */
export const InstantLoadingScreen: React.FC<InstantLoadingScreenProps> = ({ 
  message = "Loading...", 
  showSpinner = true,
  maxDuration = 5000 // 5 secondes max
}) => {
  // 🔥 NAVIGATION INSTANTANÉE - Affichage immédiat, pas de délai
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {showSpinner && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mx-auto" />
        )}
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
};

export default InstantLoadingScreen;
