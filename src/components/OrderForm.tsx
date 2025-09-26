// src/components/OrderForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { NotificationHelpers } from '../utils/notifications';
import { usePlanLimits } from '../hooks/usePlanLimits';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  platform: string;
}

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: {
    id: string;
    title: string;
    description?: string;
    amount: number;
    deadline: string;
    client_id: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    project_type?: string;
    priority_level?: string;
    estimated_hours?: number;
    hourly_rate?: number;
    payment_status?: string;
    notes?: string;
    tags?: string[];
    start_date?: string;
    completion_date?: string;
    revision_count?: number;
    client_feedback?: string;
  } | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, onSuccess, order }) => {
  const { user } = useAuth();
  const { checkOrderLimit } = usePlanLimits();

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // modèle vide
  const emptyForm = useMemo(() => ({
    // Basic
    title: '',
    description: '',
    client_id: '',
    project_type: '',
    // Finance
    amount: '',                // keep as string in inputs
    estimated_hours: '',
    hourly_rate: '',
    payment_status: 'pending',
    // Timeline
    start_date: '',
    deadline: '',
    completion_date: '',
    // Management
    status: 'Pending' as 'Pending' | 'In Progress' | 'Completed',
    priority_level: 'medium',
    revision_count: 0,
    // Extras
    notes: '',
    client_feedback: '',
    tags: [] as string[],
  }), []);

  const [formData, setFormData] = useState(emptyForm);

  // Hydrate quand la modale s’ouvre / quand order change
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setErrors({});
    setFormData(order ? {
      title: order.title || '',
      description: order.description || '',
      client_id: order.client_id || '',
      project_type: order.project_type || '',
      amount: (order.amount ?? '') as any as string,
      estimated_hours: (order.estimated_hours ?? '') as any as string,
      hourly_rate: (order.hourly_rate ?? '') as any as string,
      payment_status: order.payment_status || 'pending',
      start_date: order.start_date || '',
      deadline: order.deadline || '',
      completion_date: order.completion_date || '',
      status: (order.status || 'Pending') as 'Pending' | 'In Progress' | 'Completed',
      priority_level: order.priority_level || 'medium',
      revision_count: order.revision_count ?? 0,
      notes: order.notes || '',
      client_feedback: order.client_feedback || '',
      tags: order.tags || [],
    } : emptyForm);
  }, [isOpen, order, emptyForm]);

  // Charger la liste des clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!isOpen) return;
      if (!isSupabaseConfigured || !supabase || !user) {
        setClients([
          { id: '1', name: 'John Doe', platform: 'Fiverr' },
          { id: '2', name: 'Jane Smith', platform: 'Upwork' }
        ]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id,name,platform')
          .eq('user_id', user.id)
          .order('name');
        if (error) throw error;
        setClients(data || []);
      } catch (e) {
        console.error('Error loading clients:', e);
        toast.error('Unable to load clients');
      }
    };
    fetchClients();
  }, [isOpen, user]);

  const projectTypes = [
    'Web Development','Mobile Development','Graphic Design','UI/UX Design',
    'Content Writing','SEO','Digital Marketing','Social Media Management',
    'Video Editing','Photography','Translation','Data Entry','Consulting','Other'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'partial', label: 'Partiel' },
    { value: 'paid', label: 'Payé' },
    { value: 'overdue', label: 'En retard' }
  ];

  // Validation par step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.client_id) newErrors.client_id = 'Client selection is required';
      if (!formData.project_type) newErrors.project_type = 'Project type is required';
    }
    if (step === 2) {
      const amount = parseFloat(`${formData.amount || 0}`);
      if (!(amount > 0)) newErrors.amount = 'Valid amount is required';
      if (formData.estimated_hours) {
        const eh = parseInt(`${formData.estimated_hours}`, 10);
        if (!(eh > 0)) newErrors.estimated_hours = 'Estimated hours must be positive';
      }
      if (formData.hourly_rate) {
        const hr = parseFloat(`${formData.hourly_rate}`);
        if (!(hr > 0)) newErrors.hourly_rate = 'Hourly rate must be positive';
      }
    }
    if (step === 3) {
      if (!formData.deadline) newErrors.deadline = 'Deadline is required';
      if (formData.start_date && formData.deadline) {
        if (new Date(formData.start_date) >= new Date(formData.deadline)) {
          newErrors.start_date = 'Start date must be before deadline';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order) {
      const canAddOrder = await checkOrderLimit();
      if (!canAddOrder) return;
    }

    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        toast.error('Please fix the errors before submitting');
        return;
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(order ? 'Updating order...' : 'Creating order...');

    try {
      const orderData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        amount: parseFloat(`${formData.amount}`),
        deadline: formData.deadline || null,
        client_id: formData.client_id,
        status: formData.status,
        project_type: formData.project_type || null,
        priority_level: formData.priority_level,
        estimated_hours: formData.estimated_hours ? parseInt(`${formData.estimated_hours}`, 10) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(`${formData.hourly_rate}`) : null,
        payment_status: formData.payment_status,
        notes: formData.notes.trim() || null,
        tags: formData.tags.length ? formData.tags : null,
        start_date: formData.start_date || null,
        completion_date: formData.completion_date || null,
        revision_count: formData.revision_count || 0,
        client_feedback: formData.client_feedback.trim() || null
      };

      if (order) {
        const { error } = await supabase.from('orders').update(orderData).eq('id', order.id);
        if (error) throw error;
        toast.success('Order updated successfully!', { id: toastId });
      } else {
        const { data, error } = await supabase.from('orders').insert(orderData).select('id').single();
        if (error) throw error;

        if (data && user) {
          const selectedClient = clients.find(c => c.id === formData.client_id);
          if (selectedClient) {
            await NotificationHelpers.orderCreated(user.id, formData.title, selectedClient.name, data.id);
          }
        }
        toast.success('Order created successfully!', { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
      setErrors({});
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) setCurrentStep(s => s + 1);
  };
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  if (!isOpen) return null;

  const inputBase =
    'w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'bg-white text-gray-900 border-gray-300 placeholder-gray-400 ' +
    'dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder-slate-400';

  const selectBase =
    'w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'bg-white text-gray-900 border-gray-300 ' +
    'dark:bg-slate-800 dark:text-white dark:border-slate-700';

  const labelBase = 'block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300';
  const errorText = 'mt-1 text-sm text-red-600 flex items-center';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelBase}>Order Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`${inputBase} ${errors.title ? 'border-red-300 dark:border-red-500' : ''}`}
                  placeholder="e.g., Logo design for tech startup"
                />
                {errors.title && <p className={errorText}><span className="mr-1">⚠️</span>{errors.title}</p>}
              </div>

              <div>
                <label className={labelBase}>Client *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className={`${selectBase} ${errors.client_id ? 'border-red-300 dark:border-red-500' : ''}`}
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.platform})
                    </option>
                  ))}
                </select>
                {errors.client_id && <p className={errorText}><span className="mr-1">⚠️</span>{errors.client_id}</p>}
              </div>

              <div>
                <label className={labelBase}>Project Type *</label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className={`${selectBase} ${errors.project_type ? 'border-red-300 dark:border-red-500' : ''}`}
                >
                  <option value="">Select project type</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.project_type && <p className={errorText}><span className="mr-1">⚠️</span>{errors.project_type}</p>}
              </div>

              <div>
                <label className={labelBase}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputBase} h-28`}
                  placeholder="Detailed description of the project requirements..."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="mr-2" size={20} />
              Financial Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>Total Amount ($) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`${inputBase} ${errors.amount ? 'border-red-300 dark:border-red-500' : ''}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.amount && <p className={errorText}><span className="mr-1">⚠️</span>{errors.amount}</p>}
              </div>

              <div>
                <label className={labelBase}>Payment Status</label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                  className={selectBase}
                >
                  {paymentStatuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelBase}>Estimated Hours</label>
                <input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  className={`${inputBase} ${errors.estimated_hours ? 'border-red-300 dark:border-red-500' : ''}`}
                  placeholder="0"
                  min="0"
                />
                {errors.estimated_hours && <p className={errorText}><span className="mr-1">⚠️</span>{errors.estimated_hours}</p>}
              </div>

              <div>
                <label className={labelBase}>Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className={`${inputBase} ${errors.hourly_rate ? 'border-red-300 dark:border-red-500' : ''}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.hourly_rate && <p className={errorText}><span className="mr-1">⚠️</span>{errors.hourly_rate}</p>}
              </div>
            </div>

            {formData.estimated_hours && formData.hourly_rate && (
              <div className="rounded-lg p-4 border bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
                <p className="text-sm">
                  <strong>Calculated Total:</strong>{' '}
                  {(
                    parseFloat(`${formData.estimated_hours || 0}`) *
                    parseFloat(`${formData.hourly_rate || 0}`)
                  ).toFixed(2)} $
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Timeline & Management
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`${inputBase} ${errors.start_date ? 'border-red-300 dark:border-red-500' : ''}`}
                />
                {errors.start_date && <p className={errorText}><span className="mr-1">⚠️</span>{errors.start_date}</p>}
              </div>

              <div>
                <label className={labelBase}>Deadline *</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`${inputBase} ${errors.deadline ? 'border-red-300 dark:border-red-500' : ''}`}
                />
                {errors.deadline && <p className={errorText}><span className="mr-1">⚠️</span>{errors.deadline}</p>}
              </div>

              <div>
                <label className={labelBase}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pending' | 'In Progress' | 'Completed' })}
                  className={selectBase}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className={labelBase}>Priority Level</label>
                <select
                  value={formData.priority_level}
                  onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                  className={selectBase}
                >
                  {priorityLevels.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {formData.status === 'Completed' && (
                <div>
                  <label className={labelBase}>Completion Date</label>
                  <input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                    className={inputBase}
                  />
                </div>
              )}

              <div>
                <label className={labelBase}>Revision Count</label>
                <input
                  type="number"
                  value={formData.revision_count}
                  onChange={(e) => setFormData({ ...formData, revision_count: parseInt(e.target.value || '0', 10) })}
                  className={inputBase}
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>

            <div className="space-y-4">
              <div>
                <label className={labelBase}>Project Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`${inputBase} h-24`}
                  placeholder="Internal notes about the project..."
                />
              </div>

              <div>
                <label className={labelBase}>Client Feedback</label>
                <textarea
                  value={formData.client_feedback}
                  onChange={(e) => setFormData({ ...formData, client_feedback: e.target.value })}
                  className={`${inputBase} h-24`}
                  placeholder="Client feedback and comments..."
                />
              </div>

              <div>
                <label className={labelBase}>Project Tags</label>
                <input
                  type="text"
                  onKeyDown={handleTagsChange}
                  className={inputBase}
                  placeholder="Type a tag and press Enter"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs
                                   bg-blue-100 text-blue-800
                                   dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {order ? 'Edit Order' : 'Create New Order'}
            </h2>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle size={16} /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         border-gray-300 text-gray-700 hover:bg-gray-50
                         dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg transition-colors
                           border-gray-300 text-gray-700 hover:bg-gray-50
                           dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                disabled={loading}
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {order ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      {order ? 'Update Order' : 'Create Order'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
