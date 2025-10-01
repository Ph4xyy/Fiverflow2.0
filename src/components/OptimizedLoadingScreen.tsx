import React from 'react';

interface OptimizedLoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

/**
 * Composant de loading optimisé qui évite les rechargements visuels
 * et les messages répétitifs lors des vérifications d'accès
 */
export const OptimizedLoadingScreen: React.FC<OptimizedLoadingScreenProps> = ({ 
  message = "Loading...", 
  showSpinner = true 
}) => {
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

export default OptimizedLoadingScreen;

