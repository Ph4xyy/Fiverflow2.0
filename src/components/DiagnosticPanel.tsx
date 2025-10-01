import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Composant de diagnostic pour identifier les problèmes de loading loops
 * Visible uniquement en développement ou avec un raccourci clavier
 */
export const DiagnosticPanel: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();
  const [isVisible, setIsVisible] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  useEffect(() => {
    const logEvent = (event: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [...prev.slice(-9), `${timestamp}: ${event}`]);
    };

    // Écouter les événements de visibilité
    const handleVisibilityChange = () => {
      logEvent(`Visibility: ${document.visibilityState}`);
    };

    // Écouter les événements de focus
    const handleFocus = () => {
      logEvent('Window focused');
    };

    const handleBlur = () => {
      logEvent('Window blurred');
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = (e: CustomEvent) => {
      logEvent(`Custom event: ${e.type}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('ff:cleanup', handleCustomEvent as EventListener);
    window.addEventListener('ff:tab:refocus', handleCustomEvent as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('ff:cleanup', handleCustomEvent as EventListener);
      window.removeEventListener('ff:tab:refocus', handleCustomEvent as EventListener);
    };
  }, []);

  // Raccourci clavier pour afficher/masquer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/95 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔍 Diagnostic Panel</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Renders: <span className="text-yellow-400">{renderCount}</span></div>
          <div>Auth Loading: <span className={authLoading ? 'text-red-400' : 'text-green-400'}>{authLoading ? 'YES' : 'NO'}</span></div>
          <div>Role Loading: <span className={roleLoading ? 'text-red-400' : 'text-green-400'}>{roleLoading ? 'YES' : 'NO'}</span></div>
          <div>User: <span className={user ? 'text-green-400' : 'text-gray-400'}>{user ? 'YES' : 'NO'}</span></div>
          <div>Role: <span className="text-blue-400">{role || 'none'}</span></div>
          <div>Environment: <span className="text-purple-400">{import.meta.env.MODE}</span></div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-xs mb-2">Recent Events:</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {eventLog.length === 0 ? (
            <div className="text-gray-400 text-xs">No events yet...</div>
          ) : (
            eventLog.map((event, index) => (
              <div key={index} className="text-xs text-gray-300">
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setRenderCount(0);
            setEventLog([]);
          }}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
          Reset
        </button>
        <button
          onClick={() => {
            console.log('🔍 Diagnostic Info:', {
              renderCount,
              authLoading,
              roleLoading,
              user: user?.id,
              role,
              events: eventLog,
              environment: import.meta.env.MODE,
              userAgent: navigator.userAgent,
              url: window.location.href
            });
          }}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
        >
          Log to Console
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
};

export default DiagnosticPanel;
