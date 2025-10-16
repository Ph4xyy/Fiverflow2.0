import React, { useState, useEffect } from 'react';

interface OptimizedLoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
  maxDuration?: number; // Durée max avant d'afficher le fallback
}

/**
 * Composant de loading optimisé qui évite les rechargements visuels
 * et les messages répétitifs lors des vérifications d'accès
 */
export const OptimizedLoadingScreen: React.FC<OptimizedLoadingScreenProps> = ({ 
  message = "Loading...", 
  showSpinner = true,
  maxDuration = 8000 // 8 secondes max
}) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, maxDuration);

    return () => clearTimeout(timer);
  }, [maxDuration]);

  if (showFallback) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Application bloquée
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            L'application semble prendre plus de temps que prévu à charger.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recharger la page
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Vider le cache et recharger
            </button>
          </div>
        </div>
      </div>
    );
  }

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

