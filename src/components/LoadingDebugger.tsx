import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface NetworkCall {
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  error?: string;
}

/**
 * Composant de debug pour analyser les problèmes de chargement
 * Affiche en temps réel les états et les appels réseau
 */
export const LoadingDebugger: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();
  const [networkCalls, setNetworkCalls] = useState<NetworkCall[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intercepter les appels fetch pour voir les requêtes
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || 'unknown';
      const method = (args[1]?.method || 'GET').toUpperCase();
      const startTime = Date.now();
      let status = 0;
      let error: string | undefined;

      try {
        const response = await originalFetch(...args);
        status = response.status;
        const duration = Date.now() - startTime;
        setNetworkCalls(prev => [
          { url, method, status, duration, timestamp: startTime },
          ...prev.slice(0, 9)
        ]);
        return response;
      } catch (e: any) {
        error = e.message;
        const duration = Date.now() - startTime;
        setNetworkCalls(prev => [
          { url, method, status, duration, timestamp: startTime, error },
          ...prev.slice(0, 9)
        ]);
        throw e;
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

  const handleRefocusWindow = useCallback(() => {
    window.focus();
    console.log('Window focus manually triggered.');
    // Don't reload automatically - just focus the window
    console.log('⚠️ Manual refocus - no reload to prevent infinite loops');
  }, []);

  const handleForceRefresh = useCallback(() => {
    console.log('Force refresh triggered.');
    // Clear caches and force refresh
    sessionStorage.removeItem('role');
    window.location.reload();
  }, []);

  const handleDebugInfiniteLoop = useCallback(() => {
    console.log('🔍 Debugging infinite loop...');
    
    // Log all active event listeners
    console.log('📊 Active event listeners:');
    const events = ['ff:session:refreshed', 'ff:cleanup']; // Removed ff:tab:refocus to prevent infinite loops
    events.forEach(eventName => {
      const listeners = (window as any)._eventListeners?.[eventName] || [];
      console.log(`${eventName}: ${listeners.length} listeners`);
    });
    
    // Check for infinite re-renders
    console.log('🔄 Checking for infinite re-renders...');
    const renderCount = (window as any)._renderCount || 0;
    console.log(`Total renders: ${renderCount}`);
    
    // Force cleanup
    window.dispatchEvent(new CustomEvent('ff:cleanup'));
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Loading Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <p><strong>Auth State:</strong></p>
        <p className="ml-2">User: {user ? '✅' : '❌'}</p>
        <p className="ml-2">Loading: {authLoading ? '✅' : '❌'}</p>
        {user && <p className="ml-2">User ID: {user.id}</p>}

        <p><strong>Role State:</strong></p>
        <p className="ml-2">Role: {role || 'none'}</p>
        <p className="ml-2">Loading: {roleLoading ? '✅' : '❌'}</p>

        <p><strong>Session Storage:</strong></p>
        <p className="ml-2">Role: {sessionStorage.getItem('role') || 'none'}</p>
        <p className="ml-2">User ID: {user?.id || 'none'}</p>
        <p className="ml-2">Auth Token: {sessionStorage.getItem('sb-auth-token') ? 'Present' : 'None'}</p>

        <p><strong>Tab Visibility:</strong></p>
        <p className="ml-2">Visible: {document.visibilityState === 'visible' ? '✅' : '❌'}</p>
        <p className="ml-2">Focused: {document.hasFocus() ? '✅' : '❌'}</p>
      </div>

      <button
        onClick={handleRefocusWindow}
        className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs mb-2"
      >
        Refocus Window
      </button>

      <button
        onClick={handleForceRefresh}
        className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-xs mb-2"
      >
        Force Refresh
      </button>

      <button
        onClick={handleDebugInfiniteLoop}
        className="w-full px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-xs mb-4"
      >
        Debug Infinite Loop
      </button>

      <div className="mb-2">
        <h4 className="font-bold text-sm">Recent Network Calls:</h4>
        {networkCalls.length === 0 ? (
          <p className="ml-2 text-gray-500">No calls yet</p>
        ) : (
          <ul className="max-h-24 overflow-y-auto">
            {networkCalls.map((call, index) => (
              <li key={index} className={`ml-2 ${call.error ? 'text-red-400' : (call.status >= 400 ? 'text-yellow-400' : 'text-green-400')}`}>
                [{new Date(call.timestamp).toLocaleTimeString()}] {call.method} {call.url.split('/').pop()} ({call.duration}ms) {call.status} {call.error || ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LoadingDebugger;
