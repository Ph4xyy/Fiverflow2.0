import React, { useEffect, useMemo, useState } from 'react';
import { X, User, Mail, Briefcase, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { NotificationHelpers } from '../utils/notifications';
import { usePlanLimits } from '../hooks/usePlanLimits';
import toast from 'react-hot-toast';

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
    'Fiverr', 'Upwork', 'Freelancer', 'Direct', 'LinkedIn', 'Malt', 'Toptal', '99designs', 'PeoplePerHour', 'Autre'
  ];

  const clientTypes = [
    { value: 'individual', label: 'Particulier' },
    { value: 'company', label: 'Entreprise' },
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
    { value: 'one-time', label: 'Ponctuel' },
    { value: 'occasional', label: 'Occasionnel' },
    { value: 'regular', label: 'Régulier' },
    { value: 'ongoing', label: 'Continu' }
  ];

  const acquisitionSources = [
    'Referral', 'Social Media', 'Search Engine', 'Advertisement', 'Cold Outreach', 'Networking Event', 'Website', 'Other'
  ];

  const clientStatuses = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'active', label: 'Client actif' },
    { value: 'inactive', label: 'Client inactif' },
    { value: 'completed', label: 'Projet terminé' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' }
  ];

  const paymentTermsOptions = [
    '50% upfront, 50% on completion', '100% upfront', 'Net 15', 'Net 30', 'Weekly payments', 'Monthly payments', 'Other'
  ];

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'platform', label: 'Plateforme' }
  ];

  // === Nouveau thème sombre ===
  const baseField =
    'w-full px-4 py-2.5 rounded-xl border transition-colors ' +
    'bg-[#11151D] text-slate-100 placeholder-slate-400 border-[#1C2230] ' +
    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500';

  const labelCls = 'block text-sm font-semibold mb-2 text-slate-300';

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
      toast.error('Base de données non configurée');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Le nom du client est obligatoire');
      return;
    }

    if (!formData.platform) {
      toast.error('La plateforme est obligatoire');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(client ? 'Mise à jour du client...' : 'Création du client...');

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
        toast.success('Client mis à jour avec succès !', { id: toastId });
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...clientData, user_id: user!.id }])
          .select('id')
          .single();

        if (error) throw error;

        if (data && user) {
          await NotificationHelpers.newClient(
            user.id,
            formData.name,
            formData.platform,
            data.id
          );
        }

        toast.success('Client créé avec succès !', { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <User className="mr-2 text-purple-400" size={20} />
              Informations de base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={baseField}
                  placeholder="Nom du client"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Nom de l'entreprise</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className={baseField}
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div>
                <label className={labelCls}>Type de client *</label>
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
                <label className={labelCls}>Plateforme *</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className={baseField}
                  required
                >
                  <option value="">Sélectionner une plateforme</option>
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
              <Mail className="mr-2 text-purple-400" size={20} />
              Contact & Localisation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email principal</label>
                <input
                  type="email"
                  value={formData.email_primary}
                  onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                  className={baseField}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className={labelCls}>Email secondaire</label>
                <input
                  type="email"
                  value={formData.email_secondary}
                  onChange={(e) => setFormData({ ...formData, email_secondary: e.target.value })}
                  className={baseField}
                  placeholder="email2@example.com"
                />
              </div>

              <div>
                <label className={labelCls}>Téléphone principal</label>
                <input
                  type="tel"
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  className={baseField}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <label className={labelCls}>WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone_whatsapp}
                  onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                  className={baseField}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <label className={labelCls}>Fuseau horaire</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner un fuseau horaire</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Langue préférée</label>
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
                <label className={labelCls}>Pays</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={baseField}
                  placeholder="Paris"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-zinc-100">
              <Briefcase className="mr-2" size={20} />
              Activité & Projets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Secteur d'activité</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner un secteur</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Budget moyen par projet</label>
                <select
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner une tranche</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Fréquence de collaboration</label>
                <select
                  value={formData.collaboration_frequency}
                  onChange={(e) => setFormData({ ...formData, collaboration_frequency: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner une fréquence</option>
                  {collaborationFrequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Source d'acquisition</label>
                <select
                  value={formData.acquisition_source}
                  onChange={(e) => setFormData({ ...formData, acquisition_source: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner une source</option>
                  {acquisitionSources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Services demandés</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-xl p-3 border-[#1C2230] bg-[#0E121A]">
                {servicesOptions.map((service) => (
                  <label key={service} className="flex items-center text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.services_needed.includes(service)}
                      onChange={() => handleServicesChange(service)}
                      className="mr-2 rounded accent-purple-500"
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
              <MessageSquare className="mr-2 text-purple-400" size={20} />
              Gestion & Communication
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Statut client</label>
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
                <label className={labelCls}>Priorité</label>
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
                <label className={labelCls}>Conditions de paiement</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className={baseField}
                >
                  <option value="">Sélectionner des conditions</option>
                  {paymentTermsOptions.map((terms) => (
                    <option key={terms} value={terms}>{terms}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Méthode de contact préférée</label>
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
                <label className={labelCls}>Prochaine action</label>
                <input
                  type="text"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  className={baseField}
                  placeholder="Appeler pour discuter du projet"
                />
              </div>

              <div>
                <label className={labelCls}>Date de la prochaine action</label>
                <input
                  type="date"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
                  className={baseField}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes de disponibilité</label>
              <textarea
                value={formData.availability_notes}
                onChange={(e) => setFormData({ ...formData, availability_notes: e.target.value })}
                className={baseField}
                rows={2}
                placeholder="Disponible en semaine de 9h à 17h"
              />
            </div>

            <div>
              <label className={labelCls}>Notes importantes</label>
              <textarea
                value={formData.important_notes}
                onChange={(e) => setFormData({ ...formData, important_notes: e.target.value })}
                className={baseField}
                rows={3}
                placeholder="Informations importantes à retenir..."
              />
            </div>

            <div>
              <label className={labelCls}>Tags personnalisés</label>
              <input
                type="text"
                onKeyDown={handleTagsChange}
                className={baseField}
                placeholder="Tapez un tag et appuyez sur Entrée"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-300 ring-1 ring-purple-500/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-purple-300 hover:text-purple-200"
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#11151D] text-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#1C2230]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1C2230]">
          <div>
            <h2 className="text-xl font-bold">
              {client ? 'Modifier le client' : 'Nouveau client'}
            </h2>
            <div className="flex items-center mt-3 space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-10 rounded-full transition-all ${
                    step <= currentStep ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-[#0E121A] hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderStep()}

          {/* Footer */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#1C2230]">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         border-[#1C2230] text-slate-200 hover:bg-[#0E121A]"
            >
              Précédent
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg transition-colors
                           border-[#1C2230] text-slate-200 hover:bg-[#0E121A]"
                disabled={loading}
              >
                Annuler
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'En cours...' : (client ? 'Mettre à jour' : 'Créer')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
