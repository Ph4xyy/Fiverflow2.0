import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout, { cardClass, subtleBg } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClients } from '@/hooks/useClients';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import ClientForm from '@/components/ClientForm';
import OrderForm from '@/components/OrderForm';
import TaskForm from '@/components/TaskForm';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateForCalendar, formatDateSafe } from '@/utils/dateUtils';
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
  const { t } = useLanguage();
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
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const hasFetchedOrders = useRef(false);
  
  // 👉 Nouvel état pour le nom de l'utilisateur
  const [userName, setUserName] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from('orders')
      .select('id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)')
      .eq('clients.user_id', user.id)
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Failed to fetch orders:', error);
    } else {
      setOrders(data || []);
    }

    setLoadingOrders(false);
  }, [user]);

  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }
    setLoadingTasks(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, color, client_id')
      .eq('user_id', user.id)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } else {
      setTasks(data || []);
    }
    setLoadingTasks(false);
  }, [user]);

  useEffect(() => {
    if (!hasFetchedOrders.current) {
      hasFetchedOrders.current = true;
      fetchOrders();
      fetchTasks();
    }
  }, [fetchOrders, fetchTasks]);

  // 👉 Récupérer le nom depuis la table users
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUserName(data.name);
      }
    };

    fetchUserName();
  }, [user]);

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'from-accent-blue to-accent-purple' },
    { label: 'Active Orders', value: orders.filter(o => o.status === 'In Progress').length, icon: ShoppingCart, color: 'from-amber-500 to-orange-600' },
    { label: 'Recent Orders', value: orders.length, icon: MessageSquare, color: 'from-fuchsia-500 to-pink-600' },
    { label: 'Total Revenue', value: `$${orders.reduce((sum, o) => sum + (o.amount || 0), 0)}`, icon: DollarSign, color: 'from-emerald-500 to-teal-600' }
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
    const orderEvents = orders
      .filter(o => o.deadline)
      .map(order => {
        let barColor = '#2563eb';
        if (order.status === 'Completed') {
          barColor = '#059669';
        } else if (order.status === 'In Progress') {
          barColor = '#d97706';
        } else if (order.status === 'Pending') {
          barColor = '#dc2626';
        }

        return {
          id: `order_${order.id}`,
          title: order.title,
          start: formatDateForCalendar(order.deadline),
          allDay: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: '#e5e7eb',
          extendedProps: {
            kind: 'order',
            style: { bar: barColor, chipBg: 'rgba(148,163,184,0.14)', text: '#e2e8f0' },
            order
          }
        };
      });

    const taskEvents = tasks
      .filter(t => t.due_date)
      .map(task => {
        const bar = task.color || '#94a3b8';
        return {
          id: `task_${task.id}`,
          title: task.title,
          start: formatDateForCalendar(task.due_date),
          allDay: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: '#e5e7eb',
          extendedProps: {
            kind: 'task',
            style: { bar, chipBg: 'rgba(255,255,255,0.06)', text: '#e5e7eb' },
            task
          }
        };
      });

    return [...orderEvents, ...taskEvents];
  }, [orders, tasks]);

  const renderEvent = (arg: any) => {
    const style = (arg.event.extendedProps as any)?.style as { bar: string; chipBg: string; text: string };
    return (
      <div
        className="rounded-lg px-2 py-1 text-[12px] leading-[1.1] flex items-center gap-2"
        style={{ background: style?.chipBg, borderLeft: `3px solid ${style?.bar}` }}
      >
        <span className="truncate font-medium">{arg.event.title}</span>
      </div>
    );
  };

  const upcoming = useMemo(() => {
    const now = new Date();
    const orderItems = orders
      .filter(o => o.deadline && new Date(o.deadline) >= new Date(now.toDateString()))
      .map(o => ({ kind: 'order' as const, date: o.deadline as string, item: o }));

    const taskItems = tasks
      .filter(t => t.due_date && new Date(t.due_date) >= new Date(now.toDateString()))
      .map(t => ({ kind: 'task' as const, date: t.due_date as string, item: t }));

    return [...orderItems, ...taskItems]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [orders, tasks]);

  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* Titre */}
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {userName
            ? `${t('dashboard.welcome')}, ${userName}!`
            : t('dashboard.welcome.guest')}
        </h1>
        </div>

        {/* Stat cards (cartes très sombres) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${cardClass} p-5 overflow-hidden relative`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-15 blur-2xl bg-gradient-to-br from-slate-600 to-slate-800" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-glow-sm bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lists + actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
              <div className="text-xs px-2 py-1 rounded-full bg-[#141922] text-slate-200">
                last 20
              </div>
            </div>
            {loadingOrders ? (
              <p className="text-slate-400">Loading...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-[#141922] transition-colors">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{order.title}</p>
                      <p className="text-xs text-slate-400">{order.clients?.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">${order.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No recent orders.</p>
            )}
          </div>

          <div className={`${cardClass} p-5`}>
            <h2 className="text-lg font-semibold mb-4 text-white">{t('dashboard.quick.actions')}</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleAddClient} className="btn-primary w-full py-3 text-sm font-medium">
                {t('dashboard.add.client')}
              </button>
              <button onClick={handleAddOrder} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm">
                {t('dashboard.add.order')}
              </button>
              <button
                onClick={handleAddTask}
                disabled={restrictionsLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium px-4 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 text-sm"
              >
                {t('dashboard.add.task')}
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                {t('dashboard.add.invoice')}
              </button>
              <button
                onClick={() => navigate('/workspace/todo')}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium px-4 py-3 rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                {t('dashboard.add.todo')}
              </button>
            </div>
          </div>
        </div>

        {/* Mini calendar + upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 ${cardClass} relative overflow-hidden p-5`}>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-10 blur-3xl bg-gradient-to-br from-accent-purple to-accent-blue" />
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-2 shadow-glow-purple">
                <CalendarIcon size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Calendar (Mini)</h2>
            </div>

            {restrictionsLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : checkAccess('calendar') ? (
              <div className="rounded-xl overflow-hidden ring-1 ring-[#1C2230]">
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  height="auto"
                  dayMaxEvents={2}
                  eventDisplay="block"
                  events={calendarEvents}
                  eventContent={renderEvent}
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
                  <div className={`text-center p-6 rounded-2xl border border-dashed border-[#1C2230] bg-[#11151D]/95 backdrop-blur ${cardClass.replace('shadow','')}`}>
                    <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#141922] flex items-center justify-center">
                      <Lock className="text-slate-200" size={22} />
                    </div>
                    <p className="text-sm font-medium text-white">
                      Mini Calendar is available on <span className="text-purple-400">Pro</span> & <span className="text-purple-400">Excellence</span> plans.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upgrade to unlock scheduling on your dashboard.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/upgrade"
                        className="btn-primary"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`${cardClass} p-5`}>
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-xl ${subtleBg} flex items-center justify-center mr-2`}>
                <Clock size={18} className="text-white/90" />
              </div>
              <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
            </div>

            {loadingOrders || loadingTasks ? (
              <p className="text-slate-400">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-slate-400">No upcoming deadlines.</p>
            ) : (
              <ul className="divide-y divide-[#1C2230]">
                {upcoming.map((u) => {
                  const isOrder = u.kind === 'order';
                  const data: any = u.item;
                  const date = isOrder ? data.deadline : data.due_date;
                  const dateStr = formatDateSafe(date);
                  return (
                    <li key={`${u.kind}_${data.id}`} className="py-3 flex items-start justify-between">
                      <div className="pr-3">
                        <p className="text-sm font-medium text-white">{data.title}</p>
                        <p className="text-xs text-slate-400">{isOrder ? (data.clients?.name || '—') : 'Task'}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${subtleBg} text-slate-200`}>
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
