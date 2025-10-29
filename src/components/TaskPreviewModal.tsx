import React, { useEffect, useRef } from 'react';
import { X, Clock, Flag, Calendar, Edit, Trash2, Play, CheckCircle2, AlertCircle, Activity, Archive, ChevronDown } from 'lucide-react';

interface TaskPreviewModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStartTimer?: () => void;
  onStatusChange?: (status: string) => void;
}

const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStartTimer,
  onStatusChange
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  if (!isOpen || !task) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-gray-400', bgColor: 'bg-gray-500', icon: Clock },
    { value: 'in_progress', label: 'In Progress', color: 'text-blue-400', bgColor: 'bg-blue-500', icon: Activity },
    { value: 'on_hold', label: 'On Hold', color: 'text-yellow-400', bgColor: 'bg-yellow-500', icon: AlertCircle },
    { value: 'completed', label: 'Completed', color: 'text-green-400', bgColor: 'bg-green-500', icon: CheckCircle2 },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-500', icon: X },
    { value: 'archived', label: 'Archived', color: 'text-gray-500', bgColor: 'bg-gray-500', icon: Archive }
  ];

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#1e2938] to-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Accent bar */}
        <div className={`h-1.5 ${
          task.priority === 'high' ? 'bg-gradient-to-r from-red-500 via-pink-500 to-red-600' :
          task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600' :
          'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
        }`} />
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9c68f2] to-[#422ca5] flex items-center justify-center flex-shrink-0">
              <StatusIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 break-words">
                {task.title}
              </h2>
              {task.description && (
                <p className="text-[15px] text-gray-400 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-gray-400 hover:text-white transition-all ml-4 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Status</label>
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-between transition-all ${
                    statusInfo.color
                  } ${
                    task.status === 'pending' ? 'bg-gray-500/10 border border-gray-500/20 hover:border-gray-500/40' :
                    task.status === 'in_progress' ? 'bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40' :
                    task.status === 'on_hold' ? 'bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40' :
                    task.status === 'completed' ? 'bg-green-500/10 border border-green-500/20 hover:border-green-500/40' :
                    task.status === 'cancelled' ? 'bg-red-500/10 border border-red-500/20 hover:border-red-500/40' :
                    'bg-gray-500/10 border border-gray-500/20 hover:border-gray-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className="font-semibold">{statusInfo.label}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showStatusDropdown && onStatusChange && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e2938] border border-white/[0.08] rounded-xl shadow-2xl z-10 overflow-hidden">
                    {statusOptions.map(option => {
                      const OptionIcon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            onStatusChange(option.value);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.08] ${
                            task.status === option.value ? option.color : 'text-gray-400'
                          }`}
                        >
                          <OptionIcon className="w-4 h-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Priority</label>
              <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border ${getPriorityColor(task.priority)}`}>
                <Flag className="w-4 h-4" />
                <span className="font-semibold capitalize">{task.priority}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">{formatDate(task.due_date)}</span>
              </div>
            </div>
            
            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Hours</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">{formatDuration(task.estimated_hours || 0)}</span>
              </div>
            </div>
          </div>

          {/* Time tracking info */}
          {task.actual_hours > 0 && (
            <div className="pt-4 border-t border-white/[0.08]">
              <label className="block text-sm font-medium text-gray-300 mb-3">Time Tracking</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <span className="text-gray-400">Tracked:</span>
                  <span className="text-white font-semibold">{formatDuration(task.actual_hours)}</span>
                </div>
                <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#9c68f2] to-[#422ca5] transition-all duration-500"
                    style={{ width: `${Math.min((task.actual_hours / (task.estimated_hours || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {onStartTimer && (
              <button
                onClick={onStartTimer}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 hover:text-green-300 transition-all border border-green-500/20"
              >
                <Play className="w-4 h-4" />
                <span className="font-medium">Start Timer</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-gray-300 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPreviewModal;

