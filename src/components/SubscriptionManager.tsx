import React, { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription, CreateSubscriptionData, BillingCycle } from '@/types/subscription';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/Dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  CreditCard,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDateSafe } from '@/utils/dateUtils';

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'one_time', label: 'One-time' },
];

const CATEGORIES = [
  'entertainment',
  'productivity', 
  'cloud',
  'software',
  'music',
  'video',
  'news',
  'fitness',
  'education',
  'other'
];

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
];

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  onClose: () => void;
  onSubmit: (data: CreateSubscriptionData) => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ subscription, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateSubscriptionData>({
    name: subscription?.name || '',
    description: subscription?.description || '',
    provider: subscription?.provider || '',
    category: subscription?.category || '',
    amount: subscription?.amount || 0,
    currency: subscription?.currency || 'USD',
    billing_cycle: subscription?.billing_cycle || 'monthly',
    next_renewal_date: subscription?.next_renewal_date || '',
    color: subscription?.color || COLORS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.next_renewal_date) {
      return;
    }
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating subscription:', error);
      // Ne pas fermer le modal en cas d'erreur
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#11151D] text-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#1C2230]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1C2230]">
          <div>
            <h2 className="text-xl font-bold">
              {subscription ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-[#0E121A] hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Nom du service *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 placeholder-slate-400 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Netflix, Spotify, Adobe Creative Cloud..."
              required
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Fournisseur *
            </label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 placeholder-slate-400 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Netflix Inc., Spotify AB, Adobe..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 placeholder-slate-400 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Description du service..."
              rows={3}
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Montant *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 placeholder-slate-400 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="9.99"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Devise
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Billing Cycle and Next Renewal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Cycle de facturation *
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as BillingCycle })}
                className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                {BILLING_CYCLES.map(cycle => (
                  <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Prochain renouvellement *
              </label>
              <input
                type="date"
                value={formData.next_renewal_date}
                onChange={(e) => setFormData({ ...formData, next_renewal_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Category and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border transition-colors bg-[#11151D] text-slate-100 border-[#1C2230] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Couleur
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-white' : 'border-[#1C2230]'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[#1C2230] px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg transition-colors border-[#1C2230] text-slate-200 hover:bg-[#0E121A]"
          >
            Annuler
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.amount || !formData.next_renewal_date}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subscription ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Subscription Preview Modal Component
const SubscriptionPreview: React.FC<{
  subscription: Subscription;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}> = ({ subscription, onClose, onEdit, onDelete, onToggle }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatBillingCycle = (cycle: string) => {
    const cycleMap: Record<string, string> = {
      monthly: 'Monthly',
      yearly: 'Yearly',
      weekly: 'Weekly',
      quarterly: 'Quarterly',
      one_time: 'One-time',
    };
    return cycleMap[cycle] || cycle;
  };

  const getCategoryDisplay = (category: string | null) => {
    if (!category) return 'Not specified';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getDaysUntilRenewal = () => {
    const renewalDate = new Date(subscription.next_renewal_date);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilRenewal = getDaysUntilRenewal();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#11151D] text-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#1C2230]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1C2230]">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: subscription.color || '#8b5cf6' }}
            >
              <CreditCard className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{subscription.name}</h2>
              <p className="text-slate-400 text-sm">{subscription.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${subscription.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-sm font-medium ${subscription.is_active ? 'text-green-400' : 'text-red-400'}`}>
              {subscription.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {subscription.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
              <p className="text-slate-400 text-sm">{subscription.description}</p>
            </div>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Montant</h3>
              <p className="text-xl font-bold">{formatCurrency(subscription.amount, subscription.currency)}</p>
              <p className="text-xs text-slate-400">{formatBillingCycle(subscription.billing_cycle)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Prochain renouvellement</h3>
              <p className="text-lg font-semibold">{formatDateSafe(subscription.next_renewal_date)}</p>
              <p className="text-xs text-slate-400">
                {daysUntilRenewal > 0 ? `${daysUntilRenewal} jours restants` : 'Expiré'}
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Catégorie</h3>
            <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
              {getCategoryDisplay(subscription.category)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-[#1C2230]">
          <div className="flex gap-2">
            <button
              onClick={onToggle}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                subscription.is_active
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
              }`}
            >
              {subscription.is_active ? (
                <>
                  <XCircle size={16} className="mr-2 inline" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2 inline" />
                  Activer
                </>
              )}
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
            >
              <Edit2 size={16} className="mr-2 inline" />
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm border rounded-lg transition-colors border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <Trash2 size={16} className="mr-2 inline" />
              Supprimer
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm border rounded-lg transition-colors border-[#1C2230] text-slate-200 hover:bg-[#0E121A]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionManager: React.FC = () => {
  const { subscriptions, loading, createSubscription, updateSubscription, deleteSubscription, toggleSubscription } = useSubscriptions();
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleCreate = async (data: CreateSubscriptionData) => {
    try {
      await createSubscription(data);
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error; // Re-throw pour que le formulaire puisse gérer l'erreur
    }
  };

  const handleUpdate = async (data: CreateSubscriptionData) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, data);
      setEditingSubscription(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
      setShowActions(null);
    }
  };

  const handleToggle = async (id: string) => {
    await toggleSubscription(id);
    setShowActions(null);
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setViewingSubscription(subscription);
    setShowActions(null);
  };

  const handleEditFromPreview = () => {
    if (viewingSubscription) {
      setEditingSubscription(viewingSubscription);
      setViewingSubscription(null);
    }
  };

  const handleDeleteFromPreview = () => {
    if (viewingSubscription) {
      handleDelete(viewingSubscription.id);
      setViewingSubscription(null);
    }
  };

  const handleToggleFromPreview = () => {
    if (viewingSubscription) {
      handleToggle(viewingSubscription.id);
      setViewingSubscription(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatBillingCycle = (cycle: string) => {
    const cycleMap: Record<string, string> = {
      monthly: 'Monthly',
      yearly: 'Yearly',
      weekly: 'Weekly',
      quarterly: 'Quarterly',
      one_time: 'One-time',
    };
    return cycleMap[cycle] || cycle;
  };

  if (loading) {
    return (
      <div className="bg-[#0E121A] rounded-xl p-6 border border-[#1C2230]">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          <p className="ml-4 text-slate-400">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0E121A] rounded-xl p-6 border border-[#1C2230]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 grid place-items-center">
            <CreditCard className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Subscription Management</h2>
            <p className="text-sm text-slate-400">Track your subscriptions and renewals</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus size={16} className="mr-2" />
          New Subscription
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No subscriptions</h3>
          <p className="text-slate-500 mb-4">Start by adding your first subscription</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus size={16} className="mr-2" />
            Add Subscription
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="relative bg-[#121722] rounded-lg p-4 border border-[#1C2230] hover:border-[#2A3441] transition-colors cursor-pointer group"
              style={{ borderLeft: `4px solid ${subscription.color || '#8b5cf6'}` }}
              onClick={() => handleViewSubscription(subscription)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{subscription.name}</h3>
                  {subscription.provider && (
                    <p className="text-sm text-slate-400 truncate">{subscription.provider}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === subscription.id ? null : subscription.id);
                    }}
                    className="p-1 hover:bg-[#1C2230] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={16} className="text-slate-400" />
                  </button>
                  {subscription.is_active ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>

              {subscription.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{subscription.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Amount</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Cycle</span>
                  <span className="text-sm text-slate-300">
                    {formatBillingCycle(subscription.billing_cycle)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Next renewal</span>
                  <span className="text-sm text-slate-300">
                    {formatDateSafe(subscription.next_renewal_date)}
                  </span>
                </div>
              </div>

              {showActions === subscription.id && (
                <div className="absolute top-2 right-2 bg-[#0E121A] border border-[#1C2230] rounded-lg p-2 shadow-lg z-10">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSubscription(subscription);
                        setShowActions(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-[#121722] rounded"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(subscription.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-[#121722] rounded"
                    >
                      {subscription.is_active ? (
                        <>
                          <XCircle size={14} />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(subscription.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#121722] rounded"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Click indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs text-slate-500 bg-[#0E121A] px-2 py-1 rounded">
                  Click to view
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SubscriptionForm
          subscription={null}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingSubscription && (
        <SubscriptionForm
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSubmit={handleUpdate}
        />
      )}

      {viewingSubscription && (
        <SubscriptionPreview
          subscription={viewingSubscription}
          onClose={() => setViewingSubscription(null)}
          onEdit={handleEditFromPreview}
          onDelete={handleDeleteFromPreview}
          onToggle={handleToggleFromPreview}
        />
      )}
    </div>
  );
};

export default SubscriptionManager;
