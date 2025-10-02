import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { supabase } from '../lib/supabase';

/**
 * Composant de diagnostic pour l'authentification
 * Visible avec Ctrl+Shift+A en développement
 */
export const AuthDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
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
      if (supabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        setSessionInfo({
          hasSession: !!session,
          sessionExpiresAt: session?.expires_at,
          user: session?.user?.id,
          error: error?.message,
          localStorage: {
            supabaseAuthToken: localStorage.getItem('sb-auth-token'),
            allKeys: Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-')),
          },
          sessionStorage: {
            role: sessionStorage.getItem('role'),
            allKeys: Object.keys(sessionStorage),
          }
        });
      }
    } catch (err) {
      setSessionInfo({ error: 'Failed to check session' });
    }
  };

  const attemptRefresh = async () => {
    if (!supabase) return;
    
    setRefreshAttempts(prev => prev + 1);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Refresh failed:', error);
      } else {
        console.log('Refresh successful:', data);
        await checkSession();
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/95 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔐 Auth Diagnostic</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-xs">
          <div>Auth Loading: <span className={authLoading ? 'text-red-400' : 'text-green-400'}>{authLoading ? 'YES' : 'NO'}</span></div>
          <div>Role Loading: <span className={roleLoading ? 'text-red-400' : 'text-green-400'}>{roleLoading ? 'YES' : 'NO'}</span></div>
          <div>User: <span className={user ? 'text-green-400' : 'text-gray-400'}>{user ? user.id : 'NO'}</span></div>
          <div>Role: <span className="text-blue-400">{role || 'none'}</span></div>
          <div>Refresh Attempts: <span className="text-yellow-400">{refreshAttempts}</span></div>
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
            <div>Storage Keys: <span className="text-gray-400">{sessionInfo.localStorage?.allKeys?.length || 0} items</span></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={checkSession}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
          Check Session
        </button>
        <button
          onClick={attemptRefresh}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
        >
          Refresh Token
        </button>
        <button
          onClick={clearStorage}
          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
        >
          Clear & Reload
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+A to toggle
      </div>
    </div>
  );
};

export default AuthDiagnostic;
