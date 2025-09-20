import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout, { cardClass, subtleBg } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useClients } from '../hooks/useClients';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { usePlanLimits } from '../hooks/usePlanLimits';
import ClientForm from '../components/ClientForm';
import OrderForm from '../components/OrderForm';
import TaskForm from '../components/TaskForm';
import { supabase } from '../lib/supabase';
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

  // 👉 Nouvel état pour le nom de l'utilisateur
  const [userName, setUserName] = useState<string | null>(null);

  // 👉 Récupérer le nom depuis la table users
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id) // ⚠️ change "id" en "user_id" si ta colonne s'appelle autrement
        .single();

      if (!error && data) {
        setUserName(data.name);
      }
    };

    fetchUserName();
  }, [user]);

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
        {/* 👉 Titre personnalisé */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            {userName 
              ? `Welcome back, ${userName}! How's your day?` 
              : "Welcome to your Dashboard"}
          </h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${cardClass} p-5 overflow-hidden relative`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-700 dark:to-slate-900" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-glow-sm bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* … reste de ta page identique … */}
        
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
