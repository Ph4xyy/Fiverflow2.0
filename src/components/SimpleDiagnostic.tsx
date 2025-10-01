import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Diagnostic simple pour identifier les problèmes de loading
 * Activable avec Ctrl+Shift+D
 */
export const SimpleDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        addLog('Diagnostic panel toggled');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    addLog(`Auth: ${authLoading ? 'Loading' : 'Ready'} | User: ${user ? 'Yes' : 'No'} | Role: ${role} | RoleLoading: ${roleLoading ? 'Yes' : 'No'}`);
  }, [authLoading, user, role, roleLoading]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/95 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔍 Simple Diagnostic</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Auth Loading: <span className={authLoading ? 'text-red-400' : 'text-green-400'}>{authLoading ? 'YES' : 'NO'}</span></div>
          <div>User: <span className={user ? 'text-green-400' : 'text-gray-400'}>{user ? 'YES' : 'NO'}</span></div>
          <div>Role: <span className="text-blue-400">{role || 'none'}</span></div>
          <div>Role Loading: <span className={roleLoading ? 'text-red-400' : 'text-green-400'}>{roleLoading ? 'YES' : 'NO'}</span></div>
          <div>Environment: <span className="text-purple-400">{import.meta.env.MODE}</span></div>
          <div>URL: <span className="text-yellow-400">{window.location.pathname}</span></div>
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
            console.log('🔍 Simple Diagnostic:', {
              authLoading,
              user: user?.id,
              role,
              roleLoading,
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
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
};

export default SimpleDiagnostic;
