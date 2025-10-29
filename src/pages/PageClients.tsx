// src/pages/ClientsPageModern.tsx - NOUVELLE INTERFACE MODERNE
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Layout, { cardClass } from '../components/Layout';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { useInstantPageData } from '../hooks/useInstantPageData';

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ClientForm from '../components/ClientForm';
import ClientViewModal, { FullClient } from '../components/ClientViewModal';
import { 
  Plus, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Star,
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import SubscriptionLimits from '../components/SubscriptionLimits';

type ClientRow = {
  id: string;
  name: string;
  company_name: string | null;
  platform: string | null; // Peut être null
  email_primary: string | null;
  country: string | null;
  client_status: string | null;
  created_at: string | null;
};

const PAGE_SIZE = 12; // Reduced for card layout

const PageClients: React.FC = () => {
  const { user, authReady } = useAuth();

  // 🔥 NAVIGATION INSTANTANÉE - Plus d'état de chargement initial
  const [total, setTotal] = useState(0);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  // Search (debounced)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters
  const [status, setStatus] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);

  // View modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewClient, setViewClient] = useState<FullClient | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // 🔥 NAVIGATION INSTANTANÉE - Plus de debounce, recherche immédiate
  useEffect(() => {
    setDebouncedSearch(search.trim());
  }, [search]);

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, platform, country]);

  // Load distinct filters
  useEffect(() => {
    const loadDistincts = async () => {
      if (!authReady || !user) {
        console.log('[ClientsPage] loadDistincts: ⏳ Waiting for auth to be ready...');
        return;
      }
      if (!isSupabaseConfigured || !supabase) {
        console.log('[ClientsPage] loadDistincts: Using default options (no Supabase)');
        setPlatformOptions(['Fiverr', 'Upwork', 'Direct']);
        setCountryOptions(['France', 'Canada', 'United States']);
        return;
      }
      console.log('[ClientsPage] loadDistincts: 📡 Loading distinct filters for user:', user.id);
      try {
        const [plat, ctry] = await Promise.all([
          supabase
            .from('clients')
            .select('platform', { count: 'exact' })
            .eq('user_id', user.id)
            .not('platform', 'is', null),
          supabase
            .from('clients')
            .select('country', { count: 'exact' })
            .eq('user_id', user.id)
            .not('country', 'is', null),
        ]);
        const pSet = new Set<string>();
        const cSet = new Set<string>();
        (plat.data || []).forEach((r: any) => r.platform && pSet.add(r.platform));
        (ctry.data || []).forEach((r: any) => r.country && cSet.add(r.country));
        setPlatformOptions(Array.from(pSet).sort());
        setCountryOptions(Array.from(cSet).sort());
        console.log('[ClientsPage] loadDistincts: ✅ Loaded filters:', { platforms: pSet.size, countries: cSet.size });
      } catch (err) {
        console.error('[ClientsPage] loadDistincts: ❌ Error loading distincts:', err);
        setPlatformOptions(['Fiverr', 'Upwork', 'Direct']);
        setCountryOptions(['France', 'Canada', 'United States']);
      }
    };
    loadDistincts();
  }, [authReady, user]);

  // Data
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (!isSupabaseConfigured || !supabase) {
          // Mock data for development
          const mockClients: ClientRow[] = [
            {
              id: '1',
              name: 'John Doe',
              company_name: 'Acme Corp',
              platform: 'Fiverr',
              email_primary: 'john@acme.com',
              country: 'United States',
              client_status: 'active',
              created_at: '2024-01-15'
            },
            {
              id: '2',
              name: 'Jane Smith',
              company_name: 'Tech Solutions',
              platform: 'Upwork',
              email_primary: 'jane@tech.com',
              country: 'Canada',
              client_status: 'prospect',
              created_at: '2024-01-20'
            }
          ];
          setClients(mockClients);
          setTotal(mockClients.length);
          return;
        }

        let query = supabase
          .from('clients')
          .select('id, name, company_name, platform, email_primary, country, client_status, created_at', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Apply filters
        if (debouncedSearch) {
          query = query.or(`name.ilike.%${debouncedSearch}%,company_name.ilike.%${debouncedSearch}%,email_primary.ilike.%${debouncedSearch}%`);
        }
        if (status) {
          query = query.eq('client_status', status);
        }
        if (platform) {
          query = query.eq('platform', platform);
        }
        if (country) {
          query = query.eq('country', country);
        }

        // Apply pagination
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        setClients(data || []);
        setTotal(count || 0);
      } catch (err: any) {
        console.error('Error loading clients:', err);
        setError(err.message || 'Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user, debouncedSearch, status, platform, country, page]);

  const refetch = useCallback(() => {
    // Reload clients
    window.location.reload();
  }, []);

  // Open create modal
  const openCreate = useCallback(() => {
    setEditingClient(null);
    setIsModalOpen(true);
  }, []);

  // Open edit modal
  const openEdit = useCallback((client: ClientRow) => {
    setEditingClient(client);
    setIsModalOpen(true);
  }, []);

  // Open view modal
  const openView = useCallback(async (client: ClientRow) => {
    setViewLoading(true);
    setIsViewOpen(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        console.log('[ClientsPage] openView: Using mock data (no Supabase)');
        setViewClient({
          id: client.id,
          name: client.name,
          company_name: client.company_name,
          platform: client.platform || null,
          email_primary: client.email_primary,
          country: client.country,
          client_status: client.client_status,
          created_at: client.created_at,
          orders: [],
          total_orders: 0,
          total_revenue: 0,
        });
        return;
      }

      const { data: fullClient, error } = await supabase
        .from('clients')
        .select(`
          *,
          orders:orders(
            id,
            title,
            status,
            budget,
            created_at
          )
        `)
        .eq('id', client.id)
        .single();

      if (error) throw error;

      const totalOrders = fullClient.orders?.length || 0;
      const totalRevenue = fullClient.orders?.reduce((sum: number, order: any) => sum + (order.budget || 0), 0) || 0;

      setViewClient({
        ...fullClient,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
      });
    } catch (err) {
      console.error('[ClientsPage] openView: ❌ Error loading client details:', err);
      toast.error('Error loading client details');
    } finally {
      setViewLoading(false);
    }
  }, []);

  // Handle form success
  const handleFormSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingClient(null);
    refetch();
    toast.success(editingClient ? 'Client updated successfully' : 'Client created successfully');
  }, [editingClient, refetch]);

  // Handle delete client
  const handleDelete = useCallback(async (client: ClientRow) => {
    if (!confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (!isSupabaseConfigured || !supabase || !user) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Client "${client.name}" deleted successfully`);
      refetch();
    } catch (err: any) {
      console.error('Error deleting client:', err);
      toast.error(err.message || 'Failed to delete client');
    }
  }, [user, refetch]);

  // Get status color
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string | null) => {
    if (!platform) return <Globe className="w-4 h-4" />; // Par défaut si null
    switch (platform.toLowerCase()) {
      case 'fiverr': return <Globe className="w-4 h-4" />;
      case 'upwork': return <Building2 className="w-4 h-4" />;
      case 'direct': return <UserCheck className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !clients) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="ml-3 text-gray-400">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 font-semibold">Error loading clients</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <ModernButton onClick={refetch} className="mt-4">
          Retry
        </ModernButton>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">Manage your client relationships</p>
        </div>
      </div>
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-white">{total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">
                {clients?.filter(c => c.client_status === 'active').length || 0}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Prospects</p>
              <p className="text-2xl font-bold text-white">
                {clients?.filter(c => c.client_status === 'prospect').length || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-white">
                {clients?.filter(c => {
                  const created = new Date(c.created_at || '');
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className={`${cardClass} p-4`}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#1C2230]
                           bg-[#11151D]/95 text-slate-100 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#141922]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[#1C2230] rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>

            <ModernButton onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </ModernButton>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-[#1C2230]">
          <div className="flex items-center gap-2 mb-3 text-slate-200">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#1C2230] bg-[#11151D]/95 text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Status (all)</option>
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Project completed</option>
            </select>

            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#1C2230] bg-[#11151D]/95 text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Platform (all)</option>
              {platformOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#1C2230] bg-[#11151D]/95 text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Country (all)</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid/List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients?.map((client) => (
            <div key={client.id} className={`${cardClass} p-4 hover:bg-[#1C2230]/50 transition-all duration-200 group`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{client.name}</h3>
                    {client.company_name && (
                      <p className="text-xs text-gray-400">{client.company_name}</p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 rounded-lg hover:bg-[#1C2230] opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {getPlatformIcon(client.platform)}
                  <span>{client.platform || 'N/A'}</span>
                </div>
                {client.email_primary && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{client.email_primary}</span>
                  </div>
                )}
                {client.country && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{client.country}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.client_status)}`}>
                  {client.client_status || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(client.created_at)}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#1C2230] flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => openView(client)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => openEdit(client)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-3 h-3 inline mr-1" />
                    Edit
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(client)}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                  title="Delete client"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${cardClass} p-0 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1C2230]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2230]">
                {clients?.map((client) => (
                  <tr key={client.id} className="hover:bg-[#1C2230]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{client.name}</div>
                          {client.company_name && (
                            <div className="text-sm text-gray-400">{client.company_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-300">
                        {getPlatformIcon(client.platform)}
                        <span className="ml-2">{client.platform || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {client.email_primary && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email_primary}
                          </div>
                        )}
                        {client.country && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {client.country}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.client_status)}`}>
                        {client.client_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(client)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                          title="View client"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(client)}
                          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                          title="Edit client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                          title="Delete client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} clients
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#1C2230] bg-[#11151D] text-gray-400 hover:text-white hover:bg-[#1C2230] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm text-gray-300">
                {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#1C2230] bg-[#11151D] text-gray-400 hover:text-white hover:bg-[#1C2230] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
        client={editingClient}
      />

      <ClientViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        client={viewClient}
        loading={viewLoading}
      />
    </div>
  );
};

export default PageClients;
