import React from 'react';
import { CreditCard, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { formatDateSafe } from '@/utils/dateUtils';
import { Subscription } from '@/types/subscription';

interface SubscriptionPreviewModalProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

const SubscriptionPreviewModal: React.FC<SubscriptionPreviewModalProps> = ({ 
  subscription, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggle 
}) => {
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl !bg-[#0E121A] !border-[#1C2230] text-white">
        <DialogHeader className="!border-[#1C2230]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: subscription.color || '#8b5cf6' }}
              >
                <CreditCard className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{subscription.name}</h2>
                {subscription.provider && (
                  <p className="text-sm text-slate-400">{subscription.provider}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getStatusColor(subscription.is_active)}`}>
                {getStatusText(subscription.is_active)}
              </span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subscription.color || '#8b5cf6' }} />
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Description */}
          {subscription.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
              <p className="text-slate-400">{subscription.description}</p>
            </div>
          )}

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Amount</h3>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </p>
                <p className="text-sm text-slate-400">
                  {formatBillingCycle(subscription.billing_cycle)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Next Renewal</h3>
                <p className="text-lg font-semibold text-white">
                  {formatDateSafe(subscription.next_renewal_date)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Category</h3>
                <p className="text-white">{getCategoryDisplay(subscription.category)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Status</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscription.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`font-medium ${getStatusColor(subscription.is_active)}`}>
                    {getStatusText(subscription.is_active)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-[#1C2230] pt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Created:</span>
                <span className="text-white ml-2">
                  {subscription.created_at ? formatDateSafe(subscription.created_at.split('T')[0]) : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Last Updated:</span>
                <span className="text-white ml-2">
                  {subscription.updated_at ? formatDateSafe(subscription.updated_at.split('T')[0]) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="!border-[#1C2230]">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {onToggle && (
                <Button
                  type="button"
                  onClick={onToggle}
                  className={`${subscription.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {subscription.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={onClose}
                className="bg-[#121722] text-slate-300 hover:bg-[#1C2230] border border-[#1C2230]"
              >
                Close
              </Button>
              {onEdit && (
                <Button
                  type="button"
                  onClick={onEdit}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPreviewModal;











