import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import SubscriptionManager from '../components/SubscriptionManager';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Client meeting - Alpha Project',
      date: '2024-01-15',
      time: '14:00',
      type: 'meeting',
      attendees: ['Jean Dupont', 'Marie Martin'],
      priority: 'high'
    },
    {
      id: '2',
      title: 'Deadline - Beta Delivery',
      date: '2024-01-18',
      time: '17:00',
      type: 'deadline',
      priority: 'urgent'
    },
    {
      id: '3',
      title: 'Reminder - Monthly billing',
      date: '2024-01-20',
      time: '09:00',
      type: 'reminder',
      priority: 'medium'
    }
  ]);

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

        {/* Subscription Management Section */}
        <div className="mb-6">
          <SubscriptionManager />
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

            {/* Statistiques rapides */}
            <ModernCard title="Statistics" icon={<Users size={20} className="text-white" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Events this month</span>
                  <span className="text-lg font-semibold text-white">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Meetings</span>
                  <span className="text-lg font-semibold text-white">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Deadlines</span>
                  <span className="text-lg font-semibold text-white">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Reminders</span>
                  <span className="text-lg font-semibold text-white">4</span>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPageNew;
