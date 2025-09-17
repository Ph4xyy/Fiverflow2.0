import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout, { cardClass, subtleBg } from '@/components/Layout';
import { useAuth } from './src/contexts/AuthContext';
import { useClients } from '@/hooks/useClients';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import ClientForm from '@/components/ClientForm';
import OrderForm from '@/components/OrderForm';
import TaskForm from '@/components/TaskForm';
import { supabase } from '@/lib/supabase';
import {
  Users,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Calendar as CalendarIcon,
  Clock,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients } = useClients();
  const { subscription: stripeSubscription } = useStripeSubscription();
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();
  const { checkClientLimit, checkOrderLimit } = usePlanLimits();

  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const hasFetchedOrders = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from('orders')
      .select('id, title, amount, status, deadline, created_at, clients!inner(name, user_id)')
      .eq('clients.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch orders:', error);
    } else {
      setOrders(data || []);
    }

    setLoadingOrders(false);
  }, [user]);

  useEffect(() => {
    if (!hasFetchedOrders.current) {
      hasFetchedOrders.current = true;
      fetchOrders();
    }
  }, [fetchOrders]);

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users },
    { label: 'Active Orders', value: orders.filter(o => o.status === 'In Progress').length, icon: ShoppingCart },
    { label: 'Recent Orders', value: orders.length, icon: MessageSquare },
    { label: 'Total Revenue', value: `$${orders.reduce((sum, o) => sum + (o.amount || 0), 0)}`, icon: DollarSign }
  ];

  const handleAddClient = () => setIsClientFormOpen(true);
  const handleAddOrder = () => setIsOrderFormOpen(true);

  const handleAddTask = () => {
    if (restrictionsLoading) return;
    if (!checkAccess('tasks')) {
      toast((t) => (
        <div>
          <div className="font-medium">Tasks are a Pro feature</div>
          <div className="text-sm opacity-80">Upgrade to create and manage tasks.</div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/upgrade');
              }}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white"
            >
              See plans
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm rounded border"
            >
              Not now
            </button>
          </div>
        </div>
      ));
      return;
    }
    setIsTaskFormOpen(true);
  };

  const calendarEvents = useMemo(() => {
    return orders
      .filter(o => o.deadline)
      .map(order => {
        let bgColor = '#3b82f6';
        let borderColor = '#2563eb';

        if (order.status === 'Completed') {
          bgColor = '#10b981';
          borderColor = '#059669';
        } else if (order.status === 'In Progress') {
          bgColor = '#f59e0b';
          borderColor = '#d97706';
        } else if (order.status === 'Pending') {
          bgColor = '#ef4444';
          borderColor = '#dc2626';
        }

        return {
          id: order.id,
          title: order.title,
          date: order.deadline,
          backgroundColor: bgColor,
          borderColor: borderColor,
          textColor: '#ffffff'
        };
      });
  }, [orders]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return orders
      .filter(o => o.deadline && new Date(o.deadline) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 8);
  }, [orders]);

  return (
    <Layout>
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${cardClass} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <stat.icon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {loadingOrders ? (
              <p>Loading...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{order.title}</p>
                      <p className="text-xs text-gray-500">{order.clients?.name}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">${order.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recent orders.</p>
            )}
          </div>

          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={handleAddClient} className="w-full bg-blue-500 text-white p-3 rounded-lg">Add Client</button>
              <button onClick={handleAddOrder} className="w-full bg-green-500 text-white p-3 rounded-lg">Add Order</button>
              <button
                onClick={handleAddTask}
                disabled={restrictionsLoading}
                className="w-full bg-yellow-500 text-white p-3 rounded-lg disabled:opacity-60"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 ${cardClass} relative overflow-hidden p-4`}>
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-2">
                <CalendarIcon size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar (Mini)</h2>
            </div>

            {restrictionsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : checkAccess('calendar') ? (
              <div className="rounded-md overflow-hidden">
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  height="auto"
                  dayMaxEvents={2}
                  eventDisplay="block"
                  events={calendarEvents}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="pointer-events-none select-none opacity-40 blur-[1px]">
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    height="auto"
                    events={[]}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-center p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/70 backdrop-blur ${cardClass.replace('shadow','')}`}>
                    <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Lock className="text-slate-600 dark:text-slate-300" size={22} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Mini Calendar is available on <span className="text-purple-600 dark:text-purple-400">Pro</span> & <span className="text-purple-600 dark:text-purple-400">Excellence</span> plans.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Upgrade to unlock scheduling on your dashboard.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/upgrade"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center mb-3">
              <div className={`w-9 h-9 rounded-lg ${subtleBg} flex items-center justify-center mr-2`}>
                <Clock size={18} className="text-white/90" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
            </div>

            {loadingOrders ? (
              <p className="text-gray-500">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-gray-500">No upcoming deadlines.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                {upcoming.map((o) => {
                  const d = new Date(o.deadline);
                  const dateStr = d.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <li key={o.id} className="py-3 flex items-start justify-between">
                      <div className="pr-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{o.title}</p>
                        <p className="text-xs text-gray-500">{o.clients?.name || '—'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${subtleBg} text-gray-700 dark:text-slate-200`}>
                        {dateStr}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <ClientForm
          isOpen={isClientFormOpen}
          onClose={() => setIsClientFormOpen(false)}
          onSuccess={fetchOrders}
          client={null}
        />
        <OrderForm
          isOpen={isOrderFormOpen}
          onClose={() => setIsOrderFormOpen(false)}
          onSuccess={fetchOrders}
          order={null}
        />
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSuccess={() => {
            toast.success('Task saved');
          }}
          task={null}
        />
      </div>
    </Layout>
  );
};

export default DashboardPage;
