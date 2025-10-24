import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckSquare, Calendar, Flag, User, FileText } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  task?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    order_id?: string;
    assigned_to?: string;
  } | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, selectedDate, task }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orders, setOrders] = useState<Array<{id: string, title: string}>>([]);

  const emptyForm = useMemo(() => ({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: selectedDate || '',
    order_id: '',
    assigned_to: ''
  }), [selectedDate]);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);

    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || selectedDate || '',
        order_id: task.order_id || '',
        assigned_to: task.assigned_to || ''
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, task, emptyForm]);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user || !isSupabaseConfigured || !supabase) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, title')
          .eq('user_id', user.id)
          .order('title');

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };

    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, user]);

  const statuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // === Style matching ProfilePageNew ===
  const baseField =
    'w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]';

  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(task ? 'Updating task...' : 'Creating task...');

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        order_id: formData.order_id || null
      };

      if (task) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id);

        if (error) throw error;
        toast.success('Task updated successfully!', { id: toastId });
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ ...taskData, user_id: user!.id }])
          .select('id')
          .single();

        if (error) throw error;
        toast.success('Task created successfully!', { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validation pour l'étape 1
      if (!formData.title.trim()) {
        toast.error('Task title is required');
        return;
      }
    }
    if (currentStep < 2) {
      setCurrentStep(s => s + 1);
    }
  };
  
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <CheckSquare className="mr-2 text-[#9c68f2]" size={20} />
              Task Details
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Fields marked with <span className="text-red-400">*</span> are required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={baseField}
                  placeholder="Complete project proposal"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={baseField}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={baseField}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className={baseField}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={baseField}
                rows={3}
                placeholder="Task details, requirements, notes..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <User className="mr-2 text-[#9c68f2]" size={20} />
              Assignment & Project
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Link this task to a project and assign it to someone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Related Order/Project</label>
                <select
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select an order (optional)</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>{order.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Assigned To</label>
                <input
                  type="text"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className={baseField}
                  placeholder="Email or name of assignee"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <ModernCard>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {task ? 'Edit Task' : 'New Task'}
                </h2>
                <div className="flex items-center mt-4 space-x-3">
                  {[
                    { step: 1, label: 'Details', icon: CheckSquare },
                    { step: 2, label: 'Assignment', icon: User }
                  ].map(({ step, label, icon: Icon }) => (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        step <= currentStep 
                          ? 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5] border-[#9c68f2] text-white' 
                          : 'bg-[#35414e] border-gray-600 text-gray-400'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="ml-2 hidden sm:block">
                        <div className={`text-xs font-medium ${
                          step <= currentStep ? 'text-white' : 'text-gray-400'
                        }`}>
                          {label}
                        </div>
                        <div className={`text-xs ${
                          step <= currentStep ? 'text-[#9c68f2]' : 'text-gray-500'
                        }`}>
                          Step {step}
                        </div>
                      </div>
                      {step < 2 && (
                        <div className={`ml-3 w-8 h-0.5 transition-all ${
                          step < currentStep ? 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5]' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progress</span>
                <span>{currentStep}/2</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Footer */}
              <div className="flex justify-between mt-8 pt-6 border-t border-[#35414e]">
                <ModernButton
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  Previous
                </ModernButton>

                <div className="flex space-x-3">
                  <ModernButton
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </ModernButton>

                  {currentStep < 2 ? (
                    <ModernButton
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        nextStep();
                      }}
                    >
                      Next
                    </ModernButton>
                  ) : (
                    <ModernButton
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : (task ? 'Update' : 'Create')}
                    </ModernButton>
                  )}
                </div>
              </div>
            </form>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;