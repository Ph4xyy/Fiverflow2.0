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
      <DialogContent className="max-w-4xl bg-gradient-to-br from-[#0E121A] to-[#1a1f2e] border-[#1C2230] text-white overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-50"></div>
          
          <DialogHeader className="relative z-10 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 grid place-items-center">
                <CreditCard className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {subscription ? 'Edit Subscription' : 'Add New Subscription'}
                </h2>
                <p className="text-gray-400 mt-1">
                  {subscription ? 'Update your subscription details' : 'Track your recurring subscriptions'}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            {/* Service Information */}
            <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Service Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="text-purple-400">*</span>
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    placeholder="Netflix, Spotify, Adobe Creative Cloud..."
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="text-purple-400">*</span>
                    Provider
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    placeholder="Netflix Inc., Spotify AB, Adobe..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                  placeholder="Brief description of what this subscription includes..."
                  rows={3}
                />
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                Billing Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="text-purple-400">*</span>
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      placeholder="9.99"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="text-purple-400">*</span>
                    Billing Cycle
                  </label>
                  <select
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as BillingCycle })}
                    className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    required
                  >
                    {BILLING_CYCLES.map(cycle => (
                      <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="text-purple-400">*</span>
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_renewal_date}
                    onChange={(e) => setFormData({ ...formData, next_renewal_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0E121A]/80 border border-[#2a3441] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customization */}
            <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Customization
              </h3>
              
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300">Choose a color theme</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        formData.color === color ? 'border-white shadow-lg shadow-white/20' : 'border-gray-500 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                onClick={onClose}
                className="bg-[#1a1f2e]/50 border-[#2a3441] text-gray-300 hover:bg-[#2a3441] hover:text-white px-6 py-3 rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.amount || !formData.next_renewal_date}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                {subscription ? 'Update Subscription' : 'Create Subscription'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-400' : 'text-red-400';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-[#0E121A] to-[#1a1f2e] border-[#1C2230] text-white overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-50"></div>
          
          <DialogHeader className="relative z-10 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: subscription.color || '#8b5cf6' }}
                >
                  <CreditCard className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{subscription.name}</h2>
                  {subscription.provider && (
                    <p className="text-gray-400 mt-1">{subscription.provider}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${subscription.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {getStatusText(subscription.is_active)}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-1 rounded-full bg-gray-500/20">
                      {getCategoryDisplay(subscription.category)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        
          <div className="relative z-10 space-y-8">
            {/* Description */}
            {subscription.description && (
              <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">{subscription.description}</p>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Billing Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Amount</h4>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatBillingCycle(subscription.billing_cycle)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Next Renewal</h4>
                    <p className="text-xl font-semibold text-white">
                      {formatDateSafe(subscription.next_renewal_date)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {Math.ceil((new Date(subscription.next_renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  Subscription Info
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Category</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300">
                      {getCategoryDisplay(subscription.category)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Status</h4>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${subscription.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className={`font-semibold ${getStatusColor(subscription.is_active)}`}>
                        {getStatusText(subscription.is_active)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Provider</h4>
                    <p className="text-white font-medium">{subscription.provider}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#1a1f2e]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2a3441]/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Created</h4>
                  <p className="text-white">
                    {subscription.created_at ? formatDateSafe(subscription.created_at.split('T')[0]) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Last Updated</h4>
                  <p className="text-white">
                    {subscription.updated_at ? formatDateSafe(subscription.updated_at.split('T')[0]) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

            <DialogFooter className="flex justify-between w-full pt-8">
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onToggle}
                  className={`${
                    subscription.is_active
                      ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 px-6 py-3 rounded-xl transition-all duration-200'
                      : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 px-6 py-3 rounded-xl transition-all duration-200'
                  }`}
                >
                  {subscription.is_active ? (
                    <>
                      <XCircle size={18} className="mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} className="mr-2" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onEdit}
                  className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 px-6 py-3 rounded-xl transition-all duration-200"
                >
                  <Edit2 size={18} className="mr-2" />
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={onDelete}
                  className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 px-6 py-3 rounded-xl transition-all duration-200"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30 px-6 py-3 rounded-xl transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SubscriptionManager: React.FC = () => {
  const { subscriptions, loading, createSubscription, updateSubscription, deleteSubscription, toggleSubscription } = useSubscriptions();
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null);
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
