// src/pages/OrdersPageModern.tsx - NOUVELLE INTERFACE MODERNE
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Layout, { cardClass } from '../components/Layout';
import ModernButton from '../components/ModernButton';
import OrderForm from '../components/OrderForm';
import OrderDetailModal from '../components/OrderDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

import { usePlanLimits } from '../hooks/usePlanLimits';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Plus, 
  Search, 
  X, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  DollarSign, 
  Calendar, 
  ShoppingCart, 
  Layers,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  Building2,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Star,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import SubscriptionLimits from '../components/SubscriptionLimits';

type OrderRow = {
  id: string;
  title: string;
  budget: number | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' | string;
  due_date: string | null;
  created_at: string | null;
  clients: {
    name: string;
    platform: string | null;
  };
  description?: string | null;
  client_id?: string;
  start_date?: string | null;
  completed_date?: string | null;
  platform?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  project_type?: string | null;
  priority_level?: string | null;
  estimated_hours?: number | null;
  hourly_rate?: number | null;
  payment_status?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  revision_count?: number | null;
  client_feedback?: string | null;
};

const PAGE_SIZE = 12; // Reduced for card layout

// Status options for dropdown (matching database enum)
const ALL_STATUSES: Array<OrderRow['status']> = [
  'Pending',
  'In Progress',
  'Completed',
  'On Hold',
  'Cancelled'
];

