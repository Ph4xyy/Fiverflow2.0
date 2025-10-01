// src/pages/OrdersPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout, { cardClass } from '@/components/Layout';
import OrderForm from '@/components/OrderForm';
import OrderDetailModal from '@/components/OrderDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Plus, Search, X, Filter, ChevronLeft, ChevronRight,
  DollarSign, Calendar, ShoppingCart, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

type OrderRow = {
  id: string;
  title: string;
  amount: number | null;
  status: 'Pending' | 'In Progress' | 'Completed' | string;
  deadline: string | null;
  created_at: string | null;
  clients: {
    name: string;
    platform: string | null;
  };
};

const PAGE_SIZE = 20;

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { checkOrderLimit } = usePlanLimits();

  // Data
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Search (debounced)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters
  const [status, setStatus] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null);

  // Detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, platform]);

  // Load platform options
  useEffect(() => {
    const loadPlatforms = async () => {
      if (!user) return;
      if (!isSupabaseConfigured || !supabase) {
        setPlatformOptions(['Fiverr', 'Upwork', 'Direct']);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('platform')
          .eq('user_id', user.id)
          .not('platform', 'is', null);

        if (error) throw error;
        const setP = new Set<string>();
        (data || []).forEach((r: any) => r.platform && setP.add(r.platform));
        setPlatformOptions(Array.from(setP).sort());
      } catch {
        // no-op
      }
    };
    loadPlatforms();
  }, [user]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      const demo: OrderRow[] = Array.from({ length: 42 }).map((_, i) => ({
        id: String(i + 1),
        title: i % 3 ? `Website Redesign #${i + 1}` : `Mobile App #${i + 1}`,
        amount: 250 + (i % 7) * 150,
        status: (['Pending', 'In Progress', 'Completed'] as const)[i % 3],
        deadline: new Date(Date.now() + (i % 15) * 86400000).toISOString(),
        created_at: new Date().toISOString(),
        clients: {
          name: i % 2 ? `Acme Corp` : `John Doe`,
          platform: ['Fiverr', 'Upwork', 'Direct'][i % 3]
        }
      }));

      let filtered = demo;
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        filtered = filtered.filter(o =>
          [o.title, o.clients.name, o.clients.platform || '']
            .some(v => (v || '').toLowerCase().includes(term))
        );
      }
      if (status) filtered = filtered.filter(o => (o.status || '') === status);
      if (platform) filtered = filtered.filter(o => (o.clients.platform || '') === platform);

      setTotal(filtered.length);
      const start = (page - 1) * PAGE_SIZE;
      setOrders(filtered.slice(start, start + PAGE_SIZE));
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('orders')
        .select(`id,title,amount,status,deadline,created_at, clients!inner(name,platform,user_id)`, { count: 'exact' })
        .eq('clients.user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (platform) query = query.eq('clients.platform', platform);

      if (debouncedSearch) {
        const term = `%${debouncedSearch}%`;
        query = query.or(`title.ilike.${term},clients.name.ilike.${term}`);
      }

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;
      if (error) throw error;

      const transformed = (data || []).map((o: any) => ({
        ...o,
        clients: {
          name: o.clients.name,
          platform: o.clients.platform
        }
      })) as OrderRow[];

      setOrders(transformed);
      setTotal(count || 0);
    } catch (e: any) {
      console.error('Error fetching orders:', e);
      toast.error('Failed to load orders');
      setOrders([]);
      setTotal(0);
      setError(e?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, debouncedSearch, status, platform, page]); // eslint-disable-line

  // Listen for session refresh to refetch data
  useEffect(() => {
    const onRefreshed = () => {
      fetchOrders();
    };
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', onRefreshed as any);
  }, [fetchOrders]);

  const handleAddOrder = async () => {
    const canAdd = await checkOrderLimit();
    if (canAdd) {
      setEditingOrder(null);
      setIsFormOpen(true);
    }
  };

  const openDetail = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const editOrder = (order: OrderRow) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const onFormSuccess = () => {
    setIsFormOpen(false);
    fetchOrders();
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Awaiting Payment':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'In Review':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';
    }
  };

  const platformChip = (p?: string | null) =>
    p
      ? {
          Fiverr: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
          Upwork: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
          Direct: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        }[p] || 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';

  const kpis = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.amount || 0), 0);
    const pendingRevenue = orders
      .filter(o => o.status !== 'Completed')
      .reduce((s, o) => s + (o.amount || 0), 0);
    const inProgress = orders.filter(o => o.status === 'In Progress').length;
    return { totalRevenue, pendingRevenue, inProgress };
  }, [orders]);

  const clearAll = () => {
    setSearch('');
    setStatus('');
    setPlatform('');
  };

  // ----- Status options (dropdown) -----
  const ALL_STATUSES: Array<OrderRow['status']> = [
    'Pending',
    'In Progress',
    'Completed',
    'On Hold',
    'Cancelled',
    'Awaiting Payment',
    'In Review'
  ];

  const updateOrderStatus = async (orderId: string, newStatus: OrderRow['status']) => {
    if (!isSupabaseConfigured || !supabase) {
      // Demo mode: just update local state
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Status updated to ${newStatus}`);
      return;
    }
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
    } catch (e: any) {
      console.error('Failed to update status', e);
      toast.error('Failed to update status');
      // force refresh to revert optimistic update
      fetchOrders();
    }
  };

  // Dropdown state & handlers
  const [openStatusFor, setOpenStatusFor] = useState<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const toggleStatusMenu = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOpenStatusFor(prev => (prev === orderId ? null : orderId));
  };
  const selectStatus = (e: React.MouseEvent, order: OrderRow, newStatus: OrderRow['status']) => {
    e.stopPropagation();
    setOpenStatusFor(null);
    if (order.status === newStatus) return;
    setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: newStatus } : o)));
    updateOrderStatus(order.id, newStatus);
  };

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && statusMenuRef.current.contains(e.target as Node)) {
        return;
      }
      setOpenStatusFor(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenStatusFor(null);
    };
    if (openStatusFor) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openStatusFor]);

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-white shadow-glow-sm">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Orders</h1>
              <p className="text-sm text-slate-400">Track, filter and manage all your client orders.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search (title, client, platform)…"
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
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>

            <button
              onClick={handleAddOrder}
              className="inline-flex items-center px-4 py-2.5 rounded-xl btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </button>
          </div>
        </div>

        {/* KPIs — conteneur unique, proportions stables */}
        <div className={`${cardClass} p-0`}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1C2230]">
            {/* Total Revenue */}
            <div className="p-4 sm:p-5 flex items-center gap-4 min-h-[84px]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-emerald-500 to-teal-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Revenue</div>
                <div className="text-2xl font-semibold text-white truncate">
                  ${kpis.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Pending Revenue */}
            <div className="p-4 sm:p-5 flex items-center gap-4 min-h-[84px]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-amber-500 to-orange-600">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Pending Revenue</div>
                <div className="text-2xl font-semibold text-white truncate">
                  ${kpis.pendingRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="p-4 sm:p-5 flex items-center gap-4 min-h-[84px]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-indigo-500 to-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">In Progress</div>
                <div className="text-2xl font-semibold text-white truncate">
                  {kpis.inProgress}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardClass} p-3 sm:p-4`}>
          <div className="flex items-center gap-2 mb-3 text-slate-200">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtres</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#1C2230] bg-[#11151D]/95 text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Status (all)</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
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

            <button
              onClick={clearAll}
              className="px-3 py-2.5 rounded-xl border border-[#1C2230] hover:bg-[#141922] text-slate-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={`${cardClass}`}>
          {loading ? (
            <div className="p-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
              <span className="ml-3 text-slate-400">Chargement…</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-400 font-semibold">Impossible de charger les commandes</p>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 rounded-xl btn-primary"
              >
                Réessayer
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto bg-[#151A22] ring-1 ring-inset ring-[#1C2230] mb-3">
                <ShoppingCart className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">No orders</h3>
              <p className="mt-1 text-sm text-slate-400">Get started by creating your first order.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#1C2230]">
                  <thead className="bg-[#0F141C]">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Deadline
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-[#0B0E14] divide-y divide-[#1C2230]">
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-[#11161F] cursor-pointer"
                        onClick={() => openDetail(o)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{o.title}</div>
                          {o.created_at && (
                            <div className="text-xs text-slate-400">
                              Created on {new Date(o.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                          {o.clients.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${platformChip(o.clients.platform)}`}>
                            {o.clients.platform || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {typeof o.amount === 'number' ? `$${o.amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap relative" ref={openStatusFor === o.id ? statusMenuRef : undefined}>
                          <button
                            type="button"
                            onClick={(e) => toggleStatusMenu(e, o.id)}
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(o.status)} hover:opacity-90 transition`}
                            title="Change status"
                          >
                            {o.status}
                          </button>
                          {openStatusFor === o.id && (
                            <div
                              className="absolute z-20 mt-2 w-44 rounded-xl border border-[#1C2230] bg-[#0E121A] shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ul className="py-1 max-h-64 overflow-auto">
                                {ALL_STATUSES.map((st) => (
                                  <li key={st}>
                                    <button
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#141922] ${st === o.status ? 'text-white' : 'text-slate-300'}`}
                                      onClick={(e) => selectStatus(e, o, st)}
                                    >
                                      <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${getStatusBadge(st).includes('green') ? 'bg-green-500' : getStatusBadge(st).includes('blue') ? 'bg-blue-500' : getStatusBadge(st).includes('yellow') ? 'bg-yellow-500' : getStatusBadge(st).includes('red') ? 'bg-red-500' : getStatusBadge(st).includes('orange') ? 'bg-orange-500' : getStatusBadge(st).includes('indigo') ? 'bg-indigo-500' : getStatusBadge(st).includes('amber') ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                                      {st}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                          {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); editOrder(o); }}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1C2230]">
                <p className="text-sm text-slate-300">
                  {total > 0
                    ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
                    : 'No results'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#1C2230] text-slate-200 hover:bg-[#141922] disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Précédent
                  </button>
                  <span className="text-sm text-slate-300">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#1C2230] text-slate-200 hover:bg-[#141922] disabled:opacity-50"
                  >
                    Suivant <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        <OrderForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={onFormSuccess}
          order={editingOrder}
        />

        <OrderDetailModal
          order={selectedOrder}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={(order: any) => {
            setIsDetailModalOpen(false);
            const orow: OrderRow = order?.clients
              ? order
              : {
                  ...order,
                  clients: { name: order?.client_name || 'Client', platform: order?.platform || null },
                };
            editOrder(orow);
          }}
        />
      </div>
    </Layout>
  );
};

export default OrdersPage;
