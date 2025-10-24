import React from 'react';
import { X, Calendar, CheckSquare, Video, Clock } from 'lucide-react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface CalendarActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectMeeting: () => void;
  onSelectTask: () => void;
}

const CalendarActionModal: React.FC<CalendarActionModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectMeeting,
  onSelectTask
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <ModernCard>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add to Calendar</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {formatDate(selectedDate)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onSelectMeeting();
                  onClose();
                }}
                className="w-full flex items-center space-x-4 p-4 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <Video className="h-6 w-6 text-[#9c68f2]" />
                <div className="text-left">
                  <div className="font-semibold text-white">Schedule Meeting</div>
                  <div className="text-sm text-gray-400">
                    Plan a meeting with clients or team members
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectTask();
                  onClose();
                }}
                className="w-full flex items-center space-x-4 p-4 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <CheckSquare className="h-6 w-6 text-[#9c68f2]" />
                <div className="text-left">
                  <div className="font-semibold text-white">Create Task</div>
                  <div className="text-sm text-gray-400">
                    Add a task or deadline to your calendar
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[#35414e]">
              <ModernButton
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cancel
              </ModernButton>
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default CalendarActionModal;
