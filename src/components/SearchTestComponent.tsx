import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const SearchTestComponent: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testSearch = async (category: string) => {
    if (!user || !supabase) return;

    setIsLoading(true);
    try {
      let data;
      switch (category) {
        case 'clients':
          const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .limit(5);
          data = clients;
          break;
        case 'orders':
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .limit(5);
          data = orders;
          break;
        case 'tasks':
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .limit(5);
          data = tasks;
          break;
        case 'invoices':
          const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .limit(5);
          data = invoices;
          break;
      }
      setTestResults(data || []);
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setTestResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <p className="text-red-400">Utilisateur non connecté</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#11151D] rounded-xl border border-[#1C2230]">
      <h2 className="text-xl font-bold text-white mb-4">
        Test de recherche - {t('common.language')}
      </h2>
      
      <div className="mb-4">
        <p className="text-slate-300 mb-2">Utilisateur connecté: {user.email}</p>
        <p className="text-slate-400 text-sm">ID: {user.id}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => testSearch('clients')}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
        >
          Test Clients
        </button>
        <button
          onClick={() => testSearch('orders')}
          disabled={isLoading}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm"
        >
          Test Orders
        </button>
        <button
          onClick={() => testSearch('tasks')}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
        >
          Test Tasks
        </button>
        <button
          onClick={() => testSearch('invoices')}
          disabled={isLoading}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm"
        >
          Test Invoices
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-slate-400">{t('common.loading')}</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Résultats ({testResults.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {testResults.map((item, index) => (
              <div key={index} className="p-3 bg-[#0F141C] rounded-lg border border-[#1C2230]">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {testResults.length === 0 && !isLoading && (
        <div className="text-center py-4 text-slate-400">
          <p>{t('common.no.results')}</p>
          <p className="text-sm">Cliquez sur un bouton pour tester la recherche</p>
        </div>
      )}
    </div>
  );
};

export default SearchTestComponent;
