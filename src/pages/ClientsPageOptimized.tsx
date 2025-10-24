// src/pages/ClientsPageOptimized.tsx - VERSION ULTRA-OPTIMISÉE
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Layout, { cardClass } from '@/components/Layout';
import ModernButton from '@/components/ModernButton';
import ModernCard from '@/components/ModernCard';
import { useAuth } from '@/contexts/AuthContext';
import { useInstantPageData } from '@/hooks/useInstantPageData';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ClientForm from '@/components/ClientForm';
import ClientViewModal, { FullClient } from '@/components/ClientViewModal';
import { Plus, Search, X, ChevronLeft, ChevronRight, Filter, Users, Eye, Edit, Trash2, Mail, Phone, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import SubscriptionLimits from '@/components/SubscriptionLimits';

type ClientRow = {
  id: string;
  name: string;
  company_name: string | null;
  platform: string;
  email_primary: string | null;
  country: string | null;
  client_status: string | null;
  created_at: string | null;
};

const PAGE_SIZE = 20;

const ClientsPageOptimized: React.FC = () => {
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
      // GUARD: Attendre que auth soit prêt
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
        console.log('[ClientsPage] loadDistincts: ✅ Distinct filters loaded');
      } catch (err) {
        console.error('[ClientsPage] loadDistincts: ❌ Failed:', err);
      }
    };
    loadDistincts();
  }, [user, authReady]);

  // 🔥 Hook instantané pour les données des clients
  const { data: clients, error, isLoading, refresh } = useInstantPageData<ClientRow[]>({
    fetchFn: async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        throw new Error('Missing dependencies');
      }

      console.log('[ClientsPage] 📡 Fetching clients for user:', user.id, {
        search: debouncedSearch,
        status,
        platform,
        country,
        page
      });
      lastFetchedUserIdRef.current = user.id;

      if (!isSupabaseConfigured || !supabase) {
        console.error('Supabase not configured - cannot fetch clients');
        throw new Error('Database not configured');
      }

      try {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;

        let query = supabase
          .from('clients')
          .select('id,name,company_name,platform,email_primary,country,client_status,created_at', { count: 'exact' })
          .eq('user_id', user.id);

        if (debouncedSearch) {
          const term = `%${debouncedSearch}%`;
          query = query.or(
            `name.ilike.${term},company_name.ilike.${term},email_primary.ilike.${term},platform.ilike.${term}`
          );
        }

        if (status) query = query.eq('client_status', status);
        if (platform) query = query.eq('platform', platform);
        if (country) query = query.eq('country', country);

        query = query.order('created_at', { ascending: false }).range(start, end);

        const { data, error, count } = await query;
        if (error) throw error;

        setTotal(count || 0);
        lastFetchedUserIdRef.current = user.id;
        console.log('[ClientsPage] ✅ Fetched', data?.length || 0, 'clients (total:', count || 0, ')');
        
        return data || [];
      } catch (err: any) {
        console.error('[ClientsPage] ❌ Error:', err);
        throw new Error(err?.message || 'Failed to load clients');
      }
    },
    cacheKey: `clients-${debouncedSearch}-${status}-${platform}-${country}-${page}`,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user && authReady
  });

  // 🔥 Plus besoin de useEffect - le hook s'en charge automatiquement

  const openCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };
  const openEditFromRow = (c: ClientRow) => {
    setEditingClient(c);
    setIsModalOpen(true);
  };
  const onModalSuccess = () => {
    refresh();
  };

  // --- VIEW (lecture seule) ---
  const openView = async (id: string) => {
    // GUARD: Attendre que auth soit prêt
    if (!authReady) {
      console.log('[ClientsPage] openView: ⏳ Waiting for auth to be ready...');
      return;
    }

    console.log('[ClientsPage] openView: 📂 Opening view for client:', id);
    setIsViewOpen(true);
    setViewLoading(true);
    setViewClient(null);

    // Demo mode
    if (!isSupabaseConfigured || !supabase || !user) {
      const row = clients?.find((r) => r.id === id);
      const demo: FullClient = {
        id,
        name: row?.name || 'John Doe',
        platform: row?.platform || 'Direct',
        company_name: row?.company_name || null,
        client_type: 'individual',
        email_primary: row?.email_primary || null,
        email_secondary: null,
        phone_primary: '+33 1 23 45 67 89',
        phone_whatsapp: null,
        preferred_contact_method: 'email',
        timezone: 'UTC+1',
        preferred_language: 'English',
        country: row?.country || 'France',
        city: 'Paris',
        industry: 'Technology',
        services_needed: ['Web Development', 'SEO'],
        budget_range: '$2,500 - $5,000',
        collaboration_frequency: 'regular',
        acquisition_source: 'Referral',
        client_status: row?.client_status || 'prospect',
        priority_level: 'medium',
        payment_terms: 'Net 30',
        availability_notes: 'Available weekdays',
        important_notes: 'Likes quick responses.',
        next_action: 'Send quote',
        next_action_date: new Date().toISOString(),
        tags: ['premium', 'lead-chaud'],
        created_at: row?.created_at || new Date().toISOString(),
      };
      setViewClient(demo);
      setViewLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,name,platform,company_name,client_type,
          email_primary,email_secondary,phone_primary,phone_whatsapp,preferred_contact_method,
          timezone,preferred_language,country,city,
          industry,services_needed,budget_range,collaboration_frequency,
          acquisition_source,client_status,priority_level,payment_terms,
          availability_notes,important_notes,next_action,next_action_date,
          tags,created_at
        `)
        .eq('user_id', user.id)
        .eq('id', id)
        .single();

      if (error) throw error;
      setViewClient((data || null) as FullClient | null);
    } catch (e) {
      console.error('[Clients] view fetch error:', e);
      toast.error('Impossible de charger le client');
      setIsViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const editFromView = (c: FullClient) => {
    const mini: ClientRow = {
      id: c.id,
      name: c.name,
      company_name: c.company_name ?? null,
      platform: c.platform,
      email_primary: c.email_primary ?? null,
      country: c.country ?? null,
      client_status: c.client_status ?? null,
      created_at: c.created_at ?? null,
    };
    setIsViewOpen(false);
    setTimeout(() => openEditFromRow(mini), 0);
  };

  const badgeCls = useMemo(
    () =>
      ({
        prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      } as Record<string, string>),
    []
  );

  const clearAll = () => {
    setSearch('');
    setStatus('');
    setPlatform('');
    setCountry('');
  };

  // 🔥 NAVIGATION INSTANTANÉE - Plus jamais de loading screen
  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <ModernCard className="relative overflow-hidden p-0">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] opacity-10" />
          
          <div className="relative p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
                <p className="text-gray-400">Search, filter and manage your clients</p>
                {/* Limites d'abonnement */}
                <div className="mt-2">
                  <SubscriptionLimits 
                    resource="clients" 
                    currentCount={clients?.length || 0}
                    onUpgrade={() => window.location.href = '/upgrade'}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search (name, email, company, platform)…"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#1e2938]
                               bg-[#35414e] text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                    type="text"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#1e2938]"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                <ModernButton onClick={openCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </ModernButton>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Filters */}
        <ModernCard>
          <div className="flex items-center gap-2 mb-4 text-white">
            <Filter className="h-4 w-4 text-[#9c68f2]" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-[#1e2938] bg-[#35414e] text-white focus:ring-2 focus:ring-[#9c68f2]"
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
              className="px-3 py-2.5 rounded-lg border border-[#1e2938] bg-[#35414e] text-white focus:ring-2 focus:ring-[#9c68f2]"
            >
              <option value="">Platform (all)</option>
              {platformOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-[#1e2938] bg-[#35414e] text-white focus:ring-2 focus:ring-[#9c68f2]"
            >
              <option value="">Country (all)</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <ModernButton onClick={clearAll} variant="outline" size="sm">
              Reset
            </ModernButton>
          </div>
        </ModernCard>

        {/* Clients Grid */}
        {error ? (
          <ModernCard>
            <div className="p-6 text-center">
              <p className="text-red-400 font-semibold">Unable to load clients</p>
              <p className="text-sm text-gray-400 mt-1">{error.message}</p>
              <ModernButton onClick={refresh} className="mt-4">
                Retry
              </ModernButton>
            </div>
          </ModernCard>
        ) : !clients || clients.length === 0 ? (
          <ModernCard>
            <div className="p-10 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-white text-lg font-medium">No clients found</p>
              <p className="text-sm text-gray-400 mt-1">
                Adjust your filters or create a new client.
              </p>
              <ModernButton onClick={openCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Client
              </ModernButton>
            </div>
          </ModernCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((c) => (
              <ModernCard key={c.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => openView(c.id)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#9c68f2] transition-colors">
                        {c.name}
                      </h3>
                      {c.company_name && (
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {c.company_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openView(c.id); }}
                      className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditFromRow(c); }}
                      className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
                      title="Edit client"
                    >
                      <Edit className="h-4 w-4 text-gray-400 hover:text-[#9c68f2]" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="w-20 text-gray-500">Platform:</span>
                    <span className="text-white">{c.platform}</span>
                  </div>
                  
                  {c.email_primary && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="truncate">{c.email_primary}</span>
                    </div>
                  )}
                  
                  {c.country && (
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{c.country}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        (c.client_status && {
                          prospect: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
                          active: 'bg-green-500/20 text-green-300 border border-green-500/30',
                          inactive: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
                          completed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                        } as Record<string, string>)[(c.client_status || '').toLowerCase()] ||
                        'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}
                    >
                      {c.client_status || 'Unknown'}
                    </span>
                    {c.created_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {/* Pagination */}
        {clients && clients.length > 0 && (
          <ModernCard>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {total > 0
                  ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
                  : 'No results'}
              </p>
              <div className="flex items-center gap-2">
                <ModernButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </ModernButton>
                <span className="px-3 py-1 text-sm text-gray-300 bg-[#35414e] rounded-lg">
                  Page {page} / {totalPages}
                </span>
                <ModernButton
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        )}

        {/* Modal create/edit */}
        <ClientForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={onModalSuccess}
          client={
            editingClient
              ? {
                  id: editingClient.id,
                  name: editingClient.name,
                  platform: editingClient.platform,
                  company_name: editingClient.company_name || undefined,
                  email_primary: editingClient.email_primary || undefined,
                  country: editingClient.country || undefined,
                  client_status: editingClient.client_status || undefined,
                }
              : null
          }
        />

        {/* Modal view (lecture seule) */}
        <ClientViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          client={viewClient}
          loading={viewLoading}
          onEdit={editFromView}
        />
      </div>
  );
};

export default ClientsPageOptimized;
