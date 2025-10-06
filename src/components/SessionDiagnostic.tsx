import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const SessionDiagnostic: React.FC = () => {
  const { user, loading } = useAuth();
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const runDiagnostic = async () => {
      const diag: any = {
        timestamp: new Date().toISOString(),
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : null,
        loading,
        localStorage: {},
        sessionStorage: {},
        supabaseSession: null,
        errors: []
      };

      try {
        // Vérifier localStorage
        if (typeof window !== 'undefined') {
          const authToken = localStorage.getItem('sb-auth-token');
          diag.localStorage = {
            hasAuthToken: !!authToken,
            authTokenLength: authToken?.length || 0,
            allSupabaseKeys: Object.keys(localStorage).filter(k => k.includes('sb-')),
            localStorageAccessible: true
          };

          // Vérifier sessionStorage
          const role = sessionStorage.getItem('role');
          diag.sessionStorage = {
            hasRole: !!role,
            role: role,
            sessionStorageAccessible: true
          };
        }

        // Vérifier la session Supabase
        if (supabase) {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
              diag.errors.push(`Supabase session error: ${error.message}`);
            } else {
              diag.supabaseSession = {
                hasSession: !!session,
                hasUser: !!session?.user,
                userId: session?.user?.id,
                expiresAt: session?.expires_at,
                isExpired: session ? new Date(session.expires_at * 1000) < new Date() : false
              };
            }
          } catch (err) {
            diag.errors.push(`Supabase session check failed: ${err}`);
          }
        }

      } catch (err) {
        diag.errors.push(`Diagnostic failed: ${err}`);
      }

      setDiagnostic(diag);
    };

    runDiagnostic();
  }, [user, loading]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50"
      >
        🔍 Session Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Session Diagnostic</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-green-600">User Status</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(diagnostic?.user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-blue-600">Loading State</h3>
            <p className="text-sm">{diagnostic?.loading ? 'Loading...' : 'Not loading'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-purple-600">LocalStorage</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(diagnostic?.localStorage, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-orange-600">SessionStorage</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(diagnostic?.sessionStorage, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-red-600">Supabase Session</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(diagnostic?.supabaseSession, null, 2)}
            </pre>
          </div>

          {diagnostic?.errors?.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-600">Errors</h3>
              <ul className="list-disc list-inside text-sm text-red-600">
                {diagnostic.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded text-sm"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDiagnostic;
