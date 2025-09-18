// src/pages/CalendarPage.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from '@/components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

import FullCalendar, { EventContentArg, DatesSetArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import {
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

type OrderRow = {
  id: string;
  title: string;
  amount: number | null;
  status: 'Pending' | 'In Progress' | 'Completed' | string;
  deadline: string | null;
  created_at: string | null;
  clients: { name: string; platform: string | null; user_id?: string };
};

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

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  // View + UI
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [title, setTitle] = useState<string>('');
  const calendarRef = useRef<FullCalendar | null>(null);

  // Filters / data
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)`)
        .eq('clients.user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setOrders((data || []) as OrderRow[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOrders();
    }
  }, [fetchOrders]);

  // Build events
  useEffect(() => {
    const filtered = statusFilter === 'all'
      ? orders
      : orders.filter(o => o.status.toLowerCase().replace(' ', '_') === statusFilter);

    const mapped = filtered
      .filter(o => !!o.deadline)
      .map(o => {
        const s = statusStyle(o.status);
        return {
          id: o.id,
          title: o.title,
          start: o.deadline,
          allDay: true,
          backgroundColor: 'transparent', // we style via custom content
          borderColor: 'transparent',
          textColor: s.text,
          extendedProps: { order: o, style: s }
        };
      });

    setEvents(mapped);
  }, [orders, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    hasFetchedRef.current = false;
    await fetchOrders();
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

  // Minimal event chip with left color bar
  const renderEvent = (arg: EventContentArg) => {
    const style = (arg.event.extendedProps as any)?.style as ReturnType<typeof statusStyle>;
    const order: OrderRow | undefined = (arg.event.extendedProps as any)?.order;

    return (
      <div
        className="rounded-lg px-2 py-1 text-[12px] leading-[1.1] flex items-center gap-2"
        style={{ background: style.chipBg, borderLeft: `3px solid ${style.bar}` }}
      >
        <span className="truncate font-medium">{arg.event.title}</span>
        {order?.clients?.platform && (
          <span className="text-[11px] opacity-80">{order.clients.platform}</span>
        )}
      </div>
    );
  };

  // Upcoming (right column)
  const upcoming = useMemo(() => {
    const now = new Date();
    return orders
      .filter(o => o.deadline && new Date(o.deadline) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 8);
  }, [orders]);

  /* ---------- Gates ---------- */
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

  /* ---------- Page ---------- */
  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-0">
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
                className={`px-3 py-2 text-sm ${
                  currentView === 'dayGridMonth' ? 'bg-blue-600 text-white' : 'bg-[#0E121A] text-slate-200 hover:bg-[#121722]'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => switchView('timeGridWeek')}
                className={`px-3 py-2 text-sm ${
                  currentView === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'bg-[#0E121A] text-slate-200 hover:bg-[#121722]'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => switchView('timeGridDay')}
                className={`px-3 py-2 text-sm ${
                  currentView === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-[#0E121A] text-slate-200 hover:bg-[#121722]'
                }`}
              >
                Day
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

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
          {/* Main Calendar */}
          <section className="lg:col-span-8 xl:col-span-9">
            <div className="rounded-2xl border border-[#1C2230] bg-[#0B0E14] p-3">
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
                // subtle dark grid
                dayHeaderClassNames="bg-[#0F141C] text-slate-300 border-[#1C2230]"
                dayCellClassNames="border-[#1C2230] hover:bg-[#0F141C]"
              />
            </div>
          </section>

          {/* Upcoming list */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="rounded-2xl border border-[#1C2230] bg-[#0B0E14] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">Upcoming</h3>
                <span className="text-xs text-slate-400">{upcoming.length} items</span>
              </div>

              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-400">No upcoming deadlines.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((o) => {
                    const s = statusStyle(o.status);
                    const d = new Date(o.deadline!);
                    const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    return (
                      <div
                        key={o.id}
                        className="rounded-xl p-3 bg-[#0E121A] ring-1 ring-inset ring-[#1C2230] hover:bg-[#121722] transition"
                        style={{ borderLeft: `3px solid ${s.bar}` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">{o.title}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {o.clients?.name} {o.clients?.platform ? `• ${o.clients.platform}` : ''}
                            </div>
                          </div>
                          <span className="text-xs text-slate-300">{date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
