import React from 'react';
import { useLoading } from '../contexts/LoadingContext';

/**
 * Composant de debug pour visualiser les états de chargement
 * À utiliser uniquement en développement
 */
export const LoadingDebugPanel: React.FC = () => {
  const { loading, isLoading } = useLoading();

  // Ne s'affiche qut('en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-2">Loading States:</div>
      <div className="space-y-1">
        <div className={`${loading.auth ? 'text-green-400' : 'text-gray-400'}`}>
          Auth: {loading.auth ? '⏳' : '✅'}
        </div>
        <div className={`${loading.role ? 'text-green-400' : 'text-gray-400'}`}>
          Role: {loading.role ? '⏳' : '✅'}
        </div>
        <div className={`${loading.subscription ? 'text-green-400' : 'text-gray-400'}`}>
          Subscription: {loading.subscription ? '⏳' : '✅'}
        </div>
        <div className={`${loading.data ? 'text-green-400' : 'text-gray-400'}`}>
          Data: {loading.data ? '⏳' : '✅'}
        </div>
        <div className="border-t border-gray-600 pt-1 mt-2">
          <div className={`${isLoading() ? 'text-yellow-400' : 'text-gray-400'}`}>
            Global: {isLoading() ? '⏳' : '✅'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDebugPanel;
