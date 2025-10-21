// src/components/OrderDetailModal.tsx
import React, { useState } from 'react';
import {
  X, FileText, User, DollarSign, Calendar, Tags as TagsIcon,
  ClipboardList, Building2, Edit3, Copy, Clock, CheckCircle, Save, ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

type OrderDetailClient = {
  name: string;
  platform?: string | null;
};

export type OrderDetail = {
  id: string;
  title: string;
  description?: string | null;
  budget?: number | null; // Changé de 'amount' à 'budget'
  due_date?: string | null; // Changé de 'deadline' à 'due_date'
  created_at?: string | null;

  // management
  status?: 'Pending' | 'In Progress' | 'Completed' | string;
  project_type?: string | null;
  priority_level?: string | null;
  estimated_hours?: number | null;
  hourly_rate?: number | null;
  payment_status?: string | null;

  // dates
  start_date?: string | null;
  completion_date?: string | null;
  revision_count?: number | null;

  // extras
  notes?: string | null;
  tags?: string[] | null;
  client_feedback?: string | null;

  // relation (comme dans OrdersPage)
  clients?: OrderDetailClient;

  // fallback éventuels si la page envoie des champs plats
  client_name?: string;
  platform?: string | null;
};

interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (order: OrderDetail) => void;
  onOrderUpdated?: (updatedOrder: OrderDetail) => void;
}

