import React from 'react';
import { X, User, Mail, Phone, Globe, Building2, Tags, MessageSquare, Briefcase, CalendarClock, Edit3, Copy, ExternalLink } from 'lucide-react';

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

const ClientViewModal: React.FC<ClientViewModalProps> = ({ isOpen, onClose, client, loading, onEdit }) => {
  if (!isOpen) return null;

  const TagList = (client?.tags ?? []).length ? (
    <div className="flex flex-wrap gap-2">
      {(client?.tags ?? []).map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-[#9c68f2]/20 to-[#422ca5]/20 text-[#9c68f2] border border-[#9c68f2]/30 hover:from-[#9c68f2]/30 hover:to-[#422ca5]/30 transition-all duration-200"
        >
          {t}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-gray-500 dark:text-gray-500 italic">Aucun tag</span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1e2938] border border-[#35414e] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#35414e] bg-gradient-to-r from-[#1e2938] to-[#35414e]/20 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#9c68f2] to-[#422ca5]">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {client?.name || 'Client'}
              </h2>
              {client?.created_at && (
                <p className="text-sm text-gray-400">
                  Créé le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onEdit && client && (
              <button
                onClick={() => onEdit(client)}
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
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c68f2]" />
            <span className="ml-3 text-gray-300">Chargement…</span>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <Section icon={<User className="w-5 h-5 text-[#9c68f2]" />} title="Identité" gradient>
              <Row label="Nom complet" value={client?.name} copyable />
              <Row label="Type de client" value={client?.client_type} />
              <Row label="Entreprise" value={client?.company_name} />
              <Row label="Plateforme" value={client?.platform} />
            </Section>

            <Section icon={<Mail className="w-5 h-5 text-[#9c68f2]" />} title="Contact">
              <Row label="Email principal" value={client?.email_primary} copyable />
              <Row label="Email secondaire" value={client?.email_secondary} copyable />
              <Row label="Téléphone" value={client?.phone_primary} copyable />
              <Row label="WhatsApp" value={client?.phone_whatsapp} copyable />
              <Row label="Méthode de contact préférée" value={client?.preferred_contact_method} />
            </Section>

            <Section icon={<Globe className="w-5 h-5 text-[#9c68f2]" />} title="Localisation">
              <Row label="Pays" value={client?.country} />
              <Row label="Ville" value={client?.city} />
              <Row label="Fuseau horaire" value={client?.timezone} />
              <Row label="Langue préférée" value={client?.preferred_language} />
            </Section>

            <Section icon={<Briefcase className="w-5 h-5 text-[#9c68f2]" />} title="Business" gradient>
              <Row label="Secteur d'activité" value={client?.industry} />
              <Row
                label="Services demandés"
                value={
                  (client?.services_needed?.length
                    ? (client?.services_needed || []).join(', ')
                    : null)
                }
              />
              <Row label="Budget estimé" value={client?.budget_range} />
              <Row label="Fréquence de collaboration" value={client?.collaboration_frequency} />
            </Section>

            <Section icon={<Building2 className="w-5 h-5 text-[#9c68f2]" />} title="Commercial">
              <Row label="Source d'acquisition" value={client?.acquisition_source} />
              <Row label="Statut du client" value={client?.client_status} />
              <Row label="Niveau de priorité" value={client?.priority_level} />
              <Row label="Conditions de paiement" value={client?.payment_terms} />
            </Section>

            <Section icon={<MessageSquare className="w-5 h-5 text-[#9c68f2]" />} title="Notes & Observations">
              <Row label="Disponibilités" value={client?.availability_notes} />
              <Row label="Notes importantes" value={client?.important_notes} />
            </Section>

            <Section icon={<CalendarClock className="w-5 h-5 text-[#9c68f2]" />} title="Suivi & Actions" gradient>
              <Row label="Prochaine action" value={client?.next_action} />
              <Row
                label="Date de la prochaine action"
                value={
                  client?.next_action_date
                    ? new Date(client.next_action_date).toLocaleDateString('fr-FR')
                    : null
                }
              />
            </Section>

            <Section icon={<Tags className="w-5 h-5 text-[#9c68f2]" />} title="Tags & Catégories">
              <div className="py-2">{TagList}</div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientViewModal;
