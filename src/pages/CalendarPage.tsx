import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { useAuth } from '../contexts/AuthContext';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, RefreshCw, ExternalLink, Clock, AlertCircle } from 'lucide-react';
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
          <p className="ml-4 text-gray-600">Loading...</p>
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
          <p className="ml-4 text-gray-600">Loading calendar...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Calendar</h1>
              <p className="text-base text-gray-600 dark:text-slate-400">View and manage your order deadlines</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              disabled
              className="inline-flex items-center px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
            >
              <ExternalLink size={16} className="mr-2" />
              Sync with Google
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <div>
              <p className="text-red-800 font-medium">Unable to load calendar data</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
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
