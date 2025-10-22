import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import SubscriptionManager from '../components/SubscriptionManager';
import { useTasks } from '../hooks/useTasks';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
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
  attendees?: string[];
  location?: string;
  priority: 'low' | 'medium' | 'high';
}

const CalendarPageNew: React.FC = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { orders, loading: ordersLoading } = useOrders();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Convertir les tâches avec due_date en événements
        const taskEvents: Event[] = tasks
          .filter(task => task.due_date)
          .map(task => ({
            id: `task-${task.id}`,
            title: `📋 ${task.title}`,
            date: task.due_date!,
            time: '09:00',
            type: 'deadline' as const,
            priority: task.priority as 'low' | 'medium' | 'high',
            description: task.description
          }));

        // Convertir les commandes avec due_date en événements
        const orderEvents: Event[] = orders
          .filter(order => order.due_date)
          .map(order => ({
            id: `order-${order.id}`,
            title: `📦 ${order.title}`,
            date: order.due_date!,
            time: '17:00', // Heure par défaut pour les deadlines
            type: 'deadline' as const,
            priority: 'high' as const, // Les deadlines de commandes sont importantes
            description: `Commande pour ${order.client?.name || 'Client'}`
          }));

        // Convertir les événements du calendrier en format Event
        const calendarEventObjects: Event[] = (calendarData || []).map(event => ({
          id: `event-${event.id}`,
          title: event.title,
          date: event.start_time.split('T')[0],
          time: event.start_time.split('T')[1]?.substring(0, 5) || '09:00',
          type: event.type || 'meeting' as const,
          priority: event.priority || 'medium' as const,
          attendees: event.attendees || [],
          location: event.location
        }));

        // Combiner tous les événements
        const allEvents = [...taskEvents, ...orderEvents, ...calendarEventObjects];
        setEvents(allEvents);
        
        console.log('✅ Calendar events loaded:', {
          tasks: taskEvents.length,
          orders: orderEvents.length,
          calendar: calendarEventObjects.length,
          total: allEvents.length
        });
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Charger seulement si les données sont prêtes
    if (!tasksLoading && !ordersLoading) {
      loadCalendarEvents();
    }
  }, [user, tasks, orders, tasksLoading, ordersLoading]);

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
    let filteredEvents = events.filter(event => event.date === dateStr);
    
    // Apply filters
    if (filterType) {
      filteredEvents = filteredEvents.filter(event => event.type === filterType);
    }
    if (filterPriority) {
      filteredEvents = filteredEvents.filter(event => event.priority === filterPriority);
    }
    
    return filteredEvents;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users size={12} />;
      case 'deadline': return <Clock size={12} />;
      case 'reminder': return <Bell size={12} />;
      default: return <CalendarIcon size={12} />;
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
  if (loading || tasksLoading || ordersLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading calendar events...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </ModernButton>
              
              {/* Dropdown Menu */}
              {showFilterDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e2938] border border-[#35414e] rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setShowFilters(true);
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                    >
                      <Filter size={16} />
                      Advanced Filters
                    </button>
                    <button 
                      onClick={() => {
                        setFilterType('meeting');
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                    >
                      <Clock size={16} />
                      Meetings Only
                    </button>
                    <button 
                      onClick={() => {
                        setFilterType('deadline');
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                    >
                      <AlertTriangle size={16} />
                      Deadlines Only
                    </button>
                    <button 
                      onClick={() => {
                        setFilterType('');
                        setFilterPriority('');
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                    >
                      <X size={16} />
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
            <ModernButton size="sm">
              <Plus size={16} className="mr-2" />
              New Event
            </ModernButton>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ModernCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Event Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-[#35414e] rounded"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                >
                  <option value="">All Types</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <ModernButton 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFilterType('');
                  setFilterPriority('');
                }}
              >
                Clear Filters
              </ModernButton>
              <ModernButton 
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </ModernButton>
            </div>
          </ModernCard>
        )}

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
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className={`text-sm font-medium ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                        {day.date.getDate()}
                      </div>
                      
                      {/* Événements du jour */}
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`flex items-center gap-1 p-1 rounded text-xs text-white ${getPriorityColor(event.priority)}`}
                          >
                            {getTypeIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{dayEvents.length - 2} more
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
                  <div key={event.id} className="p-3 bg-[#35414e] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(event.type)}
                        <span className="text-sm font-medium text-white">{event.title}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                    </div>
                    <div className="text-xs text-gray-400">{event.time}</div>
                    {event.attendees && (
                      <div className="text-xs text-gray-400 mt-1">
                        {event.attendees.length} participant(s)
                      </div>
                    )}
                  </div>
                ))}
                {getEventsForDate(new Date()).length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events today</p>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Statistiques réelles */}
            <ModernCard title="Statistics" icon={<Users size={20} className="text-white" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total events</span>
                  <span className="text-lg font-semibold text-white">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tasks with deadline</span>
                  <span className="text-lg font-semibold text-white">
                    {tasks.filter(task => task.due_date).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Orders with due_date</span>
                  <span className="text-lg font-semibold text-white">
                    {orders.filter(order => order.due_date).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Events this month</span>
                  <span className="text-lg font-semibold text-white">
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      const currentMonth = currentDate.getMonth();
                      const currentYear = currentDate.getFullYear();
                      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
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
      </div>
    </Layout>
  );
};

export default CalendarPageNew;
