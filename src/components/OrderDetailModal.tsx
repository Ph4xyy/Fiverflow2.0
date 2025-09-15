// src/components/OrderDetailModal.tsx
import React from 'react';
import {
  X, FileText, User, DollarSign, Calendar, Tags as TagsIcon,
  ClipboardList, Building2
} from 'lucide-react';

type OrderDetailClient = {
  name: string;
  platform?: string | null;
};

export type OrderDetail = {
  id: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  deadline?: string | null;
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
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words sm:ml-6">
      {value ?? <span className="text-gray-400 dark:text-gray-500">—</span>}
    </div>
  </div>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-800">{children}</div>
  </div>
);

const badgeForStatus = (status?: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';
  }
};

const chipForPlatform = (p?: string | null) =>
  p
    ? {
        Fiverr: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        Upwork: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
        Direct: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      }[p] || 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onEdit }) => {
  if (!isOpen) return null;

  const clientName = order?.clients?.name || order?.client_name || '—';
  const platform = order?.clients?.platform ?? order?.platform ?? null;

  const tags = order?.tags ?? [];
  const TagList = tags.length ? (
    <div className="flex flex-wrap gap-2">
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
        >
          {t}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-gray-400 dark:text-gray-500">—</span>
  );

  const computedTotal =
    (order?.estimated_hours ? Number(order.estimated_hours) : 0) *
    (order?.hourly_rate ? Number(order.hourly_rate) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {order?.title || 'Order'}
            </h2>
            {order?.created_at && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Créée le {new Date(order.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && order && (
              <button
                onClick={() => onEdit(order)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Modifier
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Section icon={<FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Order">
            <Row label="Titre" value={order?.title} />
            <Row label="Type de projet" value={order?.project_type ?? '—'} />
            <Row
              label="Statut"
              value={
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badgeForStatus(order?.status)}`}>
                  {order?.status || '—'}
                </span>
              }
            />
            <Row label="Priorité" value={order?.priority_level ?? '—'} />
            <Row label="Description" value={order?.description || '—'} />
          </Section>

          <Section icon={<User className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Client">
            <Row label="Nom" value={clientName} />
            <Row
              label="Plateforme"
              value={
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${chipForPlatform(platform)}`}>
                  {platform || '—'}
                </span>
              }
            />
          </Section>

          <Section icon={<DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Finance">
            <Row label="Montant" value={typeof order?.amount === 'number' ? `$${order.amount.toLocaleString()}` : '—'} />
            <Row label="Statut de paiement" value={order?.payment_status ?? '—'} />
            <Row label="Heures estimées" value={order?.estimated_hours ?? '—'} />
            <Row label="Taux horaire" value={order?.hourly_rate ? `$${Number(order.hourly_rate).toFixed(2)}` : '—'} />
            <Row label="Total calculé" value={computedTotal ? `$${computedTotal.toFixed(2)}` : '—'} />
          </Section>

          <Section icon={<Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Timeline & Management">
            <Row label="Date de début" value={order?.start_date ? new Date(order.start_date).toLocaleDateString() : '—'} />
            <Row label="Échéance" value={order?.deadline ? new Date(order.deadline).toLocaleDateString() : '—'} />
            <Row label="Date de complétion" value={order?.completion_date ? new Date(order.completion_date).toLocaleDateString() : '—'} />
            <Row label="Révisions" value={order?.revision_count ?? 0} />
          </Section>

          <Section icon={<ClipboardList className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Notes">
            <Row label="Notes internes" value={order?.notes ?? '—'} />
            <Row label="Feedback client" value={order?.client_feedback ?? '—'} />
          </Section>

          <Section icon={<TagsIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Tags">
            <div className="py-2">
              {TagList}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
