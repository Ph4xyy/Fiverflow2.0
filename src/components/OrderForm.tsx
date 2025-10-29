import React, { useEffect, useMemo, useState } from 'react';
import { X, FileText, User, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';
import { usePlanLimits } from '../hooks/usePlanLimits';
import toast from 'react-hot-toast';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    platform?: string;
    client_id: string;
    client_name?: string;
    client_email?: string;
    budget?: number;
    currency?: string;
    start_date?: string;
    due_date?: string;
    completed_date?: string;
  } | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, onSuccess, order }) => {
  const { user } = useAuth();
  const { checkOrderLimit } = usePlanLimits();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<Array<{id: string, name: string}>>([]);

  const emptyForm = useMemo(() => ({
    title: '',
    description: '',
    status: 'pending',
    platform: '',
    client_id: '',
    budget: '',
    currency: 'USD',
    start_date: '',
    due_date: '',
    completed_date: ''
  }), []);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);

    if (order) {
      setFormData({
        title: order.title || '',
        description: order.description || '',
        status: order.status || 'pending',
        platform: order.platform || '',
        client_id: order.client_id || '',
        budget: order.budget?.toString() || '',
        currency: order.currency || 'USD',
        start_date: order.start_date || '',
        due_date: order.due_date || '',
        completed_date: order.completed_date || ''
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, order, emptyForm]);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user || !isSupabaseConfigured || !supabase) return;
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };

    if (isOpen) {
      loadClients();
    }
  }, [isOpen, user]);

  const platforms = [
    'Fiverr', 'Upwork', 'Freelancer', 'Direct', 'LinkedIn', 'Malt', 'Toptal', '99designs', 'PeoplePerHour', 'Other'
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const currencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY', 'CNY', 'INR', 'BRL', 'MXN', 'ZAR', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'TRY', 'KRW', 'SGD', 'HKD', 'NZD', 'AED', 'SAR', 'ILS', 'THB', 'MYR', 'PHP', 'IDR', 'VND'
  ];

  // === Style matching ProfilePageNew ===
  const baseField =
    'w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]';

  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order) {
      const canAddOrder = await checkOrderLimit();
      if (!canAddOrder) return;
    }

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Order title is required');
      return;
    }

    if (!formData.client_id) {
      toast.error('Client is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(order ? 'Updating order...' : 'Creating order...');

    try {
      const orderData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        platform: formData.platform || null,
        client_id: formData.client_id,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        currency: formData.currency,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        completed_date: formData.completed_date || null
      };

      if (order) {
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', order.id);

        if (error) throw error;
        toast.success('Order updated successfully!', { id: toastId });
      } else {
        const { data, error } = await supabase
          .from('orders')
          .insert([{ ...orderData, user_id: user!.id }])
          .select('id')
          .single();

        if (error) throw error;
        toast.success('Order created successfully!', { id: toastId });
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

  const nextStep = () => currentStep < 3 && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <FileText className="mr-2 text-[#9c68f2]" size={20} />
              Basic Information
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Fields marked with <span className="text-red-400">*</span> are required. All other fields are optional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Order Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={baseField}
                  placeholder="Website redesign project"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select a platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Client <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className={baseField}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
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
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={baseField}
                rows={3}
                placeholder="Describe the project requirements, deliverables, and any specific details..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <DollarSign className="mr-2 text-[#9c68f2]" size={20} />
              Budget & Financial Information
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set the budget and financial details for this order.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Budget Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className={baseField}
                  placeholder="1000.00"
                />
              </div>

              <div>
                <label className={labelCls}>Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className={baseField}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Calendar className="mr-2 text-[#9c68f2]" size={20} />
              Timeline & Dates
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set important dates for this order.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={baseField}
                />
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

              <div>
                <label className={labelCls}>Completed Date</label>
                <input
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                  className={baseField}
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
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <ModernCard>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {order ? 'Edit Order' : 'New Order'}
                </h2>
                <div className="flex items-center mt-4 space-x-3">
                  {[
                    { step: 1, label: 'Basic Info', icon: FileText },
                    { step: 2, label: 'Budget', icon: DollarSign },
                    { step: 3, label: 'Timeline', icon: Calendar }
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
                      {step < 3 && (
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
                <span>{currentStep}/3</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
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

                  {currentStep < 3 ? (
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
                      {loading ? 'Processing...' : (order ? 'Update' : 'Create')}
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

export default OrderForm;