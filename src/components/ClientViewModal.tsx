import React from 'react';
import { X, User, Mail, Phone, Globe, Building2, Tags, MessageSquare, Briefcase, CalendarClock } from 'lucide-react';

export type FullClient = {
  id: string;
  name: string;
  platform: string;
  // Identité & entreprise
  company_name?: string | null;
  client_type?: string | null;

  // Contact
  email_primary?: string | null;
  email_secondary?: string | null;
  phone_primary?: string | null;
  phone_whatsapp?: string | null;
  preferred_contact_method?: string | null;

  // Localisation
  timezone?: string | null;
  preferred_language?: string | null;
  country?: string | null;
  city?: string | null;

  // Business
  industry?: string | null;
  services_needed?: string[] | null;
  budget_range?: string | null;
  collaboration_frequency?: string | null;

  // Commercial
  acquisition_source?: string | null;
  client_status?: string | null;
  priority_level?: string | null;
  payment_terms?: string | null;

  // Notes & suivi
  availability_notes?: string | null;
  important_notes?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;

  // Divers
  tags?: string[] | null;
  created_at?: string | null;
};

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: FullClient | null;
  loading?: boolean;
  onEdit?: (client: FullClient) => void;
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

const ClientViewModal: React.FC<ClientViewModalProps> = ({ isOpen, onClose, client, loading, onEdit }) => {
  if (!isOpen) return null;

  const TagList = (client?.tags ?? []).length ? (
    <div className="flex flex-wrap gap-2">
      {(client?.tags ?? []).map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
        >
          {t}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-gray-400 dark:text-gray-500">—</span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {client?.name || 'Client'}
            </h2>
            {client?.created_at && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Créé le {new Date(client.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && client && (
              <button
                onClick={() => onEdit(client)}
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

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement…</span>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <Section icon={<User className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Identité">
              <Row label="Nom" value={client?.name} />
              <Row label="Type de client" value={client?.client_type ?? '—'} />
              <Row label="Entreprise" value={client?.company_name ?? '—'} />
              <Row label="Plateforme" value={client?.platform ?? '—'} />
            </Section>

            <Section icon={<Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Contact">
              <Row label="Email principal" value={client?.email_primary ?? '—'} />
              <Row label="Email secondaire" value={client?.email_secondary ?? '—'} />
              <Row label="Téléphone" value={client?.phone_primary ?? '—'} />
              <Row label="WhatsApp" value={client?.phone_whatsapp ?? '—'} />
              <Row label="Méthode de contact" value={client?.preferred_contact_method ?? '—'} />
            </Section>

            <Section icon={<Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Localisation">
              <Row label="Pays" value={client?.country ?? '—'} />
              <Row label="Ville" value={client?.city ?? '—'} />
              <Row label="Fuseau horaire" value={client?.timezone ?? '—'} />
              <Row label="Langue" value={client?.preferred_language ?? '—'} />
            </Section>

            <Section icon={<Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Business">
              <Row label="Secteur" value={client?.industry ?? '—'} />
              <Row
                label="Services demandés"
                value={
                  (client?.services_needed?.length
                    ? (client?.services_needed || []).join(', ')
                    : '—')
                }
              />
              <Row label="Budget" value={client?.budget_range ?? '—'} />
              <Row label="Fréquence de collaboration" value={client?.collaboration_frequency ?? '—'} />
            </Section>

            <Section icon={<Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Commercial">
              <Row label="Source d'acquisition" value={client?.acquisition_source ?? '—'} />
              <Row label="Statut" value={client?.client_status ?? '—'} />
              <Row label="Priorité" value={client?.priority_level ?? '—'} />
              <Row label="Conditions de paiement" value={client?.payment_terms ?? '—'} />
            </Section>

            <Section icon={<MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Notes">
              <Row label="Disponibilités" value={client?.availability_notes ?? '—'} />
              <Row label="Notes importantes" value={client?.important_notes ?? '—'} />
            </Section>

            <Section icon={<CalendarClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Suivi">
              <Row label="Prochaine action" value={client?.next_action ?? '—'} />
              <Row
                label="Date de la prochaine action"
                value={
                  client?.next_action_date
                    ? new Date(client.next_action_date).toLocaleDateString()
                    : '—'
                }
              />
            </Section>

            <Section icon={<Tags className="w-4 h-4 text-gray-500 dark:text-gray-400" />} title="Tags">
              <div className="py-2">{TagList}</div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientViewModal;
