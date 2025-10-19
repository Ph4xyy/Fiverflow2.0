import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
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
  Search
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
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Réunion client - Projet Alpha',
      date: '2024-01-15',
      time: '14:00',
      type: 'meeting',
      attendees: ['Jean Dupont', 'Marie Martin'],
      priority: 'high'
    },
    {
      id: '2',
      title: 'Deadline - Livraison Beta',
      date: '2024-01-18',
      time: '17:00',
      type: 'deadline',
      priority: 'urgent'
    },
    {
      id: '3',
      title: 'Rappel - Facturation mensuelle',
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
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
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
    return date.toLocaleDateString('fr-FR', { 
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
            <h1 className="text-3xl font-bold text-white mb-2">Calendrier</h1>
            <p className="text-gray-400">Gérez vos événements et rendez-vous</p>
          </div>
          <div className="flex gap-3">
            <ModernButton variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filtres
            </ModernButton>
            <ModernButton size="sm">
              <Plus size={16} className="mr-2" />
              Nouvel Événement
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-3">
            <ModernCard title="Calendrier" icon={<CalendarIcon size={20} className="text-white" />}>
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
                            +{dayEvents.length - 2} autres
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
            <ModernCard title="Aujourd'hui" icon={<Clock size={20} className="text-white" />}>
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
                    <p className="text-sm">Aucun événement aujourd'hui</p>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Statistiques rapides */}
            <ModernCard title="Statistiques" icon={<Users size={20} className="text-white" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Événements ce mois</span>
                  <span className="text-lg font-semibold text-white">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Réunions</span>
                  <span className="text-lg font-semibold text-white">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Deadlines</span>
                  <span className="text-lg font-semibold text-white">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rappels</span>
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
