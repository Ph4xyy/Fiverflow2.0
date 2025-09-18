import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout, { cardClass } from '@/components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

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
        .select(`id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)`) 
        .eq('clients.user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;

      setOrders(data || []);
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

  useEffect(() => {
    const filteredOrders = statusFilter === 'all'
      ? orders
      : orders.filter(order => order.status.toLowerCase().replace(' ', '_') === statusFilter);

    const calendarEvents = filteredOrders.map(order => {
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
        textColor: '#ffffff',
        extendedProps: { order }
      };
    });

    setEvents(calendarEvents);
  }, [orders, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    hasFetchedRef.current = false;
    await fetchOrders();
    toast.success('Calendar refreshed!');
  };

  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!checkAccess('calendar')) {
    return <PlanRestrictedPage feature="calendar" currentPlan={restrictions?.plan || 'free'} isTrialActive={restrictions?.isTrialActive} trialDaysRemaining={restrictions?.trialDaysRemaining} />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-slate-400">Loading calendar...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-glow-purple">
              <CalendarIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Calendar</h1>
              <p className="text-sm text-slate-400">View and manage your order deadlines</p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-[#1C2230] bg-[#11151D]/95 text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 rounded-xl btn-primary disabled:opacity-60"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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

        {/* Calendar container très sombre */}
        <div className={`${cardClass} p-4 sm:p-6`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            events={events}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
