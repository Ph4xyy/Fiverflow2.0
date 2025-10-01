import React, { useState, useEffect } from 'react';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Composant de debug pour surveiller les états d'authentification
 * et détecter les rechargements inutiles
 */
export const AuthDebugPanel: React.FC = () => {
  const optimizedAuth = useOptimizedAuth();
  const authContext = useAuth();
  const userData = useUserData();
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshCount(prev => prev + 1);
      setLastRefresh(new Date());
    };

    window.addEventListener('ff:session:refreshed', handleRefresh);
    return () => window.removeEventListener('ff:session:refreshed', handleRefresh);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug Panel</div>
      
      <div className="space-y-1">
        <div>Optimized Auth Loading: {optimizedAuth.loading ? '🔄' : '✅'}</div>
        <div>Auth Context Loading: {authContext.loading ? '🔄' : '✅'}</div>
        <div>UserData Loading: {userData.loading ? '🔄' : '✅'}</div>
        <div>Role: {optimizedAuth.role || 'null'}</div>
        <div>Refresh Count: {refreshCount}</div>
        {lastRefresh && (
          <div>Last Refresh: {lastRefresh.toLocaleTimeString()}</div>
        )}
      </div>
      
      <button
        onClick={() => {
          setRefreshCount(0);
          setLastRefresh(null);
        }}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Reset
      </button>
    </div>
  );
};

export default AuthDebugPanel;

