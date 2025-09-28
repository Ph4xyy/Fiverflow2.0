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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'one_time', label: 'Unique' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.next_renewal_date) {
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0E121A] border-[#1C2230] text-white">
        <DialogHeader>
          <h2 className="text-xl font-semibold text-white">
            {subscription ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
          </h2>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom de l'abonnement *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Netflix, Spotify..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Netflix, Adobe..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Description optionnelle..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Montant *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Devise
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cycle de facturation *
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as BillingCycle })}
                className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {BILLING_CYCLES.map(cycle => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prochaine date de renouvellement *
              </label>
              <input
                type="date"
                value={formData.next_renewal_date}
                onChange={(e) => setFormData({ ...formData, next_renewal_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#121722] border border-[#1C2230] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
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
        </form>

        <DialogFooter>
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#121722] text-slate-300 hover:bg-[#1C2230] border border-[#1C2230]"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.amount || !formData.next_renewal_date}
          >
            {subscription ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SubscriptionManager: React.FC = () => {
  const { subscriptions, loading, createSubscription, updateSubscription, deleteSubscription, toggleSubscription } = useSubscriptions();
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleCreate = async (data: CreateSubscriptionData) => {
    await createSubscription(data);
  };

  const handleUpdate = async (data: CreateSubscriptionData) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, data);
      setEditingSubscription(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      await deleteSubscription(id);
      setShowActions(null);
    }
  };

  const handleToggle = async (id: string) => {
    await toggleSubscription(id);
    setShowActions(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatBillingCycle = (cycle: string) => {
    const cycleMap: Record<string, string> = {
      monthly: 'Mensuel',
      yearly: 'Annuel',
      weekly: 'Hebdomadaire',
      quarterly: 'Trimestriel',
      one_time: 'Unique',
    };
    return cycleMap[cycle] || cycle;
  };

  if (loading) {
    return (
      <div className="bg-[#0E121A] rounded-xl p-6 border border-[#1C2230]">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-4 text-slate-400">Chargement des abonnements...</p>
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
            <h2 className="text-xl font-semibold text-white">Gestion des abonnements</h2>
            <p className="text-sm text-slate-400">Suivez vos abonnements et leurs renouvellements</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus size={16} className="mr-2" />
          Nouvel abonnement
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">Aucun abonnement</h3>
          <p className="text-slate-500 mb-4">Commencez par ajouter votre premier abonnement</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus size={16} className="mr-2" />
            Ajouter un abonnement
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="relative bg-[#121722] rounded-lg p-4 border border-[#1C2230] hover:border-[#2A3441] transition-colors"
              style={{ borderLeft: `4px solid ${subscription.color || '#3b82f6'}` }}
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
                    onClick={() => setShowActions(showActions === subscription.id ? null : subscription.id)}
                    className="p-1 hover:bg-[#1C2230] rounded"
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
                  <span className="text-sm text-slate-400">Montant</span>
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
                  <span className="text-sm text-slate-400">Prochain renouvellement</span>
                  <span className="text-sm text-slate-300">
                    {format(new Date(subscription.next_renewal_date), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>

              {showActions === subscription.id && (
                <div className="absolute top-2 right-2 bg-[#0E121A] border border-[#1C2230] rounded-lg p-2 shadow-lg z-10">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setEditingSubscription(subscription);
                        setShowActions(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-[#121722] rounded"
                    >
                      <Edit2 size={14} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggle(subscription.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-[#121722] rounded"
                    >
                      {subscription.is_active ? (
                        <>
                          <XCircle size={14} />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Activer
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#121722] rounded"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default SubscriptionManager;
