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
    client_type?: string;
    email_primary?: string;
    email_secondary?: string;
    phone_primary?: string;
    phone_whatsapp?: string;
    timezone?: string;
    preferred_language?: string;
    country?: string;
    city?: string;
    industry?: string;
    services_needed?: string[];
    budget_range?: string;
    collaboration_frequency?: string;
    acquisition_source?: string;
    client_status?: string;
    priority_level?: string;
    payment_terms?: string;
    preferred_contact_method?: string;
    availability_notes?: string;
    important_notes?: string;
    next_action?: string;
    next_action_date?: string;
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
    client_type: 'individual',
    platform: '',
    email_primary: '',
    email_secondary: '',
    phone_primary: '',
    phone_whatsapp: '',
    timezone: '',
    preferred_language: 'English',
    country: '',
    city: '',
    industry: '',
    services_needed: [] as string[],
    budget_range: '',
    collaboration_frequency: '',
    acquisition_source: '',
    client_status: 'prospect',
    priority_level: 'medium',
    payment_terms: '',
    preferred_contact_method: 'email',
    availability_notes: '',
    important_notes: '',
    next_action: '',
    next_action_date: '',
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
        client_type: client.client_type || 'individual',
        platform: client.platform || '',
        email_primary: client.email_primary || '',
        email_secondary: client.email_secondary || '',
        phone_primary: client.phone_primary || '',
        phone_whatsapp: client.phone_whatsapp || '',
        timezone: client.timezone || '',
        preferred_language: client.preferred_language || 'English',
        country: client.country || '',
        city: client.city || '',
        industry: client.industry || '',
        services_needed: client.services_needed || [],
        budget_range: client.budget_range || '',
        collaboration_frequency: client.collaboration_frequency || '',
        acquisition_source: client.acquisition_source || '',
        client_status: client.client_status || 'prospect',
        priority_level: client.priority_level || 'medium',
        payment_terms: client.payment_terms || '',
        preferred_contact_method: client.preferred_contact_method || 'email',
        availability_notes: client.availability_notes || '',
        important_notes: client.important_notes || '',
        next_action: client.next_action || '',
        next_action_date: client.next_action_date || '',
        tags: client.tags || []
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, client, emptyForm]);

  const platforms = [
    'Fiverr', 'Upwork', 'Freelancer', 'Direct', 'LinkedIn', 'Malt', 'Toptal', '99designs', 'PeoplePerHour', 'Other'
  ];

  const clientTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const languages = [
    'English', 'Français', 'Español', 'Deutsch', 'Italiano', 'Português', 'Nederlands', 'العربية', '中文', '日本語'
  ];

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1',
    'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  const countries = [
    'France', 'United States', 'Canada', 'United Kingdom', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Belgium',
    'Switzerland', 'Australia', 'Brazil', 'India', 'Japan', 'China', 'Mexico', 'Argentina', 'Other'
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

  const budgetRanges = [
    'Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000 - $10,000', 'Over $10,000'
  ];

  const collaborationFrequencies = [
    { value: 'one-time', label: 'One-time' },
    { value: 'occasional', label: 'Occasional' },
    { value: 'regular', label: 'Regular' },
    { value: 'ongoing', label: 'Ongoing' }
  ];

  const acquisitionSources = [
    'Referral', 'Social Media', 'Search Engine', 'Advertisement', 'Cold Outreach', 'Networking Event', 'Website', 'Other'
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

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'platform', label: 'Platform' }
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
        client_type: formData.client_type,
        platform: formData.platform,
        email_primary: formData.email_primary.trim() || null,
        email_secondary: formData.email_secondary.trim() || null,
        phone_primary: formData.phone_primary.trim() || null,
        phone_whatsapp: formData.phone_whatsapp.trim() || null,
        timezone: formData.timezone || null,
        preferred_language: formData.preferred_language,
        country: formData.country || null,
        city: formData.city.trim() || null,
        industry: formData.industry || null,
        services_needed: formData.services_needed.length > 0 ? formData.services_needed : null,
        budget_range: formData.budget_range || null,
        collaboration_frequency: formData.collaboration_frequency || null,
        acquisition_source: formData.acquisition_source || null,
        client_status: formData.client_status,
        priority_level: formData.priority_level,
        payment_terms: formData.payment_terms || null,
        preferred_contact_method: formData.preferred_contact_method,
        availability_notes: formData.availability_notes.trim() || null,
        important_notes: formData.important_notes.trim() || null,
        next_action: formData.next_action.trim() || null,
        next_action_date: formData.next_action_date || null,
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
    if (currentStep === 2) {
      // Validation pour l'étape 2
      if (!formData.email_primary.trim()) {
        toast.error('Primary email is required');
        return;
      }
    }
    if (currentStep < 4) {
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
                  Client Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className={baseField}
                >
                  {clientTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
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
              Contact & Location
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              All contact information is optional. You can fill in as much or as little as needed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primary Email</label>
                <input
                  type="email"
                  value={formData.email_primary}
                  onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                  className={baseField}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className={labelCls}>Secondary Email</label>
                <input
                  type="email"
                  value={formData.email_secondary}
                  onChange={(e) => setFormData({ ...formData, email_secondary: e.target.value })}
                  className={baseField}
                  placeholder="email2@example.com"
                />
              </div>

              <div>
                <label className={labelCls}>Primary Phone</label>
                <input
                  type="tel"
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  className={baseField}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className={labelCls}>WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone_whatsapp}
                  onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                  className={baseField}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className={labelCls}>Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select a timezone</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Preferred Language</label>
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  className={baseField}
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={baseField}
                  placeholder="New York"
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
              Business & Projects
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Help us understand your client's business needs and project requirements.
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
                <label className={labelCls}>Average Project Budget</label>
                <select
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select a range</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Collaboration Frequency</label>
                <select
                  value={formData.collaboration_frequency}
                  onChange={(e) => setFormData({ ...formData, collaboration_frequency: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select a frequency</option>
                  {collaborationFrequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Acquisition Source</label>
                <select
                  value={formData.acquisition_source}
                  onChange={(e) => setFormData({ ...formData, acquisition_source: e.target.value })}
                  className={baseField}
                >
                  <option value="">Select a source</option>
                  {acquisitionSources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Required Services</label>
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
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <MessageSquare className="mr-2 text-[#9c68f2]" size={20} />
              Management & Communication
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set up how you'll manage and communicate with this client.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className={labelCls}>Priority</label>
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

              <div>
                <label className={labelCls}>Preferred Contact Method</label>
                <select
                  value={formData.preferred_contact_method}
                  onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                  className={baseField}
                >
                  {contactMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Next Action</label>
                <input
                  type="text"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  className={baseField}
                  placeholder="Call to discuss the project"
                />
              </div>

              <div>
                <label className={labelCls}>Next Action Date</label>
                <input
                  type="date"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
                  className={baseField}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Availability Notes</label>
              <textarea
                value={formData.availability_notes}
                onChange={(e) => setFormData({ ...formData, availability_notes: e.target.value })}
                className={baseField}
                rows={2}
                placeholder="Available weekdays from 9am to 5pm"
              />
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
                    { step: 3, label: 'Business', icon: Briefcase },
                    { step: 4, label: 'Management', icon: MessageSquare }
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
                      {step < 4 && (
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
                <span>{currentStep}/4</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
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

                  {currentStep < 4 ? (
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
