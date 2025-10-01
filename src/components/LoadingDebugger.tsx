import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Composant de debug pour analyser les problèmes de chargement
 * Affiche en temps réel les états et les appels réseau
 */
export const LoadingDebugger: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();
  const [networkCalls, setNetworkCalls] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intercepter les appels fetch pour voir les requêtes
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || 'unknown';
      const timestamp = new Date().toLocaleTimeString();
      setNetworkCalls(prev => [...prev.slice(-9), `${timestamp}: ${url}`]);
      
      try {
        const response = await originalFetch(...args);
        console.log(`🌐 Network call: ${url} - Status: ${response.status}`);
        return response;
      } catch (error) {
        console.error(`❌ Network error: ${url}`, error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Toggle visibility with Ctrl+Shift+L (Loading debugger)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Loading Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Auth State:</strong>
          <div className="ml-2">
            <div>User: {user ? '✅' : '❌'}</div>
            <div>Loading: {authLoading ? '⏳' : '✅'}</div>
            <div>User ID: {user?.id || 'none'}</div>
          </div>
        </div>

        <div>
          <strong>Role State:</strong>
          <div className="ml-2">
            <div>Role: {role}</div>
            <div>Loading: {roleLoading ? '⏳' : '✅'}</div>
          </div>
        </div>

        <div>
          <strong>Session Storage:</strong>
          <div className="ml-2">
            <div>Role: {sessionStorage.getItem('role') || 'none'}</div>
            <div>User ID: {sessionStorage.getItem('user_id') || 'none'}</div>
          </div>
        </div>

        <div>
          <strong>Recent Network Calls:</strong>
          <div className="ml-2 max-h-32 overflow-y-auto">
            {networkCalls.length === 0 ? (
              <div className="text-gray-400">No calls yet</div>
            ) : (
              networkCalls.map((call, index) => (
                <div key={index} className="text-gray-300">{call}</div>
              ))
            )}
          </div>
        </div>

        <div>
          <strong>Tab Visibility:</strong>
          <div className="ml-2">
            <div>Visible: {document.visibilityState === 'visible' ? '✅' : '❌'}</div>
            <div>Focused: {document.hasFocus() ? '✅' : '❌'}</div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              try { window.focus?.(); } catch {}
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Refocus Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingDebugger;
