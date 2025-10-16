import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout, { cardClass, subtleBg } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useInstantPageData } from '@/hooks/useInstantPageData';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useClients } from '@/hooks/useClients';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import ClientForm from '@/components/ClientForm';
import OrderForm from '@/components/OrderForm';
import TaskForm from '@/components/TaskForm';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateForCalendar, formatDateSafe } from '@/utils/dateUtils';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import {
  Users,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Calendar as CalendarIcon,
  Clock,
  Lock,
  ListChecks,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const DashboardPageOptimized = () => {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const { currency } = useCurrency();
  const { clients } = useClients();
  const { subscription: stripeSubscription } = useStripeSubscription();
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();
  const { checkClientLimit, checkOrderLimit } = usePlanLimits();
  const { subscriptions } = useSubscriptions();

  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  // 🔥 NAVIGATION INSTANTANÉE - Plus d'états de chargement
  const hasFetchedUserIdRef = useRef<string | null>(null);
  
  // 👉 Nouvel état pour le nom de l'utilisateur
  const [userName, setUserName] = useState<string | null>(null);

  console.log('[DashboardPage] Render:', { 
    hasUser: !!user, 
    userId: user?.id,
    authReady, 
    hasFetchedUserId: hasFetchedUserIdRef.current,
  });

  // 🔥 Hook instantané pour les commandes
  const { data: orders, error: ordersError, refresh: refreshOrders } = useInstantPageData<any[]>({
    fetchFn: async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        console.log('[DashboardPage] ❌ No Supabase or no user');
        return [];
      }

      console.log('[DashboardPage] 📡 Fetching orders for user:', user.id);
      hasFetchedUserIdRef.current = user.id;

      const { data, error } = await supabase
        .from('orders')
        .select('id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)')
        .eq('clients.user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) {
        console.error('[DashboardPage] ❌ Failed to fetch orders:', error);
        throw new Error(error.message);
      }

      console.log('[DashboardPage] ✅ Fetched', data?.length || 0, 'orders');
      return data || [];
    },
    cacheKey: 'dashboard-orders',
    cacheTime: 3 * 60 * 1000, // 3 minutes
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!user && authReady
  });

  // 🔥 Hook instantané pour les tâches
  const { data: tasks, error: tasksError, refresh: refreshTasks } = useInstantPageData<any[]>({
    fetchFn: async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        console.log('[DashboardPage] ❌ No Supabase or no user');
        return [];
      }

      console.log('[DashboardPage] 📡 Fetching tasks for user:', user.id);

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, status, priority, due_date, created_at')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('[DashboardPage] ❌ Failed to fetch tasks:', error);
        throw new Error(error.message);
      }

      console.log('[DashboardPage] ✅ Fetched', data?.length || 0, 'tasks');
      return data || [];
    },
    cacheKey: 'dashboard-tasks',
    cacheTime: 3 * 60 * 1000, // 3 minutes
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!user && authReady
  });

  // 🔥 Hook instantané pour le nom d'utilisateur
  const { data: userProfile } = useInstantPageData<any>({
    fetchFn: async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        return { name: 'User' };
      }

      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('[DashboardPage] Failed to fetch user name:', error);
        return { name: 'User' };
      }

      return data || { name: 'User' };
    },
    cacheKey: 'user-profile',
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user && authReady
  });

  // Mettre à jour le nom d'utilisateur
  useEffect(() => {
    if (userProfile?.name) {
      setUserName(userProfile.name);
    }
  }, [userProfile]);

  // 🔥 Plus besoin de useEffect pour fetch - les hooks s'en chargent

  const onClientSuccess = useCallback(() => {
    refreshOrders();
    toast.success('Client created successfully!');
    setIsClientFormOpen(false);
  }, [refreshOrders]);

  const onOrderSuccess = useCallback(() => {
    refreshOrders();
    toast.success('Order created successfully!');
    setIsOrderFormOpen(false);
  }, [refreshOrders]);

  const onTaskSuccess = useCallback(() => {
    refreshTasks();
    toast.success('Task created successfully!');
    setIsTaskFormOpen(false);
  }, [refreshTasks]);

  // 🔥 Calculs optimisés avec useMemo
  const stats = useMemo(() => {
    const totalRevenue = (orders || []).reduce((sum, order) => {
      return sum + (parseFloat(order.amount) || 0);
    }, 0);

    const pendingOrders = (orders || []).filter(order => 
      order.status === 'pending' || order.status === 'in_progress'
    ).length;

    const completedOrders = (orders || []).filter(order => 
      order.status === 'completed'
    ).length;

    const urgentTasks = (tasks || []).filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && task.status !== 'completed';
    }).length;

    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      urgentTasks,
      totalClients: clients?.length || 0,
    };
  }, [orders, tasks, clients]);

  const upcomingDeadlines = useMemo(() => {
    if (!orders) return [];
    
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return (orders || [])
      .filter(order => {
        if (!order.deadline) return false;
        const deadline = new Date(order.deadline);
        return deadline >= now && deadline <= nextWeek && order.status !== 'completed';
      })
      .slice(0, 5)
      .map(order => ({
        ...order,
        deadline: formatDateForCalendar(new Date(order.deadline)),
        isOverdue: new Date(order.deadline) < now
      }));
  }, [orders]);

  const recentTasks = useMemo(() => {
    if (!tasks) return [];
    
    return (tasks || [])
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime())
      .slice(0, 5);
  }, [tasks]);

  const calendarEvents = useMemo(() => {
    const events = [];
    
    // Ajouter les deadlines des commandes
    (orders || []).forEach(order => {
      if (order.deadline) {
        events.push({
          title: `📋 ${order.title}`,
          date: order.deadline,
          backgroundColor: order.status === 'completed' ? '#10b981' : '#f59e0b',
          borderColor: order.status === 'completed' ? '#10b981' : '#f59e0b',
        });
      }
    });
    
    // Ajouter les tâches
    (tasks || []).forEach(task => {
      if (task.due_date) {
        events.push({
          title: `✅ ${task.title}`,
          date: task.due_date,
          backgroundColor: task.status === 'completed' ? '#10b981' : '#3b82f6',
          borderColor: task.status === 'completed' ? '#10b981' : '#3b82f6',
        });
      }
    });
    
    return events;
  }, [orders, tasks]);

  // 🔥 NAVIGATION INSTANTANÉE - Plus jamais de loading screen
  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-0">
        {/* Header avec salutation personnalisée */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Bonjour {userName || 'User'} ! 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsClientFormOpen(true)}
              disabled={!checkAccess('clients')}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="h-4 w-4 mr-2" />
              Nouveau client
            </button>
            
            <button
              onClick={() => setIsOrderFormOpen(true)}
              disabled={!checkAccess('orders')}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Nouvelle commande
            </button>
            
            <button
              onClick={() => setIsTaskFormOpen(true)}
              disabled={!checkAccess('tasks')}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Revenus totaux</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currency.symbol}{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardClass} p-6`}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Commandes en cours</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className={`${cardClass} p-6`}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Clients</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalClients}</p>
              </div>
            </div>
          </div>

          <div className={`${cardClass} p-6`}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Tâches urgentes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.urgentTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Échéances à venir
              </h3>
              <Link 
                to="/orders" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">Aucune échéance à venir</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{order.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Client: {order.clients?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${order.isOverdue ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                        {order.deadline}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currency.symbol}{order.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Tâches récentes
              </h3>
              <Link 
                to="/tasks" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <ListChecks className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">Aucune tâche en cours</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatDateSafe(task.due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className={`${cardClass} p-6`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Calendrier
          </h3>
          <div className="h-96">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              height="100%"
              dayMaxEvents={3}
              eventDisplay="block"
              eventTextColor="#ffffff"
              eventBorderColor="transparent"
            />
          </div>
        </div>

        {/* Plan Restrictions Warning */}
        {restrictions && !restrictionsLoading && (
          <div className={`${cardClass} p-6 border-l-4 border-yellow-500`}>
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Plan {restrictions.plan}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Vous utilisez actuellement le plan {restrictions.plan}. 
                  <Link to="/upgrade" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                    Passez à un plan supérieur
                  </Link> pour débloquer plus de fonctionnalités.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Forms */}
        <ClientForm
          isOpen={isClientFormOpen}
          onClose={() => setIsClientFormOpen(false)}
          onSuccess={onClientSuccess}
        />

        <OrderForm
          isOpen={isOrderFormOpen}
          onClose={() => setIsOrderFormOpen(false)}
          onSuccess={onOrderSuccess}
        />

        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSuccess={onTaskSuccess}
        />
      </div>
    </Layout>
  );
};

export default DashboardPageOptimized;
