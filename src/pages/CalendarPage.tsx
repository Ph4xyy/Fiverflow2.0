// src/pages/CalendarPage.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from '@/components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

import FullCalendar, { EventContentArg } from '@fullcalendar/react';
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
  Filter
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
    user_id?: string;
  };
};

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  // UI state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  // Data state
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const calendarRef = useRef<FullCalendar | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setOrders([]);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)`
        )
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

  // Color system (Motion/ClickUp-ish chips)
  const statusColor = useCallback((status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#16a34a', border: '#15803d' }; // green
      case 'In Progress':
        return { bg: '#2563eb', border: '#1d4ed8' }; // blue
      case 'Pending':
        return { bg: '#f59e0b', border: '#d97706' }; // amber
      default:
        return { bg: '#64748b', border: '#475569' }; // slate
    }
  }, []);

  // Build events from orders + filter
  useEffect(() => {
    const filtered = statusFilter === 'all'
      ? orders
      : orders.filter(o => o.status.toLowerCase().replace(' ', '_') === statusFilter);

    const mapped = filtered
      .filter(o => !!o.deadline)
      .map(o => {
        const c = statusColor(o.status);
        return {
          id: o.id,
          title: o.title,
          start: o.deadline, // using start for better compatibility across views
          allDay: true,
          backgroundColor: c.bg,
          borderColor: c.border,
          textColor: '#ffffff',
          extendedProps: { order: o }
        };
      });

    setEvents(mapped);
  }, [orders, statusFilter, statusColor]);

  const handleRefresh = async () => {
    setRefreshing(true);
    hasFetchedRef.current = false;
    await fetchOrders();
    toast.success('Calendar refreshed!');
  };

  const gotoPrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
  };

  const gotoNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
  };

  const gotoToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
  };

  const changeView = (v: typeof view) => {
    setView(v);
    const api = calendarRef.current?.getApi();
    api?.changeView(v);
  };

  const renderEventContent = (arg: EventContentArg) => {
    const order: OrderRow | undefined = (arg.event.extendedProps as any)?.order;
    // Chip style event (rounded, compact)
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] leading-tight">
        <span className="truncate font-medium">{arg.event.title}</span>
        {order?.clients?.platform && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/15">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {order.clients.platform}
          </span>
        )}
      </div>
    );
  };

  /* ---------- Loading & access gates ---------- */
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 grid place-items-center shadow-glow-purple">
              <CalendarIcon className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Calendar</h1>
              <p className="text-sm sm:text-base text-slate-400">
                View and manage your order deadlines
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Status filter */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0E14] border border-[#1C2230]">
              <Filter size={16} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-100 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 rounded-xl text-white bg-gradient-to-br from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Google sync (disabled placeholder) */}
            <button
              disabled
              className="inline-flex items-center px-3 py-2 rounded-xl bg-[#141922] text-slate-400 cursor-not-allowed ring-1 ring-inset ring-[#1C2230]"
            >
              <ExternalLink size={16} className="mr-2" />
              Sync with Google
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl p-4 flex items-start gap-3 border border-red-700/40 bg-red-900/20">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div>
              <p className="text-red-300 font-semibold">Unable to load calendar data</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Layout: mini calendar + main calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            {/* Mini calendar */}
            <div className="rounded-2xl border border-[#1C2230] bg-[#0B0E14] p-3">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                fixedWeekCount={false}
                height="auto"
                dayHeaderClassNames="text-slate-300"
                dayCellClassNames="border-[#1C2230]"
              />
            </div>

            {/* Legend */}
            <div className="mt-4 rounded-2xl border border-[#1C2230] bg-[#0B0E14] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Legend</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }} />
                  <span className="text-slate-200">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                  <span className="text-slate-200">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                  <span className="text-slate-200">Pending</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main calendar */}
          <section className="lg:col-span-9">
            {/* Custom toolbar */}
            <div className="rounded-2xl border border-[#1C2230] bg-[#0B0E14] px-3 py-2 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={gotoPrev}
                  className="p-2 rounded-lg bg-[#10151D] ring-1 ring-inset ring-[#1C2230] hover:bg-[#121924] transition"
                  title="Previous"
                >
                  <ChevronLeft size={18} className="text-slate-200" />
                </button>
                <button
                  onClick={gotoToday}
                  className="px-3 py-2 rounded-lg bg-[#10151D] ring-1 ring-inset ring-[#1C2230] text-slate-200 hover:bg-[#121924] transition"
                >
                  Today
                </button>
                <button
                  onClick={gotoNext}
                  className="p-2 rounded-lg bg-[#10151D] ring-1 ring-inset ring-[#1C2230] hover:bg-[#121924] transition"
                  title="Next"
                >
                  <ChevronRight size={18} className="text-slate-200" />
                </button>
              </div>

              {/* Dynamic title from FullCalendar */}
              <div className="text-sm sm:text-base font-semibold text-white">
                {/* We'll read title directly from FullCalendar DOM via CSS; or rely on FC title inside main calendar */}
                {/* Keeping this spacer for balance; FC will still render its title in the grid header */}
                {/* If you want a controlled title, we can read calendarRef.getApi().view.title and store in state */}
              </div>

              {/* View switch */}
              <div className="inline-flex rounded-lg bg-[#10151D] ring-1 ring-inset ring-[#1C2230] overflow-hidden">
                <button
                  onClick={() => changeView('dayGridMonth')}
                  className={`px-3 py-2 text-sm ${
                    view === 'dayGridMonth' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#131A22]'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => changeView('timeGridWeek')}
                  className={`px-3 py-2 text-sm ${
                    view === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#131A22]'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => changeView('timeGridDay')}
                  className={`px-3 py-2 text-sm ${
                    view === 'timeGridDay' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#131A22]'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-2xl border border-[#1C2230] bg-[#0B0E14] p-2 sm:p-3">
              <FullCalendar
                ref={calendarRef as any}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                headerToolbar={false}
                height="auto"
                expandRows
                stickyHeaderDates
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                events={events}
                eventContent={renderEventContent}
                // dark styling via classNames
                dayHeaderClassNames="bg-[#0F141C] text-slate-300 border-[#1C2230]"
                dayCellClassNames="border-[#1C2230] hover:bg-[#0F141C]"
                weekNumberCalculation="ISO"
              />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
