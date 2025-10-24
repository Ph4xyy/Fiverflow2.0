import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import CalendarActionModal from '../components/CalendarActionModal';
import MeetingForm from '../components/MeetingForm';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  date: string;
  attendees?: string[];
  location?: string;
  meeting_type: string;
  priority: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  order_id?: string;
  assigned_to?: string;
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Calendar navigation
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const dateString = date.toISOString().split('T')[0];
      
      // Get events for this date
      const dayMeetings = meetings.filter(m => m.date === dateString);
      const dayTasks = tasks.filter(t => t.due_date === dateString);
      
      days.push({
        date,
        dateString,
        isCurrentMonth,
        isToday,
        meetings: dayMeetings,
        tasks: dayTasks
      });
    }
    
    return days;
  };

  // Load meetings and tasks
  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [meetingsRes, tasksRes] = await Promise.all([
        supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .order('date'),
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date')
      ]);

      if (meetingsRes.data) setMeetings(meetingsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
    setIsActionModalOpen(true);
  };

  const handleMeetingSelect = () => {
    setIsMeetingFormOpen(true);
  };

  const handleTaskSelect = () => {
    setIsTaskFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadData();
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ModernCard className="relative overflow-hidden p-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] opacity-10" />
        
        <div className="relative p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
              <p className="text-gray-400">Manage your meetings and tasks</p>
            </div>

            <div className="flex items-center gap-3">
              <ModernButton onClick={goToToday} variant="outline" size="sm">
                Today
              </ModernButton>
              <ModernButton 
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setSelectedDate(today);
                  setIsActionModalOpen(true);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </ModernButton>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Calendar Navigation */}
      <ModernCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            </button>
            
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border border-[#1e2938] cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-[#2a3441] hover:bg-[#35414e]' : 'bg-[#1e2938] text-gray-500'}
                ${day.isToday ? 'ring-2 ring-[#9c68f2]' : ''}
              `}
              onClick={() => handleDateClick(day.dateString)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                }`}>
                  {day.date.getDate()}
                </span>
                {(day.meetings.length > 0 || day.tasks.length > 0) && (
                  <div className="flex gap-1">
                    {day.meetings.length > 0 && (
                      <div className="w-2 h-2 bg-[#9c68f2] rounded-full" title={`${day.meetings.length} meeting(s)`} />
                    )}
                    {day.tasks.length > 0 && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" title={`${day.tasks.length} task(s)`} />
                    )}
                  </div>
                )}
              </div>
              
              {/* Events preview */}
              <div className="space-y-1">
                {day.meetings.slice(0, 2).map(meeting => (
                  <div key={meeting.id} className="text-xs bg-[#9c68f2]/20 text-[#9c68f2] px-1 py-0.5 rounded truncate">
                    {meeting.title}
                  </div>
                ))}
                {day.tasks.slice(0, 2).map(task => (
                  <div key={task.id} className="text-xs bg-orange-500/20 text-orange-300 px-1 py-0.5 rounded truncate">
                    {task.title}
                  </div>
                ))}
                {(day.meetings.length + day.tasks.length) > 4 && (
                  <div className="text-xs text-gray-400">
                    +{(day.meetings.length + day.tasks.length) - 4} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      {/* Modals */}
      <CalendarActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        selectedDate={selectedDate}
        onSelectMeeting={handleMeetingSelect}
        onSelectTask={handleTaskSelect}
      />

      <MeetingForm
        isOpen={isMeetingFormOpen}
        onClose={() => setIsMeetingFormOpen(false)}
        onSuccess={handleFormSuccess}
        selectedDate={selectedDate}
      />

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSuccess={handleFormSuccess}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarPage;
