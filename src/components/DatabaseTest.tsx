import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { debugAuth } from '../utils/debugAuth';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  duration?: number;
}

/**
 * Composant de test pour vérifier la connexion à la base de données
 */
export const DatabaseTest: React.FC = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    const results: TestResult[] = [];

    // Test 1: Supabase configured
    results.push({
      name: 'Supabase Configuration',
      status: isSupabaseConfigured ? 'success' : 'error',
      message: isSupabaseConfigured ? 'Supabase is configured.' : 'Supabase URL or Anon Key is missing.'
    });

    if (!isSupabaseConfigured) {
      setTestResults(results);
      setIsTesting(false);
      return;
    }

    // Test 2: User authenticated
    results.push({
      name: 'User Authentication',
      status: user ? 'success' : 'error',
      message: user ? `User authenticated: ${user.id}` : 'No user authenticated.'
    });

    if (!user) {
      setTestResults(results);
      setIsTesting(false);
      return;
    }

    // Test 3: Fetch user role (using debugAuth utility)
    results.push({ name: 'Fetch User Role', status: 'loading', message: 'Fetching...' });
    setTestResults([...results]);
    const roleTest = await debugAuth.testUserRoleQuery(user.id);
    results[results.length - 1] = {
      name: 'Fetch User Role',
      status: roleTest.success ? 'success' : 'error',
      message: roleTest.success ? `Role: ${roleTest.data?.role || 'N/A'}` : `Error: ${roleTest.error}`,
      duration: roleTest.duration
    };
    setTestResults([...results]);

    // Test 4: RLS Policies test
    results.push({ name: 'RLS Policies Test', status: 'loading', message: 'Testing...' });
    setTestResults([...results]);
    const rlsTest = await debugAuth.testRLSPolicies(user.id);
    results[results.length - 1] = {
      name: 'RLS Policies Test',
      status: rlsTest.success ? 'success' : 'error',
      message: rlsTest.success ? 'RLS policies working correctly' : `Error: ${rlsTest.error}`,
      duration: rlsTest.duration
    };
    setTestResults([...results]);

    // Test 5: Fetch clients (RLS test)
    results.push({ name: 'Fetch Clients (RLS)', status: 'loading', message: 'Fetching...' });
    setTestResults([...results]);
    const clientsStartTime = Date.now();
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name')
        .limit(1);

      const clientsDuration = Date.now() - clientsStartTime;
      if (clientsError) {
        results[results.length - 1] = {
          name: 'Fetch Clients (RLS)',
          status: 'error',
          message: `Error: ${clientsError.message}`,
          duration: clientsDuration
        };
      } else {
        results[results.length - 1] = {
          name: 'Fetch Clients (RLS)',
          status: 'success',
          message: `Fetched ${clientsData?.length || 0} client(s).`,
          duration: clientsDuration
        };
      }
    } catch (e: any) {
      const clientsDuration = Date.now() - clientsStartTime;
      results[results.length - 1] = {
        name: 'Fetch Clients (RLS)',
        status: 'error',
        message: `Unexpected error: ${e.message}`,
        duration: clientsDuration
      };
    }

    setTestResults(results);
    setIsTesting(false);
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Database Test</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <button 
        onClick={runTests}
        disabled={isTesting}
        className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs mb-4 disabled:opacity-50"
      >
        {isTesting ? 'Running Tests...' : 'Run Tests'}
      </button>

      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className="flex items-center">
            <span className={`mr-2 ${result.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {result.status === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">{result.name}:</span>
            <span className="ml-1">{result.message}</span>
            {result.duration !== undefined && <span className="ml-auto text-gray-500">({result.duration}ms)</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseTest;
