import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout, { pageBgClass, cardClass } from '@/components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import SubscriptionManager from '@/components/SubscriptionManager';
import EventPreviewModal from '@/components/EventPreviewModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateSafe } from '@/utils/dateUtils';

import FullCalendar from '@fullcalendar/react';
import { EventContentArg, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import {
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Search as SearchIcon,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

/** FullCalendar CSS (v6.1.17 compatible) */
// Note: FullCalendar v6 CSS is included automatically when using the packages
// No manual CSS imports needed for v6+






/* ---------------- Types ---------------- */
type UUID = string;

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

type OrderRow = {
  id: string;
  title: string;
  amount: number | null;
  status: 'Pending' | 'In Progress' | 'Completed' | string;
  deadline: string | null;
  created_at: string | null;
  clients: { name: string; platform: string | null; user_id?: string } | null;
};

type TaskRow = {
  id: UUID;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  color?: string | null;
  client_id?: string | null;
};

type MixedItem =
  | { kind: 'order'; date: string; title: string; colorBar: string; subtitle?: string | null }
  | { kind: 'task'; date: string; title: string; colorBar: string; subtitle?: string | null }
  | { kind: 'subscription'; date: string; title: string; colorBar: string; subtitle?: string | null; amount: number; currency: string; billing_cycle: string };

/* ---------------- Styles helpers ---------------- */
const statusStyle = (status: string) => {
  switch (status) {
    case 'Completed':
      return { bar: '#16a34a', chipBg: 'rgba(22,163,74,0.12)', text: '#d1fae5' };
    case 'In Progress':
      return { bar: '#2563eb', chipBg: 'rgba(37,99,235,0.12)', text: '#dbeafe' };
    case 'Pending':
      return { bar: '#f59e0b', chipBg: 'rgba(245,158,11,0.14)', text: '#ffedd5' };
    default:
      return { bar: '#64748b', chipBg: 'rgba(100,116,139,0.14)', text: '#e2e8f0' };
  }
};

const taskStyleFromPriority = (p: TaskPriority, fallbackHex?: string | null) => {
  if (fallbackHex) {
    return { bar: fallbackHex, chipBg: 'rgba(255,255,255,0.06)', text: '#e5e7eb' };
  }
  switch (p) {
    case 'urgent':
      return { bar: '#ef4444', chipBg: 'rgba(239,68,68,0.12)', text: '#fee2e2' };
    case 'high':
      return { bar: '#f97316', chipBg: 'rgba(249,115,22,0.12)', text: '#ffedd5' };
    case 'medium':
      return { bar: '#3b82f6', chipBg: 'rgba(59,130,246,0.12)', text: '#dbeafe' };
    default:
      return { bar: '#94a3b8', chipBg: 'rgba(148,163,184,0.12)', text: '#e2e8f0' };
  }
};

/* Util */
const toDateOnly = (d: Date | null): string | null => {
  if (!d) return null;
  const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

/* ---------------- Page ---------------- */
const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();

  // View + UI
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [title, setTitle] = useState<string>('');
  const calendarRef = useRef<FullCalendar | null>(null);

  // Filters / toggles / search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOrders, setShowOrders] = useState<boolean>(true);
  const [showTasks, setShowTasks] = useState<boolean>(true);
  const [showSubscriptions, setShowSubscriptions] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');

  // Data states
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Event preview states
  const [previewEvent, setPreviewEvent] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /* ---------------- Fetch Orders ---------------- */
  const fetchOrders = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setOrders([]);
      return;
    }
    const { data, error } = await supabase
      .from('orders')
      .select(`id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)`)
      .eq('clients.user_id', user.id)
      .order('deadline', { ascending: true });

    if (error) throw error;
    setOrders((data || []) as OrderRow[]);
  }, [user]);

  /* ---------------- Fetch Tasks ---------------- */
  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setTasks([]);
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .select(`id, title, status, priority, due_date, color, client_id`)
      .eq('user_id', user.id)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true });

    if (error) throw error;
    setTasks((data || []) as TaskRow[]);
  }, [user]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchOrders(), fetchTasks()]);
    } catch (err: any) {
      setError(err?.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchOrders, fetchTasks]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAll();
    }
  }, [fetchAll]);

  // Listen for session refresh to refetch data
  useEffect(() => {
    const onRefreshed = () => {
      hasFetchedRef.current = false;
      fetchAll();
    };
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', onRefreshed as any);
  }, [fetchAll]);

  /* ---------------- Build events ---------------- */
  const filteredOrders = useMemo(() => {
    if (!showOrders) return [];
    const base = statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status.toLowerCase().replace(' ', '_') === statusFilter);

    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(o => {
      const hay = [
        o.title,
        o.clients?.name || '',
        o.clients?.platform || '',
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [orders, statusFilter, showOrders, query]);

  const filteredTasks = useMemo(() => {
    if (!showTasks) return [];
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t => [t.title].join(' ').toLowerCase().includes(q));
  }, [tasks, showTasks, query]);

  const filteredSubscriptions = useMemo(() => {
    if (!showSubscriptions) return [];
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions.filter((s: any) => s.is_active);
    return subscriptions.filter((s: any) => s.is_active && [
      s.name,
      s.provider || '',
      s.description || '',
    ].join(' ').toLowerCase().includes(q));
  }, [subscriptions, showSubscriptions, query]);

  useEffect(() => {
    const orderEvents = filteredOrders
      .filter((o) => !!o.deadline)
      .map((o) => {
        const s = statusStyle(o.status);
        return {
          id: `order_${o.id}`,
          title: o.title,
          start: o.deadline,
          allDay: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: s.text,
          extendedProps: { kind: 'order', order: o, style: s }
        };
      });

    const taskEvents = filteredTasks
      .filter((t) => !!t.due_date)
      .map((t) => {
        const s = taskStyleFromPriority(t.priority, t.color ?? undefined);
        const prefix = t.status === 'done' ? '✓ ' : '';
        return {
          id: `task_${t.id}`,
          title: `${prefix}${t.title}`,
          start: t.due_date!,
          allDay: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: s.text,
          extendedProps: { kind: 'task', task: t, style: s }
        };
      });

    const subscriptionEvents = filteredSubscriptions
      .filter((s: any) => !!s.next_renewal_date)
      .map((s: any) => {
        const color = s.color || '#8b5cf6';
        const style = {
          bar: color,
          chipBg: `${color}20`,
          text: '#e5e7eb'
        };
        return {
          id: `subscription_${s.id}`,
          title: s.name,
          start: s.next_renewal_date,
          allDay: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: style.text,
          extendedProps: { kind: 'subscription', subscription: s, style }
        };
      });

    setEvents([...orderEvents, ...taskEvents, ...subscriptionEvents]);
  }, [filteredOrders, filteredTasks, filteredSubscriptions]);

  /* ---------------- Event click handler ---------------- */
  const handleEventClick = useCallback((info: any) => {
    const event = info.event;
    const extendedProps = event.extendedProps;
    const kind = extendedProps?.kind;

    if (kind === 'order') {
      const order = extendedProps.order;
      setPreviewEvent({ kind: 'order', order });
      setIsPreviewOpen(true);
    } else if (kind === 'task') {
      const task = extendedProps.task;
      setPreviewEvent({ kind: 'task', task });
      setIsPreviewOpen(true);
    } else if (kind === 'subscription') {
      const subscription = extendedProps.subscription;
      setPreviewEvent({ kind: 'subscription', subscription });
      setIsPreviewOpen(true);
    }
  }, []);

  /* ---------------- Event drop ---------------- */
  const onEventDrop = useCallback(async (info: any) => {
    const newDate = toDateOnly(info.event.start);
    if (!newDate) return info.revert();

    const idStr = String(info.event.id);
    const isTask = idStr.startsWith('task_');
    const rawId = idStr.replace(/^task_|^order_/, '');

    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('DB non configurée');

      if (isTask) {
        setTasks(prev => prev.map(t => t.id === rawId ? { ...t, due_date: newDate } : t));
        const { error } = await supabase.from('tasks').update({ due_date: newDate }).eq('id', rawId);
        if (error) throw error;
      } else {
        setOrders(prev => prev.map(o => o.id === rawId ? { ...o, deadline: newDate } : o));
        const { error } = await supabase.from('orders').update({ deadline: newDate }).eq('id', rawId);
        if (error) throw error;
      }

      toast.success('Date mise à jour');
    } catch (e: any) {
      console.error('[onEventDrop]', e);
      toast.error(`Impossible d’enregistrer: ${e?.message || 'erreur inconnue'}`);
      info.revert();
    }
  }, [user]);

  /* ---------------- Controls ---------------- */
  const handleRefresh = async () => {
    setRefreshing(true);
    hasFetchedRef.current = false;
    await fetchAll();
    toast.success('Calendar refreshed!');
  };

  const goto = (dir: 'prev' | 'next' | 'today') => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (dir === 'today') api.today();
    if (dir === 'prev') api.prev();
    if (dir === 'next') api.next();
    setTitle(api.view?.title || '');
  };

  const switchView = (view: typeof currentView) => {
    setCurrentView(view);
    const api = calendarRef.current?.getApi();
    api?.changeView(view);
    setTitle(api?.view?.title || '');
  };

  const onDatesSet = (arg: DatesSetArg) => {
    setTitle(arg.view.title);
  };

  /* ---------------- Render event ---------------- */
  const renderEvent = (arg: EventContentArg) => {
    const style = (arg.event.extendedProps as any)?.style as { bar: string; chipBg: string; text: string };
    const kind: 'order' | 'task' | 'subscription' | undefined = (arg.event.extendedProps as any)?.kind;
    const order: OrderRow | undefined = (arg.event.extendedProps as any)?.order;
    const subscription: any = (arg.event.extendedProps as any)?.subscription;

    const subtitle = kind === 'order' 
      ? (order?.clients?.platform || order?.clients?.name || null)
      : kind === 'subscription' 
        ? (subscription?.provider || null)
        : null;

    return (
      <div
        className="rounded-lg px-2 py-1 text-[12px] leading-[1.1] flex items-center gap-2 cursor-grab active:cursor-grabbing"
        style={{ background: style.chipBg, borderLeft: `3px solid ${style.bar}` }}
      >
        {kind === 'task' && <ListChecks size={12} className="opacity-80" />}
        {kind === 'subscription' && <CreditCard size={12} className="opacity-80" />}
        <span className="truncate font-medium">{arg.event.title}</span>
        {subtitle && <span className="text-[11px] opacity-80 truncate">{subtitle}</span>}
      </div>
    );
  };

  /* ---------------- Upcoming ---------------- */
  const upcoming = useMemo<MixedItem[]>(() => {
    const now = new Date();
    const oItems: MixedItem[] = orders
      .filter((o) => o.deadline && new Date(o.deadline) >= new Date(now.toDateString()))
      .map((o) => ({ kind: 'order', date: o.deadline!, title: o.title, colorBar: statusStyle(o.status).bar, subtitle: o.clients?.platform || o.clients?.name || null }));

    const tItems: MixedItem[] = tasks
      .filter((t) => t.due_date && new Date(t.due_date) >= new Date(now.toDateString()))
      .map((t) => ({ kind: 'task', date: t.due_date!, title: t.title, colorBar: taskStyleFromPriority(t.priority, t.color ?? undefined).bar, subtitle: null }));

    const sItems: MixedItem[] = subscriptions
      .filter((s: any) => s.is_active && s.next_renewal_date && new Date(s.next_renewal_date) >= new Date(now.toDateString()))
      .map((s: any) => ({ 
        kind: 'subscription', 
        date: s.next_renewal_date!, 
        title: s.name, 
        colorBar: s.color || '#8b5cf6', 
        subtitle: s.provider || null,
        amount: s.amount,
        currency: s.currency,
        billing_cycle: s.billing_cycle
      }));

    return [...oItems, ...tItems, ...sItems]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [orders, tasks, subscriptions]);

  /* ---------------- Gates ---------------- */
  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-4 text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!checkAccess('calendar')) {
    return (
      <PlanRestrictedPage
        feature="calendar"
        currentPlan={restrictions?.plan || 'free'}
        isTrialActive={restrictions?.isTrialActive}
        trialDaysRemaining={restrictions?.trialDaysRemaining}
      />
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-4 text-slate-400">Loading calendar...</p>
        </div>
      </Layout>
    );
  }

  /* ---------------- Page ---------------- */
  return (
    <Layout>
      <div className={`space-y-6 p-4 sm:p-0 ${pageBgClass}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 grid place-items-center">
              <CalendarIcon className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Calendar</h1>
              <p className="text-sm sm:text-base text-slate-400">Deadlines & schedule overview</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg overflow-hidden ring-1 ring-inset ring-[#1C2230]">
              <button
                onClick={() => goto('prev')}
                className="px-3 py-2 bg-[#0E121A] hover:bg-[#121722] text-slate-100"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => goto('today')}
                className="px-3 py-2 bg-[#0E121A] hover:bg-[#121722] text-slate-100"
              >
                Today
              </button>
              <button
                onClick={() => goto('next')}
                className="px-3 py-2 bg-[#0E121A] hover:bg-[#121722] text-slate-100"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="inline-flex rounded-lg overflow-hidden ring-1 ring-inset ring-[#1C2230]">
              <button
                onClick={() => switchView('dayGridMonth')}
                className={`px-3 py-2 text-sm ${currentView === 'dayGridMonth' ? 'bg-blue-600 text-white' : 'bg-[#0E121A] text-slate-200 hover:bg-[#121722]'}`}
              >
                Month
              </button>
              <button
                onClick={() => switchView('timeGridWeek')}
                className={`px-3 py-2 text-sm ${currentView === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'bg-[#0E121A] text-slate-200 hover:bg-[#121722]'}`}
              >
                Week
              </button>
              <button
                onClick={() => switchView('timeGridDay')}
                className={`px-3 py-2 text-sm ${currentView === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-[#0E121A] text-slate-200 hover:bg-[#121722]'}`}
              >
                Day
              </button>
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230] focus:outline-none"
              title="Filter orders by status"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Toggles */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230]">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-sky-500" checked={showOrders} onChange={(e) => setShowOrders(e.target.checked)} />
                <span className="text-sm">Orders</span>
              </label>
              <span className="text-slate-600">|</span>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-fuchsia-500" checked={showTasks} onChange={(e) => setShowTasks(e.target.checked)} />
                <span className="text-sm">Tasks</span>
              </label>
              <span className="text-slate-600">|</span>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-purple-500" checked={showSubscriptions} onChange={(e) => setShowSubscriptions(e.target.checked)} />
                <span className="text-sm">Subscriptions</span>
              </label>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, client, platform…"
                className="pl-9 pr-3 py-2 text-sm rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230] focus:outline-none w-56"
              />
              <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              disabled
              className="inline-flex items-center px-3 py-2 rounded-lg bg-[#0E121A] text-slate-500 cursor-not-allowed ring-1 ring-inset ring-[#1C2230]"
              title="External sync (coming soon)"
            >
              <ExternalLink size={16} className="mr-2" />
              Sync
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 flex items-start gap-3 border border-red-700/40 bg-red-900/20">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div>
              <p className="text-red-300 font-semibold">Unable to load calendar data</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Calendar */}
          <section className="lg:col-span-8 xl:col-span-9">
            <div className={`${cardClass} p-3`}>
              <div className="px-1 pb-3">
                <div className="text-lg font-semibold text-white">{title}</div>
              </div>
              <FullCalendar
                ref={calendarRef as any}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                headerToolbar={false}
                height="auto"
                expandRows
                stickyHeaderDates
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                events={events}
                eventContent={renderEvent}
                datesSet={onDatesSet}
                editable
                eventStartEditable
                eventDurationEditable={false}
                droppable={false}
                eventDrop={onEventDrop}
                eventClick={handleEventClick}
                dayHeaderClassNames="bg-[#0F141C] text-slate-300 border-[#1C2230]"
                dayCellClassNames="border-[#1C2230] hover:bg-[#0F141C]"
              />
            </div>
          </section>

          {/* Upcoming */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">Upcoming</h3>
                <span className="text-xs text-slate-400">{upcoming.length} items</span>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-400">No upcoming items.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((it, idx) => {
                    const date = formatDateSafe(it.date);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl p-3 bg-[#0E121A] ring-1 ring-inset ring-[#1C2230] hover:bg-[#121722] transition cursor-pointer group"
                        style={{ borderLeft: `3px solid ${it.colorBar}` }}
                        onClick={() => {
                          if (it.kind === 'order') {
                            const order = orders.find(o => o.title === it.title);
                            if (order) {
                              setPreviewEvent({ kind: 'order', order });
                              setIsPreviewOpen(true);
                            }
                          } else if (it.kind === 'task') {
                            const task = tasks.find(t => t.title === it.title);
                            if (task) {
                              setPreviewEvent({ kind: 'task', task });
                              setIsPreviewOpen(true);
                            }
                          } else if (it.kind === 'subscription') {
                            const subscription = subscriptions.find(s => s.name === it.title);
                            if (subscription) {
                              setPreviewEvent({ kind: 'subscription', subscription });
                              setIsPreviewOpen(true);
                            }
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {it.kind === 'task' ? <span className="inline-flex items-center gap-1 mr-1"><ListChecks size={14} /> Task:</span> : null}
                              {it.kind === 'subscription' ? <span className="inline-flex items-center gap-1 mr-1"><CreditCard size={14} /> Subscription:</span> : null}
                              {it.title}
                            </div>
                            {it.subtitle && <div className="text-xs text-slate-400 truncate">{it.subtitle}</div>}
                            {it.kind === 'subscription' && 'amount' in it && (
                              <div className="text-xs text-slate-500">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: it.currency,
                                }).format(it.amount)} - {it.billing_cycle === 'monthly' ? 'Monthly' : it.billing_cycle === 'yearly' ? 'Yearly' : it.billing_cycle}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300">{date}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-xs text-slate-500 bg-[#0E121A] px-2 py-1 rounded">
                                Click to view
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Subscription Management Section */}
        <div className="mt-6">
          <SubscriptionManager />
        </div>

        {/* Event Preview Modal */}
        <EventPreviewModal
          event={previewEvent}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewEvent(null);
          }}
        />
      </div>
    </Layout>
  );
};

export default CalendarPage;
