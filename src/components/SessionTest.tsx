import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de test pour vérifier la persistance de session
 * Visible seulement en développement avec Ctrl+Shift+S
 */
export const SessionTest: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!isVisible) {
          checkSession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const checkSession = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        setSessionInfo({
          hasSession: !!session,
          sessionExpiresAt: session?.expires_at,
          user: session?.user?.id,
          error: error?.message,
          localStorage: {
            supabaseAuthToken: localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token'),
          },
          sessionStorage: {
            role: sessionStorage.getItem('role'),
          }
        });
      }
    } catch (err) {
      setSessionInfo({ error: 'Failed to check session' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/95 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔐 Session Test</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-xs">
          <div>Auth Loading: <span className={loading ? 'text-red-400' : 'text-green-400'}>{loading ? 'YES' : 'NO'}</span></div>
          <div>User: <span className={user ? 'text-green-400' : 'text-gray-400'}>{user ? user.id : 'NO'}</span></div>
        </div>
      </div>

      {sessionInfo && (
        <div className="mb-3">
          <h4 className="font-semibold text-xs mb-2">Session Info:</h4>
          <div className="space-y-1 text-xs">
            <div>Has Session: <span className={sessionInfo.hasSession ? 'text-green-400' : 'text-red-400'}>{sessionInfo.hasSession ? 'YES' : 'NO'}</span></div>
            {sessionInfo.sessionExpiresAt && (
              <div>Expires: <span className="text-yellow-400">{new Date(sessionInfo.sessionExpiresAt * 1000).toLocaleString()}</span></div>
            )}
            {sessionInfo.error && (
              <div>Error: <span className="text-red-400">{sessionInfo.error}</span></div>
            )}
            <div>Role in Storage: <span className="text-blue-400">{sessionInfo.sessionStorage?.role || 'none'}</span></div>
            <div>Token in Storage: <span className={sessionInfo.localStorage?.supabaseAuthToken ? 'text-green-400' : 'text-red-400'}>{sessionInfo.localStorage?.supabaseAuthToken ? 'YES' : 'NO'}</span></div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={checkSession}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
          Check Session
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
        Press Ctrl+Shift+S to toggle
      </div>
    </div>
  );
};

export default SessionTest;
