import React from 'react';
import { X, Calendar, User, DollarSign, CreditCard, ListChecks, Clock, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { formatDateSafe } from '@/utils/dateUtils';
import OrderDetailModal from './OrderDetailModal';
import ClientViewModal from './ClientViewModal';
import SubscriptionPreviewModal from './SubscriptionPreviewModal';

// Types for different event kinds
type OrderEvent = {
  kind: 'order';
  order: any; // OrderRow type
};

type TaskEvent = {
  kind: 'task';
  task: any; // TaskRow type
};

type SubscriptionEvent = {
  kind: 'subscription';
  subscription: any; // Subscription type
};

type ClientEvent = {
  kind: 'client';
  client: any; // Client type
};

type EventData = OrderEvent | TaskEvent | SubscriptionEvent | ClientEvent;

interface EventPreviewModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: EventData) => void;
}

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({ event, isOpen, onClose, onEdit }) => {
  if (!isOpen || !event) return null;

  // Handle different event types
  if (event.kind === 'order') {
    return (
      <OrderDetailModal
        order={event.order}
        isOpen={isOpen}
        onClose={onClose}
        onEdit={onEdit ? () => onEdit(event) : undefined}
      />
    );
  }

  if (event.kind === 'client') {
    return (
      <ClientViewModal
        client={event.client}
        isOpen={isOpen}
        onClose={onClose}
        onEdit={onEdit ? () => onEdit(event) : undefined}
        loading={false}
      />
    );
  }

  if (event.kind === 'subscription') {
    return (
      <SubscriptionPreviewModal
        subscription={event.subscription}
        isOpen={isOpen}
        onClose={onClose}
        onEdit={onEdit ? () => onEdit(event) : undefined}
        onDelete={undefined}
        onToggle={undefined}
      />
    );
  }

  // Task preview (create inline since there's no existing modal)
  if (event.kind === 'task') {
    const task = event.task;
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
        case 'done':
          return 'text-green-400';
        case 'in_progress':
          return 'text-blue-400';
        case 'blocked':
          return 'text-red-400';
        default:
          return 'text-slate-400';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgent':
          return 'text-red-400 bg-red-900/30';
        case 'high':
          return 'text-orange-400 bg-orange-900/30';
        case 'medium':
          return 'text-yellow-400 bg-yellow-900/30';
        case 'low':
          return 'text-green-400 bg-green-900/30';
        default:
          return 'text-slate-400 bg-slate-900/30';
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl !bg-[#0E121A] !border-[#1C2230] text-white">
          <DialogHeader className="!border-[#1C2230]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <ListChecks className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{task.title}</h2>
                  <p className="text-sm text-slate-400">Task</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <div className={`w-3 h-3 rounded-full ${task.color || '#3b82f6'}`} />
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Priority</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Due Date</h3>
                  <p className="text-lg font-semibold text-white">
                    {task.due_date ? formatDateSafe(task.due_date) : 'No due date'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' || task.status === 'done' ? 'bg-green-400' : 
                      task.status === 'in_progress' ? 'bg-blue-400' : 'bg-slate-400'
                    }`} />
                    <span className={`font-medium ${getStatusColor(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Client</h3>
                  <p className="text-white">{task.client_id ? 'Associated with client' : 'No client assigned'}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-[#1C2230] pt-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Color:</span>
                  <span className="text-white ml-2">
                    {task.color ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: task.color }} />
                        {task.color}
                      </span>
                    ) : 'Default'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Task ID:</span>
                  <span className="text-white ml-2 font-mono text-xs">{task.id}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="!border-[#1C2230]">
            <div className="flex justify-end w-full">
              <Button
                type="button"
                onClick={onClose}
                className="bg-[#121722] text-slate-300 hover:bg-[#1C2230] border border-[#1C2230]"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default EventPreviewModal;
