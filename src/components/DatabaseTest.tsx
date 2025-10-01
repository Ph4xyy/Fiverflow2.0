import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { debugAuth } from '../utils/debugAuth';

/**
 * Composant de test pour vérifier la connexion à la base de données
 */
export const DatabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const runTests = async () => {
    setTestResults([]);
    const results: any[] = [];

    // Test 1: Session
    console.log('🧪 Test 1: Session');
    const sessionResult = await debugAuth.testSession();
    results.push({ test: 'Session', ...sessionResult });

    // Test 2: User role query (si on a un utilisateur)
    if (sessionResult.success && sessionResult.session?.user?.id) {
      console.log('🧪 Test 2: User Role Query');
      const roleResult = await debugAuth.testUserRoleQuery(sessionResult.session.user.id);
      results.push({ test: 'User Role Query', ...roleResult });
    }

    // Test 3: Direct query to users table
    console.log('🧪 Test 3: Direct Users Query');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(5);
      
      results.push({ 
        test: 'Direct Users Query', 
        success: !error, 
        data: data?.length || 0,
        error: error?.message 
      });
    } catch (err) {
      results.push({ 
        test: 'Direct Users Query', 
        success: false, 
        error: err 
      });
    }

    setTestResults(results);
  };

  // Toggle visibility with Ctrl+Shift+D (Database test)
  React.useEffect(() => {
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
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Database Test</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <button 
        onClick={runTests}
        className="mb-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Run Tests
      </button>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="border-b border-gray-600 pb-2">
            <div className="font-bold">
              {result.test}: {result.success ? '✅' : '❌'}
            </div>
            {result.error && (
              <div className="text-red-400 text-xs">
                Error: {JSON.stringify(result.error)}
              </div>
            )}
            {result.data && (
              <div className="text-green-400 text-xs">
                Data: {JSON.stringify(result.data)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseTest;
