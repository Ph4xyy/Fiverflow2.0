import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Calendar, Clock, FileText } from 'lucide-react';
import { Task } from '../hooks/useTasks';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  title: string;
  client: {
    name: string;
  };
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  orderId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, task, orderId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    order_id: task?.order_id || orderId || '',
    status: task?.status || 'todo' as 'todo' | 'in_progress' | 'completed',
    priority: task?.priority || 'medium' as 'low' | 'medium' | 'high',
    estimated_hours: task?.estimated_hours || 0,
    due_date: task?.due_date || ''
  });

  const statusOptions = [
    { value: 'todo', label: 'À faire', color: 'text-gray-600' },
    { value: 'in_progress', label: 'En cours', color: 'text-blue-600' },
    { value: 'completed', label: 'Terminé', color: 'text-green-600' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: 'text-green-600' },
    { value: 'medium', label: 'Moyenne', color: 'text-blue-400' },
    { value: 'high', label: 'Haute', color: 'text-red-600' }
  ];

  useEffect(() => {
    if (isOpen && !orderId) {
      fetchOrders();
    }
  }, [isOpen, orderId]);

  const fetchOrders = async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      // Mock orders pour la démo
      setOrders([
        { id: '1', title: 'Logo Design Project', client: { name: 'John Doe' } },
        { id: '2', title: 'Website Development', client: { name: 'Jane Smith' } }
      ]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          title,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = data?.map(order => ({
        id: order.id,
        title: order.title,
        client: {
          name: (order.clients as any).name
        }
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Unable to load orders');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!formData.order_id) {
      toast.error('Please select an order');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(task ? 'Updating task...' : 'Creating task...');

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        order_id: formData.order_id,
        status: formData.status,
        priority: formData.priority,
        estimated_hours: formData.estimated_hours,
        due_date: formData.due_date || null
      };

      if (task) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id);

        if (error) throw error;
        toast.success('Task updated successfully!', { id: toastId });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;
        toast.success('Task created successfully!', { id: toastId });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-100">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Task Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-500"
                placeholder="e.g., Create wireframes for homepage"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-500"
              rows={3}
              placeholder="Detailed description of what needs to be done..."
            />
          </div>

          {/* Order Selection (si pas d'orderId fourni) */}
          {!orderId && (
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-2">
                Order *
              </label>
              <select
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100"
                required
              >
                <option value="">Select an order</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.title} - {order.client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Heures estimées */}
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-2">
                Estimated Hours
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-500"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  {task ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;