const PageOrders: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
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

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null);

  // Detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  // Status dropdown state
  const [openStatusFor, setOpenStatusFor] = useState<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  // 🔥 NAVIGATION INSTANTANÉE - Plus de debounce, recherche immédiate
  useEffect(() => {
    setDebouncedSearch(search.trim());
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
          .from('orders')
          .select('platform')
          .eq('user_id', user.id)
          .not('platform', 'is', null);
        
        if (error) throw error;
        
        const platforms = [...new Set(data?.map(r => r.platform).filter(Boolean))];
        setPlatformOptions(platforms);
      } catch (err) {
        console.error('Error loading platforms:', err);
        setPlatformOptions(['Fiverr', 'Upwork', 'Direct']);
      }
    };
    loadPlatforms();
  }, [user]);

  // Load orders - extracted function to be called from anywhere
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Mock data for development
        const mockOrders: OrderRow[] = [
          {
            id: '1',
            title: 'Website Design',
            budget: 500,
            status: 'In Progress',
            due_date: '2024-02-15',
            created_at: '2024-01-15',
            clients: { name: 'John Doe', platform: 'Fiverr' },
            description: 'Modern website design',
            client_name: 'John Doe',
            platform: 'Fiverr'
          },
          {
            id: '2',
            title: 'Logo Creation',
            budget: 150,
            status: 'Completed',
            due_date: '2024-01-30',
            created_at: '2024-01-10',
            clients: { name: 'Jane Smith', platform: 'Upwork' },
            description: 'Professional logo design',
            client_name: 'Jane Smith',
            platform: 'Upwork'
          }
        ];
        setOrders(mockOrders);
        setTotal(mockOrders.length);
        return;
      }

      let query = supabase
        .from('orders')
        .select(`
          id, title, budget, status, due_date, created_at, description,
          client_id, start_date, completed_date, platform,
          clients!inner(name, platform)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (platform) {
        query = query.eq('platform', platform);
      }

      // Apply pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Convertir les statuts de la DB vers l'affichage utilisateur
      const getStatusForDisplay = (status: string) => {
        switch (status) {
          case 'pending': return 'Pending';
          case 'in_progress': return 'In Progress';
          case 'completed': return 'Completed';
          case 'cancelled': return 'Cancelled';
          case 'on_hold': return 'On Hold';
          default: return status;
        }
      };

      const transformed = (data || []).map((o: any) => ({
        ...o,
        status: getStatusForDisplay(o.status)
      }));

      setOrders(transformed);
      setTotal(count || 0);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch, status, platform, page]);

  // Load orders effect
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update selectedOrder when orders change (after status update, etc.)
  useEffect(() => {
    if (selectedOrder && orders.length > 0) {
      const updatedOrder = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders, selectedOrder]);

  // Open create form
  const openCreate = async () => {
    const canCreate = await checkOrderLimit();
    if (!canCreate) return;
    
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  // Open edit form
  const openEdit = (order: OrderRow) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  // Open detail modal
  const openDetail = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingOrder(null);
    // Reload orders
    window.location.reload();
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'in progress':
        return { 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          icon: <Activity className="w-4 h-4" />
        };
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          icon: <Clock className="w-4 h-4" />
        };
      case 'on hold':
        return { 
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'cancelled':
        return { 
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          icon: <X className="w-4 h-4" />
        };
      case 'awaiting payment':
        return { 
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
          icon: <DollarSign className="w-4 h-4" />
        };
      case 'in review':
        return { 
          color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
          icon: <Eye className="w-4 h-4" />
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300',
          icon: <AlertCircle className="w-4 h-4" />
        };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount);
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

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Status dropdown handlers
  const toggleStatusMenu = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOpenStatusFor(prev => (prev === orderId ? null : orderId));
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderRow['status']) => {
    // Convertir le statut pour la base de données
    const getStatusForDB = (status: string) => {
      switch (status) {
        case 'Pending': return 'pending';
        case 'In Progress': return 'in_progress';
        case 'Completed': return 'completed';
        case 'Cancelled': return 'cancelled';
        case 'On Hold': return 'on_hold';
        default: return 'pending'; // Valeur par défaut si non reconnu
      }
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        toast.error('Database not configured');
        return;
      }

      console.log('🔄 Updating order status:', { orderId, newStatus, dbStatus: getStatusForDB(newStatus) });

      const { error, data } = await supabase
        .from('orders')
        .update({ status: getStatusForDB(newStatus) })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Status updated successfully:', data);
      toast.success(`Status updated to ${newStatus}`);
      
      // Recharger toutes les données pour mettre à jour preview, edit, etc.
      await fetchOrders();
    } catch (e: any) {
      console.error('❌ Failed to update status:', e);
      toast.error(`Failed to update status: ${e.message || e}`);
    }
  };

  const selectStatus = (e: React.MouseEvent, order: OrderRow, newStatus: OrderRow['status']) => {
    e.stopPropagation();
    setOpenStatusFor(null);
    if (order.status === newStatus) return;
    
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

  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="ml-3 text-gray-400">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 font-semibold">Error loading orders</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <ModernButton onClick={() => window.location.reload()} className="mt-4">
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
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </div>
      </div>
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-white">
                {orders?.filter(o => o.status === 'In Progress').length || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">
                {orders?.filter(o => o.status === 'Completed').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(orders?.reduce((sum, order) => sum + (order.budget || 0), 0) || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
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
                placeholder="Search orders..."
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
              New Order
            </ModernButton>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-[#1C2230]">
          <div className="flex items-center gap-2 mb-3 text-slate-200">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
        </div>
      </div>

      {/* Orders Grid/List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders?.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const daysUntilDue = getDaysUntilDue(order.due_date);
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <div key={order.id} className={`${cardClass} p-4 hover:bg-[#1C2230]/50 transition-all duration-200 group`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{order.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <User className="w-3 h-3" />
                      <span>{order.clients.name}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-1 rounded-lg hover:bg-[#1C2230] opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{formatCurrency(order.budget)}</span>
                    <div className="relative" ref={openStatusFor === order.id ? statusMenuRef : undefined}>
                      <button
                        onClick={(e) => toggleStatusMenu(e, order.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color} hover:opacity-90 transition cursor-pointer`}
                        title="Change status"
                      >
                        {statusInfo.icon}
                        {order.status}
                      </button>
                      {openStatusFor === order.id && (
                        <div className="absolute z-20 right-0 mt-2 w-44 rounded-xl border border-[#1C2230] bg-[#0E121A] shadow-lg">
                          <ul className="py-1 max-h-64 overflow-auto">
                            {ALL_STATUSES.map((st) => {
                              const statusInfo = getStatusInfo(st);
                              return (
                                <li key={st}>
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#141922] ${
                                      st === order.status ? 'text-white' : 'text-slate-300'
                                    }`}
                                    onClick={(e) => selectStatus(e, order, st)}
                                  >
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${
                                      statusInfo.color.includes('green') ? 'bg-green-500' : 
                                      statusInfo.color.includes('blue') ? 'bg-blue-500' : 
                                      statusInfo.color.includes('yellow') ? 'bg-yellow-500' : 
                                      statusInfo.color.includes('red') ? 'bg-red-500' : 
                                      statusInfo.color.includes('orange') ? 'bg-orange-500' : 
                                      statusInfo.color.includes('indigo') ? 'bg-indigo-500' : 
                                      statusInfo.color.includes('amber') ? 'bg-amber-500' : 
                                      'bg-slate-500'
                                    }`}></span>
                                    {st}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {order.due_date && (
                    <div className={`flex items-center gap-2 text-xs ${
                      isOverdue ? 'text-red-400' : 
                      isDueSoon ? 'text-yellow-400' : 
                      'text-gray-400'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      <span>
                        Due: {formatDate(order.due_date)}
                        {daysUntilDue !== null && (
                          <span className="ml-1">
                            ({daysUntilDue > 0 ? `${daysUntilDue}d left` : `${Math.abs(daysUntilDue)}d overdue`})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {order.platform && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Building2 className="w-3 h-3" />
                      <span>{order.platform}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#1C2230] flex items-center gap-2">
                  <button
                    onClick={() => openDetail(order)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => openEdit(order)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-3 h-3 inline mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${cardClass} p-0 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1C2230]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2230]">
                {orders?.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const daysUntilDue = getDaysUntilDue(order.due_date);
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

                  return (
                    <tr key={order.id} className="hover:bg-[#1C2230]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{order.title}</div>
                          {order.platform && (
                            <div className="text-sm text-gray-400">{order.platform}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{order.clients.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{formatCurrency(order.budget)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative" ref={openStatusFor === order.id ? statusMenuRef : undefined}>
                        <button
                          type="button"
                          onClick={(e) => toggleStatusMenu(e, order.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color} hover:opacity-90 transition cursor-pointer`}
                          title="Change status"
                        >
                          {statusInfo.icon}
                          {order.status}
                        </button>
                        {openStatusFor === order.id && (
                          <div className="absolute z-20 mt-2 w-44 rounded-xl border border-[#1C2230] bg-[#0E121A] shadow-lg">
                            <ul className="py-1 max-h-64 overflow-auto">
                              {ALL_STATUSES.map((st) => {
                                const statusInfo = getStatusInfo(st);
                                return (
                                  <li key={st}>
                                    <button
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#141922] ${
                                        st === order.status ? 'text-white' : 'text-slate-300'
                                      }`}
                                      onClick={(e) => selectStatus(e, order, st)}
                                    >
                                      <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${
                                        statusInfo.color.includes('green') ? 'bg-green-500' : 
                                        statusInfo.color.includes('blue') ? 'bg-blue-500' : 
                                        statusInfo.color.includes('yellow') ? 'bg-yellow-500' : 
                                        statusInfo.color.includes('red') ? 'bg-red-500' : 
                                        statusInfo.color.includes('orange') ? 'bg-orange-500' : 
                                        statusInfo.color.includes('indigo') ? 'bg-indigo-500' : 
                                        statusInfo.color.includes('amber') ? 'bg-amber-500' : 
                                        'bg-slate-500'
                                      }`}></span>
                                      {st}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isOverdue ? 'text-red-400' : 
                          isDueSoon ? 'text-yellow-400' : 
                          'text-gray-400'
                        }`}>
                          {formatDate(order.due_date)}
                          {daysUntilDue !== null && (
                            <div className="text-xs">
                              {daysUntilDue > 0 ? `${daysUntilDue}d left` : `${Math.abs(daysUntilDue)}d overdue`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetail(order)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(order)}
                            className="text-gray-400 hover:text-white p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} orders
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
      <OrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        order={editingOrder}
      />

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default PageOrders;
