import React, { useState, useEffect } from 'react';

import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import SubscriptionManager from '../components/SubscriptionManager';
import CalendarActionModal from '../components/CalendarActionModal';
import DayEventsModal from '../components/DayEventsModal';
import MeetingForm from '../components/MeetingForm';
import TaskForm from '../components/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useInvoices } from '../hooks/useInvoices';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Users, 
  MapPin, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  AlertTriangle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'reminder';
  category: 'task' | 'order' | 'invoice' | 'subscription' | 'calendar' | 'meeting';
  attendees?: string[];
  location?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  order_id?: string;
}

const PageCalendar: React.FC = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { orders, loading: ordersLoading } = useOrders();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les filtres par catégorie (checkboxes)
  const [filterCategories, setFilterCategories] = useState({
    task: true,
    order: true,
    invoice: true,
    subscription: true,
    calendar: true,
    meeting: true,
  });
  
  // États pour les modals
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState<string>('');

  // Fonctions de gestion des modals
  const handleDateClick = (dateString: string) => {
    setSelectedDateString(dateString);
    // Vérifier s'il y a des événements pour cette date
    const dayEvents = events.filter(event => event.date === dateString);
    if (dayEvents.length > 0) {
      setIsDayEventsModalOpen(true);
    } else {
      setIsActionModalOpen(true);
    }
  };

  const handleMeetingSelect = () => {
    setIsMeetingFormOpen(true);
  };

  const handleTaskSelect = () => {
    setIsTaskFormOpen(true);
  };

  const handleAddEvent = () => {
    setIsActionModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    // Si c'est une tâche liée à une commande, naviguer vers la page des commandes
    if (event.type === 'deadline' && event.id.startsWith('task-')) {
      // Utiliser l'order_id directement depuis l'événement
      if (event.order_id) {
        window.location.href = `/orders?order=${event.order_id}`;
      } else {
        // Si pas de commande liée, naviguer vers la page des tâches
        window.location.href = '/tasks';
      }
    }
  };

  const handleFormSuccess = () => {
    // Recharger les données - les useEffect vont recharger automatiquement
    window.location.reload();
  };

  // Fermer le dropdown de filtre quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown') && !target.closest('[data-filter-button]')) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Charger les événements du calendrier depuis la base de données
  useEffect(() => {
    const loadCalendarEvents = async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        console.log('Supabase not configured or no user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📅 Loading calendar events...');

        // Récupérer les événements du calendrier
        const { data: calendarData, error: calendarError } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: true });

        if (calendarError) {
          console.error('Error loading calendar events:', calendarError);
        }

        setCalendarEvents(calendarData || []);

        // Convertir les factures avec due_date en événements
        const invoiceEvents: Event[] = invoices
          .filter(invoice => invoice.due_date)
          .map(invoice => {
            console.log('🧾 Invoice with due_date:', {
              id: invoice.id,
              number: invoice.number,
              due_date: invoice.due_date,
              total: invoice.total,
              status: invoice.status
            });
            return {
              id: `invoice-${invoice.id}`,
              title: `🧾 ${invoice.number} - ${invoice.clients.name}`,
              date: invoice.due_date,
              time: '17:00',
              type: 'deadline' as const,
              category: 'invoice' as const,
              priority: invoice.status === 'overdue' ? 'high' as const : 'medium' as const,
              description: `Facture de ${invoice.total.toFixed(2)} ${invoice.currency} - ${invoice.status}`
            };
          });

        // Convertir les tâches avec due_date en événements
        const taskEvents: Event[] = tasks
          .filter(task => task.due_date)
          .map(task => {
            console.log('📋 Task with due_date:', {
              id: task.id,
              title: task.title,
              due_date: task.due_date,
              priority: task.priority
            });
            return {
              id: `task-${task.id}`,
              title: `📋 ${task.title}`,
              date: task.due_date!,
              time: '09:00',
              type: 'deadline' as const,
              category: 'task' as const,
              priority: task.priority as 'low' | 'medium' | 'high',
              description: task.description
            };
          });

        // Convertir TOUTES les tâches en événements (même sans due_date)
        const allTaskEvents: Event[] = tasks.map(task => {
          const eventDate = task.due_date || new Date().toISOString().split('T')[0];
          return {
            id: `task-${task.id}`,
            title: `📋 ${task.title}`,
            date: eventDate,
            time: '09:00',
            type: 'deadline' as const,
            category: 'task' as const,
            priority: task.priority as 'low' | 'medium' | 'high',
            description: task.description,
            order_id: task.order_id // Ajouter l'order_id pour la navigation
          };
        });

        // Convertir les commandes avec due_date en événements
        const orderEvents: Event[] = orders
          .filter(order => order.due_date)
          .map(order => {
            console.log('📦 Order with due_date:', {
              id: order.id,
              title: order.title,
              due_date: order.due_date,
              budget: order.budget
            });
            return {
              id: `order-${order.id}`,
              title: `📦 ${order.title}`,
              date: order.due_date!,
              time: '17:00', // Heure par défaut pour les deadlines
              type: 'deadline' as const,
              category: 'order' as const,
              priority: 'high' as const, // Les deadlines de commandes sont importantes
              description: `Commande pour ${order.client?.name || 'Client'}`
            };
          });

        // Convertir les événements du calendrier en format Event
        const calendarEventObjects: Event[] = (calendarData || []).map(event => ({
          id: `event-${event.id}`,
          title: event.title,
          date: event.start_time.split('T')[0],
          time: event.start_time.split('T')[1]?.substring(0, 5) || '09:00',
          type: event.type || 'meeting' as const,
          category: (event.type || 'meeting') === 'meeting' ? 'meeting' as const : 'calendar' as const,
          priority: event.priority || 'medium' as const,
          attendees: event.attendees || [],
          location: event.location
        }));

        // Convertir les abonnements en événements de renouvellement
        const subscriptionEvents: Event[] = subscriptions
          .filter(sub => sub.is_active && sub.next_renewal_date)
          .map(sub => {
            console.log('💳 Subscription renewal event:', {
              id: sub.id,
              name: sub.name,
              renewal_date: sub.next_renewal_date,
              amount: sub.amount
            });
            return {
              id: `subscription-${sub.id}`,
              title: `💳 ${sub.name} - $${sub.amount}`,
              date: sub.next_renewal_date!,
              time: '09:00',
              type: 'reminder' as const,
              category: 'subscription' as const,
              priority: 'medium' as const,
              description: `Renouvellement ${sub.billing_cycle} - ${sub.provider}`
            };
          });

        // Combiner tous les événements
        const allEvents = [...allTaskEvents, ...orderEvents, ...calendarEventObjects, ...subscriptionEvents, ...invoiceEvents];
        setEvents(allEvents);
        
        console.log('✅ Calendar events loaded:', {
          tasks: allTaskEvents.length,
          orders: orderEvents.length,
          calendar: calendarEventObjects.length,
          subscriptions: subscriptionEvents.length,
          invoices: invoiceEvents.length,
          total: allEvents.length
        });
        
        // Debug: afficher les tâches sans due_date
        const tasksWithoutDueDate = tasks.filter(task => !task.due_date);
        if (tasksWithoutDueDate.length > 0) {
          console.log('⚠️ Tasks without due_date:', tasksWithoutDueDate.map(t => ({
            id: t.id,
            title: t.title,
            due_date: t.due_date
          })));
        }
        
        // Debug: afficher toutes les tâches
        console.log('📋 All tasks:', tasks.map(t => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date,
          status: t.status
        })));
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Charger seulement si les données sont prêtes
    if (!tasksLoading && !ordersLoading && !subscriptionsLoading && !invoicesLoading) {
      loadCalendarEvents();
    }
  }, [user, tasks, orders, subscriptions, invoices, tasksLoading, ordersLoading, subscriptionsLoading, invoicesLoading]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    console.log('🔍 Looking for events on date:', dateStr);
    
    let filteredEvents = events.filter(event => {
      console.log('📅 Checking event:', {
        id: event.id,
        title: event.title,
        eventDate: event.date,
        targetDate: dateStr,
        matches: event.date === dateStr
      });
      return event.date === dateStr;
    });
    
    // Apply category filters
    filteredEvents = filteredEvents.filter(event => {
      return filterCategories[event.category as keyof typeof filterCategories];
    });
    
    // Apply type filters
    if (filterType) {
      filteredEvents = filteredEvents.filter(event => event.type === filterType);
    }
    if (filterPriority) {
      filteredEvents = filteredEvents.filter(event => event.priority === filterPriority);
    }
    
    console.log('✅ Found events for', dateStr, ':', filteredEvents.length);
    return filteredEvents;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-[#f43f5e] to-[#e11d48]';
      case 'medium': return 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]';
      case 'low': return 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]';
      default: return 'bg-gradient-to-r from-[#64748b] to-[#475569]';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-[#f43f5e]';
      case 'medium': return 'border-[#f59e0b]';
      case 'low': return 'border-[#22c55e]';
      default: return 'border-[#64748b]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users size={12} className="text-white" />;
      case 'deadline': return <Clock size={12} className="text-white" />;
      case 'reminder': return <Bell size={12} className="text-white" />;
      default: return <CalendarIcon size={12} className="text-white" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb]';
      case 'deadline': return 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]';
      case 'reminder': return 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]';
      default: return 'bg-gradient-to-r from-[#64748b] to-[#475569]';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  const days = getDaysInMonth(currentDate);

  // Afficher un indicateur de chargement
  if (loading || tasksLoading || ordersLoading || subscriptionsLoading || invoicesLoading) {
    return (
      <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading calendar events...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-400">Manage your events and appointments</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <ModernButton 
                variant="outline" 
                size="sm"
                data-filter-button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </ModernButton>
              
              {/* Dropdown Menu */}
              {showFilterDropdown && (
                <div className="filter-dropdown absolute top-full right-0 mt-2 w-64 bg-[#1e2938] border border-[#35414e] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-[#35414e] flex items-center justify-between sticky top-0 bg-[#1e2938]">
                    <h3 className="text-sm font-semibold text-white">Show Events</h3>
                    <button
                      onClick={() => {
                        setFilterCategories({
                          task: true,
                          order: true,
                          invoice: true,
                          subscription: true,
                          calendar: true,
                          meeting: true,
                        });
                        setFilterType('');
                        setFilterPriority('');
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Category Filters */}
                  <div className="py-2">
                    {[
                      { key: 'task', label: 'Tasks', icon: '📋' },
                      { key: 'order', label: 'Orders', icon: '📦' },
                      { key: 'invoice', label: 'Invoices', icon: '🧾' },
                      { key: 'subscription', label: 'Subscriptions', icon: '💳' },
                      { key: 'calendar', label: 'Calendar Events', icon: '📅' },
                      { key: 'meeting', label: 'Meetings', icon: '👥' },
                    ].map(({ key, label, icon }) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#35414e] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filterCategories[key as keyof typeof filterCategories]}
                          onChange={(e) => {
                            setFilterCategories(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }));
                          }}
                          className="w-4 h-4 rounded border-gray-500 bg-[#1e2938] text-[#9c68f2] focus:ring-[#9c68f2] focus:ring-offset-[#1e2938] focus:ring-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="flex-1 text-sm text-white">{icon} {label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#35414e]"></div>

                  {/* Event Type Filters */}
                  <div className="py-2">
                    <div className="px-4 py-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Event Type</span>
                    </div>
                    {[
                      { value: '', label: 'All Types' },
                      { value: 'meeting', label: 'Meetings', icon: '👥' },
                      { value: 'deadline', label: 'Deadlines', icon: '⚡' },
                      { value: 'reminder', label: 'Reminders', icon: '🔔' },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setFilterType(value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                          filterType === value 
                            ? 'text-white bg-[#9c68f2]/20' 
                            : 'text-gray-300 hover:bg-[#35414e] hover:text-white'
                        }`}
                      >
                        {icon && <span>{icon}</span>}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Priority Filters */}
                  <div className="py-2 pb-2">
                    <div className="px-4 py-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</span>
                    </div>
                    {[
                      { value: '', label: 'All Priorities' },
                      { value: 'high', label: 'High', icon: '🔴' },
                      { value: 'medium', label: 'Medium', icon: '🟡' },
                      { value: 'low', label: 'Low', icon: '🟢' },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setFilterPriority(value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                          filterPriority === value 
                            ? 'text-white bg-[#9c68f2]/20' 
                            : 'text-gray-300 hover:bg-[#35414e] hover:text-white'
                        }`}
                      >
                        {icon && <span>{icon}</span>}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <ModernButton 
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSelectedDateString(today);
                setIsActionModalOpen(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              New Event
            </ModernButton>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-3">
            <ModernCard title="Calendar" icon={<CalendarIcon size={20} className="text-white" />}>
              {/* Navigation du calendrier */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-[#35414e] transition-colors"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
                
                <h2 className="text-xl font-semibold text-white">
                  {formatMonthYear(currentDate)}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-[#35414e] transition-colors"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-2 border border-[#35414e] rounded-lg cursor-pointer transition-colors
                        ${day.isCurrentMonth ? 'bg-[#1e2938]' : 'bg-[#111726] opacity-50'}
                        ${isToday ? 'border-[#9c68f2] bg-[#9c68f2]/10' : ''}
                        ${isSelected ? 'bg-[#35414e]' : 'hover:bg-[#35414e]/50'}
                      `}
                      onClick={() => {
                        setSelectedDate(day.date);
                        handleDateClick(day.date.toISOString().split('T')[0]);
                      }}
                    >
                      <div className={`text-sm font-medium ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                        {day.date.getDate()}
                      </div>
                      
                      {/* Événements du jour */}
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-white shadow-sm border ${getTypeColor(event.type)} ${getPriorityBorderColor(event.priority)} hover:shadow-md transition-all duration-200 cursor-pointer group`}
                          >
                            <div className="flex-shrink-0">
                              {getTypeIcon(event.type)}
                            </div>
                            <span className="truncate font-medium group-hover:font-semibold transition-all duration-200">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-[#94a3b8] bg-[#1C2230] px-2 py-1 rounded-lg border border-[#35414e] hover:bg-[#35414e] transition-colors cursor-pointer">
                            +{dayEvents.length - 2} more events
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Événements d'aujourd'hui */}
            <ModernCard title="Today" icon={<Clock size={20} className="text-white" />}>
              <div className="space-y-3">
                {getEventsForDate(new Date()).map(event => (
                  <div 
                    key={event.id} 
                    className="p-4 bg-[#35414e] rounded-xl border border-[#1C2230] shadow-lg hover:shadow-xl hover:border-[#35414e] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getTypeIcon(event.type)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white group-hover:text-white transition-colors">{event.title}</span>
                          <div className="text-xs text-[#94a3b8] mt-1">{event.time}</div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)} shadow-sm`} />
                    </div>
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="text-xs text-[#94a3b8] bg-[#1C2230] px-2 py-1 rounded-lg inline-block">
                        👥 {event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-xs text-[#94a3b8] mt-2 flex items-center gap-1">
                        <MapPin size={10} />
                        {event.location}
                      </div>
                    )}
                  </div>
                ))}
                {getEventsForDate(new Date()).length === 0 && (
                  <div className="text-center text-[#94a3b8] py-8">
                    <div className="w-16 h-16 bg-[#1C2230] rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon size={24} className="text-[#64748b]" />
                    </div>
                    <p className="text-sm font-medium">No events today</p>
                    <p className="text-xs text-[#64748b] mt-1">Enjoy your free time!</p>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Statistiques réelles */}
            <ModernCard title="Statistics" icon={<Users size={20} className="text-white" />}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"></div>
                    <span className="text-sm text-[#94a3b8]">Total events</span>
                  </div>
                  <span className="text-lg font-bold text-white">{events.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]"></div>
                    <span className="text-sm text-[#94a3b8]">Tasks with deadline</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {tasks.filter(task => task.due_date).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706]"></div>
                    <span className="text-sm text-[#94a3b8]">Orders with due_date</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {orders.filter(order => order.due_date).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ec4899] to-[#db2777]"></div>
                    <span className="text-sm text-[#94a3b8]">Invoice due dates</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {invoices.filter(invoice => invoice.due_date).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"></div>
                    <span className="text-sm text-[#94a3b8]">Events this month</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      const currentMonth = currentDate.getMonth();
                      const currentYear = currentDate.getFullYear();
                      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a]"></div>
                    <span className="text-sm text-[#94a3b8]">Active subscriptions</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {subscriptions.filter(sub => sub.is_active).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg border border-[#1C2230] hover:border-[#35414e] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f43f5e] to-[#e11d48]"></div>
                    <span className="text-sm text-[#94a3b8]">Renewals this month</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {subscriptions.filter(sub => {
                      if (!sub.is_active || !sub.next_renewal_date) return false;
                      const renewalDate = new Date(sub.next_renewal_date);
                      const currentMonth = currentDate.getMonth();
                      const currentYear = currentDate.getFullYear();
                      return renewalDate.getMonth() === currentMonth && renewalDate.getFullYear() === currentYear;
                    }).length}
                  </span>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>

        {/* Subscription Management Section */}
        <div className="mt-6">
          <SubscriptionManager />
        </div>

        {/* Modals */}
        <CalendarActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          selectedDate={selectedDateString}
          onSelectMeeting={handleMeetingSelect}
          onSelectTask={handleTaskSelect}
        />

        <DayEventsModal
          isOpen={isDayEventsModalOpen}
          onClose={() => setIsDayEventsModalOpen(false)}
          selectedDate={selectedDateString}
          events={events.filter(event => event.date === selectedDateString)}
          onAddEvent={handleAddEvent}
          onEventClick={handleEventClick}
        />

        <MeetingForm
          isOpen={isMeetingFormOpen}
          onClose={() => setIsMeetingFormOpen(false)}
          onSuccess={handleFormSuccess}
          selectedDate={selectedDateString}
        />

        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSuccess={handleFormSuccess}
          selectedDate={selectedDateString}
        />
      </div>
  );
};

export default PageCalendar;
