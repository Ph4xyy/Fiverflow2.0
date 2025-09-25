import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export type SearchCategory = 'all' | 'clients' | 'orders' | 'tasks' | 'invoices' | 'calendar' | 'network';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  url: string;
}

const CentralizedSearchBar: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { value: 'all' as SearchCategory, label: t('search.all'), icon: '🔍' },
    { value: 'clients' as SearchCategory, label: t('search.clients'), icon: '👥' },
    { value: 'orders' as SearchCategory, label: t('search.orders'), icon: '📦' },
    { value: 'tasks' as SearchCategory, label: t('search.tasks'), icon: '✅' },
    { value: 'invoices' as SearchCategory, label: t('search.invoices'), icon: '📄' },
    { value: 'calendar' as SearchCategory, label: t('search.calendar'), icon: '📅' },
    { value: 'network' as SearchCategory, label: t('search.network'), icon: '🌐' },
  ];

  // Fonction pour rechercher dans la base de données
  const searchInDatabase = async (term: string, category: SearchCategory) => {
    if (!user || !supabase) return [];

    const results: SearchResult[] = [];
    const searchTerm = term.toLowerCase();

    try {
      // Rechercher les clients
      if (category === 'all' || category === 'clients') {
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('id, name, email, company, platform')
          .eq('user_id', user.id)
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);

        if (!clientsError && clients) {
          clients.forEach(client => {
            results.push({
              id: client.id,
              title: client.name || 'Unnamed Client',
              subtitle: `${client.company || 'No Company'} • ${client.platform || 'No Platform'}`,
              category: 'clients',
              url: '/clients'
            });
          });
        }
      }

      // Rechercher les commandes
      if (category === 'all' || category === 'orders') {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, title, client_name, platform, status')
          .eq('user_id', user.id)
          .or(`title.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`);

        if (!ordersError && orders) {
          orders.forEach(order => {
            results.push({
              id: order.id,
              title: order.title || 'Untitled Order',
              subtitle: `${order.client_name || 'No Client'} • ${order.platform || 'No Platform'}`,
              category: 'orders',
              url: '/orders'
            });
          });
        }
      }

      // Rechercher les tâches
      if (category === 'all' || category === 'tasks') {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, description, status, priority')
          .eq('user_id', user.id)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

        if (!tasksError && tasks) {
          tasks.forEach(task => {
            results.push({
              id: task.id,
              title: task.title || 'Untitled Task',
              subtitle: `${task.status || 'No Status'} • ${task.priority || 'No Priority'}`,
              category: 'tasks',
              url: '/tasks'
            });
          });
        }
      }

      // Rechercher les factures
      if (category === 'all' || category === 'invoices') {
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('id, invoice_number, client_name, total_amount, status')
          .eq('user_id', user.id)
          .or(`invoice_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`);

        if (!invoicesError && invoices) {
          invoices.forEach(invoice => {
            results.push({
              id: invoice.id,
              title: invoice.invoice_number || 'No Invoice Number',
              subtitle: `${invoice.client_name || 'No Client'} • $${invoice.total_amount || '0'}`,
              category: 'invoices',
              url: '/invoices'
            });
          });
        }
      }

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // En cas d'erreur, retourner un résultat vide plutôt que de planter
    }

    return results;
  };

  // Filtrer les résultats
  useEffect(() => {
    if (!searchTerm.trim() || !user) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Délai pour éviter trop de requêtes
    const timer = setTimeout(async () => {
      const searchResults = await searchInDatabase(searchTerm, selectedCategory);
      setResults(searchResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, user]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (result: SearchResult) => {
    // Navigation vers la page avec l'élément spécifique si possible
    if (result.category === 'clients') {
      navigate(`/clients?search=${encodeURIComponent(result.title)}`);
    } else if (result.category === 'orders') {
      navigate(`/orders?search=${encodeURIComponent(result.title)}`);
    } else if (result.category === 'tasks') {
      navigate(`/tasks?search=${encodeURIComponent(result.title)}`);
    } else if (result.category === 'invoices') {
      navigate(`/invoices?search=${encodeURIComponent(result.title)}`);
    } else {
      navigate(result.url);
    }
    
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setResults([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-[#1C2230] 
                     bg-[#11151D]/95 text-slate-100 placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
        />

        {/* Bouton de catégorie */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1C2230] hover:bg-[#2A3347] 
                       text-slate-300 hover:text-white transition-colors text-sm"
          >
            <span className="text-xs">
              {categories.find(c => c.value === selectedCategory)?.icon}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {searchTerm && (
            <button
              onClick={clearSearch}
              className="p-1 rounded-lg hover:bg-[#2A3347] text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown des catégories */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F141C] border border-[#1C2230] 
                        rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Liste des catégories */}
          <div className="p-2 border-b border-[#1C2230]">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('common.filter')}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-[#1C2230] hover:text-white'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchTerm && (
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  {t('common.loading')}...
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {t('common.search')} Results
                  </div>
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearch(result)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1C2230] 
                                 text-left transition-colors group"
                    >
                      <span className="text-lg">
                        {categories.find(c => c.value === result.category)?.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-slate-400 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">{t('common.no.results') || 'No results found'}</div>
                  <div className="text-xs">{t('common.try.different.search') || 'Try a different search term'}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CentralizedSearchBar;