const Row: React.FC<{ label: string; value?: React.ReactNode; copyable?: boolean }> = ({ label, value, copyable = false }) => {
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 hover:bg-[#35414e]/30 rounded-lg transition-all duration-200">
      <div className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-1 sm:mb-0">{label}</div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-white dark:text-gray-100 break-words sm:ml-6">
          {value ?? <span className="text-gray-500 dark:text-gray-500 italic">Non renseigné</span>}
        </div>
        {copyable && typeof value === 'string' && value !== 'Non renseigné' && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-[#35414e] rounded"
            title="Copier"
          >
            <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; gradient?: boolean }> = ({ icon, title, children, gradient = false }) => (
  <div className={`
    ${gradient ? 'bg-gradient-to-br from-[#9c68f2]/10 to-[#422ca5]/10 border-[#9c68f2]/20' : 'bg-[#1e2938] border-[#35414e]'} 
    border rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
  `}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-[#35414e]/50">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const badgeForStatus = (status?: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30';
    case 'In Progress':
      return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30';
    case 'Pending':
      return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30';
    default:
      return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30';
  }
};

const chipForPlatform = (p?: string | null) =>
  p
    ? {
        Fiverr: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30',
        Upwork: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border border-teal-500/30',
        Direct: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 border border-purple-500/30',
      }[p] || 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-400 border border-indigo-500/30'
    : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30';

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onEdit, onOrderUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    status: 'Pending',
    start_date: '',
    due_date: '',
    completion_date: '',
    notes: '',
    tags: [] as string[],
  });

  // Initialiser les données du formulaire quand l'order change
  React.useEffect(() => {
    if (order) {
      setFormData({
        title: order.title || '',
        description: order.description || '',
        budget: order.budget?.toString() || '',
        status: order.status || 'Pending',
        start_date: order.start_date || '',
        due_date: order.due_date || '',
        completion_date: order.completion_date || '',
        notes: order.notes || '',
        tags: order.tags || [],
      });
    }
  }, [order]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurer les données originales
    if (order) {
      setFormData({
        title: order.title || '',
        description: order.description || '',
        budget: order.budget?.toString() || '',
        status: order.status || 'Pending',
        start_date: order.start_date || '',
        due_date: order.due_date || '',
        completion_date: order.completion_date || '',
        notes: order.notes || '',
        tags: order.tags || [],
      });
    }
  };

  const handleSave = async () => {
    if (!order?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          title: formData.title,
          description: formData.description,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          status: formData.status,
          start_date: formData.start_date || null,
          due_date: formData.due_date || null,
          completion_date: formData.completion_date || null,
          notes: formData.notes,
          tags: formData.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Commande mise à jour avec succès');
      setIsEditing(false);
      
      // Notifier le parent de la mise à jour
      if (onOrderUpdated && order) {
        const updatedOrder = {
          ...order,
          title: formData.title,
          description: formData.description,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          status: formData.status,
          start_date: formData.start_date,
          due_date: formData.due_date,
          completion_date: formData.completion_date,
          notes: formData.notes,
          tags: formData.tags,
        };
        onOrderUpdated(updatedOrder);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const clientName = order?.clients?.name || order?.client_name || '—';
  const platform = order?.clients?.platform ?? order?.platform ?? null;

  const tags = isEditing ? formData.tags : (order?.tags ?? []);
  const TagList = tags.length ? (
    <div className="flex flex-wrap gap-2">
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-[#9c68f2]/20 to-[#422ca5]/20 text-[#9c68f2] border border-[#9c68f2]/30 hover:from-[#9c68f2]/30 hover:to-[#422ca5]/30 transition-all duration-200"
        >
          {t}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-gray-500 dark:text-gray-500 italic">Aucun tag</span>
  );

  const computedTotal =
    (order?.estimated_hours ? Number(order.estimated_hours) : 0) *
    (order?.hourly_rate ? Number(order.hourly_rate) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1e2938] border border-[#35414e] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#35414e] bg-gradient-to-r from-[#1e2938] to-[#35414e]/20 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#9c68f2] to-[#422ca5]">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Modifier la Commande' : (order?.title || 'Commande')}
              </h2>
              {order?.created_at && (
                <p className="text-sm text-gray-400">
                  Créée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#35414e] text-gray-300 text-sm font-medium hover:bg-[#4a5568] transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white text-sm font-medium hover:from-[#8a5cf0] hover:to-[#3a2590] shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </>
            ) : (
              <>
                {onEdit && order && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white text-sm font-medium hover:from-[#8a5cf0] hover:to-[#3a2590] shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifier
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[#35414e] text-gray-400 hover:text-white transition-all duration-200"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <Section icon={<FileText className="w-5 h-5 text-[#9c68f2]" />} title="Détails de la Commande" gradient>
            {isEditing ? (
              <>
                <div className="py-3 px-4">
                  <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Titre du projet</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                    placeholder="Titre du projet"
                  />
                </div>
                <div className="py-3 px-4">
                  <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                  >
                    <option value="Pending">En attente</option>
                    <option value="In Progress">En cours</option>
                    <option value="Completed">Terminé</option>
                  </select>
                </div>
                <div className="py-3 px-4">
                  <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200 resize-none"
                    placeholder="Description du projet"
                  />
                </div>
              </>
            ) : (
              <>
                <Row label="Titre du projet" value={order?.title} copyable />
                <Row label="Type de projet" value={order?.project_type} />
                <Row
                  label="Statut"
                  value={
                    <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${badgeForStatus(order?.status)}`}>
                      {order?.status || 'Non défini'}
                    </span>
                  }
                />
                <Row label="Niveau de priorité" value={order?.priority_level} />
                <Row label="Description" value={order?.description} />
              </>
            )}
          </Section>

          <Section icon={<User className="w-5 h-5 text-[#9c68f2]" />} title="Informations Client">
            <Row label="Nom du client" value={clientName} copyable />
            <Row
              label="Plateforme"
              value={
                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${chipForPlatform(platform)}`}>
                  {platform || 'Non spécifiée'}
                </span>
              }
            />
          </Section>

          <Section icon={<DollarSign className="w-5 h-5 text-[#9c68f2]" />} title="Financement & Budget" gradient>
            {isEditing ? (
              <div className="py-3 px-4">
                <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Budget total</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                  placeholder="Budget en $"
                />
              </div>
            ) : (
              <>
                <Row label="Budget total" value={typeof order?.budget === 'number' ? `$${order.budget.toLocaleString()}` : null} />
                <Row label="Statut de paiement" value={order?.payment_status} />
                <Row label="Heures estimées" value={order?.estimated_hours ? `${order.estimated_hours}h` : null} />
                <Row label="Taux horaire" value={order?.hourly_rate ? `$${Number(order.hourly_rate).toFixed(2)}/h` : null} />
                <Row label="Total calculé" value={computedTotal ? `$${computedTotal.toFixed(2)}` : null} />
              </>
            )}
          </Section>

          <Section icon={<Calendar className="w-5 h-5 text-[#9c68f2]" />} title="Planning & Échéances">
            {isEditing ? (
              <>
                <div className="py-3 px-4">
                  <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Date de début</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                  />
                </div>
                <div className="py-3 px-4">
                  <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Date d'échéance</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                  />
                </div>
                <div className="py-3 px-4">
                  <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Date de complétion</label>
                  <input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => handleInputChange('completion_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                  />
                </div>
              </>
            ) : (
              <>
                <Row label="Date de début" value={order?.start_date ? new Date(order.start_date).toLocaleDateString('fr-FR') : null} />
                <Row label="Date d'échéance" value={order?.due_date ? new Date(order.due_date).toLocaleDateString('fr-FR') : null} />
                <Row label="Date de complétion" value={order?.completion_date ? new Date(order.completion_date).toLocaleDateString('fr-FR') : null} />
                <Row label="Nombre de révisions" value={order?.revision_count ? `${order.revision_count} révision${order.revision_count > 1 ? 's' : ''}` : null} />
              </>
            )}
          </Section>

          <Section icon={<ClipboardList className="w-5 h-5 text-[#9c68f2]" />} title="Notes & Feedback">
            {isEditing ? (
              <div className="py-3 px-4">
                <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Notes internes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200 resize-none"
                  placeholder="Notes internes sur le projet"
                />
              </div>
            ) : (
              <>
                <Row label="Notes internes" value={order?.notes} />
                <Row label="Feedback du client" value={order?.client_feedback} />
              </>
            )}
          </Section>

          <Section icon={<TagsIcon className="w-5 h-5 text-[#9c68f2]" />} title="Tags & Catégories">
            {isEditing ? (
              <div className="py-3 px-4">
                <label className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-2 block">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2] transition-all duration-200"
                  placeholder="design, logo, branding"
                />
                <p className="text-xs text-gray-400 mt-1">Séparez les tags par des virgules</p>
              </div>
            ) : (
              <div className="py-2">
                {TagList}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
