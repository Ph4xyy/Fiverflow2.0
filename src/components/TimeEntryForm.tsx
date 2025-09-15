import React, { useState } from 'react';
import { X, Clock, CheckCircle, FileText, Calendar } from 'lucide-react';
import { Task, TimeEntry } from '../hooks/useTasks';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface TimeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId?: string;
  tasks: Task[];
  timeEntry?: TimeEntry | null;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  orderId, 
  tasks, 
  timeEntry 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    task_id: timeEntry?.task_id || '',
    order_id: timeEntry?.order_id || orderId || '',
    start_time: timeEntry?.start_time ? new Date(timeEntry.start_time).toISOString().slice(0, 16) : '',
    end_time: timeEntry?.end_time ? new Date(timeEntry.end_time).toISOString().slice(0, 16) : '',
    description: timeEntry?.description || '',
    is_billable: timeEntry?.is_billable ?? true
  });

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.start_time) {
      toast.error('Start time is required');
      return;
    }

    if (!formData.order_id) {
      toast.error('Please select an order');
      return;
    }

    if (formData.end_time && new Date(formData.end_time) <= new Date(formData.start_time)) {
      toast.error('End time must be after start time');
      return;
    }

    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(timeEntry ? 'Updating time entry...' : 'Creating time entry...');

    try {
      const duration = calculateDuration();
      
      const entryData = {
        task_id: formData.task_id || null,
        order_id: formData.order_id,
        user_id: user.id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        duration_minutes: duration,
        description: formData.description.trim() || null,
        is_billable: formData.is_billable
      };

      if (timeEntry) {
        const { error } = await supabase
          .from('time_entries')
          .update(entryData)
          .eq('id', timeEntry.id);

        if (error) throw error;
        toast.success('Time entry updated successfully!', { id: toastId });
      } else {
        const { error } = await supabase
          .from('time_entries')
          .insert(entryData);

        if (error) throw error;
        toast.success('Time entry created successfully!', { id: toastId });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast.error('Failed to save time entry', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const duration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            {timeEntry ? 'Edit Time Entry' : 'Add Time Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Task (Optional)
            </label>
            <select
              value={formData.task_id}
              onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-accent-blue focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="">General work (no specific task)</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Start Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-accent-blue focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                End Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-accent-blue focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="text-blue-600 dark:text-accent-blue" size={20} />
                <span className="text-blue-800 dark:text-blue-300 font-medium">
                  Duration: {formatDuration(duration)}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Work Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" size={20} />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-accent-blue focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                rows={3}
                placeholder="What did you work on during this time?"
              />
            </div>
          </div>

          {/* Billable */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_billable"
              checked={formData.is_billable}
              onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
              className="w-4 h-4 text-blue-600 dark:text-accent-blue bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-accent-blue"
            />
            <label htmlFor="is_billable" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              This time is billable to the client
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 dark:bg-accent-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {timeEntry ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  {timeEntry ? 'Update Entry' : 'Create Entry'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEntryForm;