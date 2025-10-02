import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Diagnostic minimal pour identifier les problèmes
 * Activable avec Ctrl+Shift+M
 */
export const MinimalDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const { user, loading } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        addLog('Diagnostic panel toggled');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    addLog(`Auth Loading: ${loading} | User: ${user ? 'Yes' : 'No'}`);
  }, [loading, user]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/95 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔍 Minimal Diagnostic</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Auth Loading: <span className={loading ? 'text-red-400' : 'text-green-400'}>{loading ? 'YES' : 'NO'}</span></div>
          <div>User: <span className={user ? 'text-green-400' : 'text-gray-400'}>{user ? 'YES' : 'NO'}</span></div>
          <div>User ID: <span className="text-blue-400">{user?.id || 'none'}</span></div>
          <div>Environment: <span className="text-purple-400">{import.meta.env.MODE}</span></div>
          <div>URL: <span className="text-yellow-400">{window.location.pathname}</span></div>
          <div>Timestamp: <span className="text-gray-400">{new Date().toLocaleTimeString()}</span></div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-xs mb-2">Recent Logs:</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-400 text-xs">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-xs text-gray-300">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setLogs([]);
            addLog('Logs cleared');
          }}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
          Clear
        </button>
        <button
          onClick={() => {
            console.log('🔍 Minimal Diagnostic:', {
              loading,
              user: user?.id,
              environment: import.meta.env.MODE,
              url: window.location.href,
              logs
            });
            addLog('Logged to console');
          }}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
        >
          Log
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }}
          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
        >
          Clear & Reload
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+M to toggle
      </div>
    </div>
  );
};

export default MinimalDiagnostic;

