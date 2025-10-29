import React from 'react';
import { X, Calendar, Clock, Users, MapPin, Video, CheckSquare, Bell } from 'lucide-react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'reminder';
  attendees?: string[];
  location?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  events: Event[];
  onAddEvent: () => void;
  onEventClick?: (event: Event) => void;
}

const DayEventsModal: React.FC<DayEventsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  events,
  onAddEvent,
  onEventClick
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Video className="h-4 w-4" />;
      case 'deadline': return <CheckSquare className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'text-blue-400';
      case 'deadline': return 'text-purple-400';
      case 'reminder': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <ModernCard>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Events for {formatDate(selectedDate)}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {events.length} event{events.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-white text-lg font-medium">No events scheduled</p>
                <p className="text-sm text-gray-400 mt-1">
                  This day is free. Add an event to get started.
                </p>
                <ModernButton onClick={onAddEvent} className="mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Event
                </ModernButton>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-[#35414e] rounded-lg hover:bg-[#35414e]/50 transition-colors cursor-pointer"
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`${getTypeColor(event.type)} mt-1`}>
                          {getTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${getPriorityColor(event.priority)}`}>
                              <span className="text-xs font-medium">
                                {event.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-300 mt-2">{event.description}</p>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-400">
                              <Users className="h-3 w-3" />
                              <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-400">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-[#35414e]">
                  <ModernButton 
                    onClick={() => {
                      onClose();
                      onAddEvent();
                    }} 
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Another Event
                  </ModernButton>
                </div>
              </div>
            )}
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default DayEventsModal;
