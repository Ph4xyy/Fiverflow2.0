import React, { useEffect, useMemo, useState } from 'react';
import { X, User, Mail, Briefcase, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';
import { usePlanLimits } from '../hooks/usePlanLimits';
import toast from 'react-hot-toast';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: {
    id: string;
    name: string;
    platform: string;
    company_name?: string;
    email_primary?: string;
    phone_primary?: string;
    phone_whatsapp?: string;
    industry?: string;
    services_needed?: string[];
    client_status?: string;
    priority_level?: string;
    payment_terms?: string;
    important_notes?: string;
    tags?: string[];
  } | null;
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSuccess, client }) => {
  const { user } = useAuth();
  const { checkClientLimit } = usePlanLimits();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const emptyForm = useMemo(() => ({
    name: '',
    company_name: '',
    platform: '',
    email_primary: '',
    phone_primary: '',
    phone_whatsapp: '',
    industry: '',
    services_needed: [] as string[],
    client_status: 'prospect',
    priority_level: 'medium',
    payment_terms: '',
    important_notes: '',
    tags: [] as string[]
  }), []);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);

    if (client) {
      setFormData({
        name: client.name || '',
        company_name: client.company_name || '',
        platform: client.platform || '',
        email_primary: client.email_primary || '',
        phone_primary: client.phone_primary || '',
        phone_whatsapp: client.phone_whatsapp || '',
        industry: client.industry || '',
        services_needed: client.services_needed || [],
        client_status: client.client_status || 'prospect',
        priority_level: client.priority_level || 'medium',
        payment_terms: client.payment_terms || '',
        important_notes: client.important_notes || '',
        tags: client.tags || []
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, client, emptyForm]);

  const platforms = [
    'Fiverr', 'Upwork', 'Freelancer', 'Direct', 'LinkedIn', 'Malt', 'Toptal', '99designs', 'PeoplePerHour', 'Other'
  ];


  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Marketing',
    'Consulting', 'Non-profit', 'Government', 'Entertainment', 'Food & Beverage', 'Travel', 'Other'
  ];

  const servicesOptions = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'UI/UX Design', 'Content Writing', 'SEO',
    'Digital Marketing', 'Social Media Management', 'Video Editing', 'Photography', 'Translation', 'Data Entry',
    'Virtual Assistant', 'Consulting', 'Other'
  ];


  const clientStatuses = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'active', label: 'Active Client' },
    { value: 'inactive', label: 'Inactive Client' },
    { value: 'completed', label: 'Project Completed' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const paymentTermsOptions = [
    '50% upfront, 50% on completion', '100% upfront', 'Net 15', 'Net 30', 'Weekly payments', 'Monthly payments', 'Other'
  ];

  // === Style matching ProfilePageNew ===
  const baseField =
    'w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]';

  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';

  const handleServicesChange = (service: string) => {
    const currentServices = formData.services_needed;
    if (currentServices.includes(service)) {
      setFormData({
        ...formData,
        services_needed: currentServices.filter(s => s !== service)
      });
    } else {
      setFormData({
        ...formData,
        services_needed: [...currentServices, service]
      });
    }
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) {
      const canAddClient = await checkClientLimit();
      if (!canAddClient) return;
    }

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Client name is required');
      return;
    }

    if (!formData.platform) {
      toast.error('Platform is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(client ? 'Updating client...' : 'Creating client...');

    try {
      const clientData = {
        name: formData.name.trim(),
        company_name: formData.company_name.trim() || null,
        platform: formData.platform,
        email_primary: formData.email_primary.trim() || null,
        phone_primary: formData.phone_primary.trim() || null,
        phone_whatsapp: formData.phone_whatsapp.trim() || null,
        industry: formData.industry || null,
        services_needed: formData.services_needed.length > 0 ? formData.services_needed : null,
        client_status: formData.client_status,
        priority_level: formData.priority_level,
        payment_terms: formData.payment_terms || null,
        important_notes: formData.important_notes.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null
      };

      if (client) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) throw error;
        toast.success('Client updated successfully!', { id: toastId });
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...clientData, user_id: user!.id }])
          .select('id')
          .single();

        if (error) throw error;

        if (data && user) {
          // TODO: Implémenter le suivi d'activité pour les nouveaux clients
          console.log('Nouveau client créé:', { userId: user.id, clientName: formData.name, platform: formData.platform, clientId: data.id });
        }

        toast.success('Client created successfully!', { id: toastId });
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
      if (!formData.name.trim()) {
        toast.error('Full name is required');
        return;
      }
      if (!formData.platform) {
        toast.error('Platform is required');
        return;
      }
    }
    if (currentStep < 3) {
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
              <User className="mr-2 text-[#9c68f2]" size={20} />
              Basic Information
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Fields marked with <span className="text-red-400">*</span> are required. All other fields are optional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={baseField}
                  placeholder="Client name"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className={baseField}
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className={labelCls}>
                  Platform <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className={baseField}
                  required
                >
                  <option value="">Select a platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Mail className="mr-2 text-[#9c68f2]" size={20} />
              Contact Information
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Add contact details for this client.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={formData.email_primary}
                  onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                  className={baseField}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  className={baseField}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className={labelCls}>WhatsApp (optional)</label>
                <input
                  type="tel"
                  value={formData.phone_whatsapp}
                  onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                  className={baseField}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Briefcase className="mr-2 text-[#9c68f2]" size={20} />
              Additional Details
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Add any additional information about this client.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select an industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Client Status</label>
                <select
                  value={formData.client_status}
                  onChange={(e) => setFormData({ ...formData, client_status: e.target.value })}
                  className={baseField}
                >
                  {clientStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Priority Level</label>
                <select
                  value={formData.priority_level}
                  onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                  className={baseField}
                >
                  {priorityLevels.map((priority) => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Payment Terms</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select payment terms</option>
                  {paymentTermsOptions.map((terms) => (
                    <option key={terms} value={terms}>{terms}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Services Needed</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-xl p-3 border-[#1e2938] bg-[#35414e]">
                {servicesOptions.map((service) => (
                  <label key={service} className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.services_needed.includes(service)}
                      onChange={() => handleServicesChange(service)}
                      className="mr-2 rounded accent-[#9c68f2]"
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Important Notes</label>
              <textarea
                value={formData.important_notes}
                onChange={(e) => setFormData({ ...formData, important_notes: e.target.value })}
                className={baseField}
                rows={3}
                placeholder="Important information to remember..."
              />
            </div>

            <div>
              <label className={labelCls}>Custom Tags</label>
              <input
                type="text"
                onKeyDown={handleTagsChange}
                className={baseField}
                placeholder="Type a tag and press Enter"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gradient-to-r from-[#9c68f2]/20 to-[#422ca5]/20 text-[#9c68f2] ring-1 ring-[#9c68f2]/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-[#9c68f2] hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                  {client ? 'Edit Client' : 'New Client'}
                </h2>
                <div className="flex items-center mt-4 space-x-3">
                  {[
                    { step: 1, label: 'Basic Info', icon: User },
                    { step: 2, label: 'Contact', icon: Mail },
                    { step: 3, label: 'Details', icon: Briefcase }
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
                      {loading ? 'Processing...' : (client ? 'Update' : 'Create')}
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

export default ClientForm;
