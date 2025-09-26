import React from 'react';
import { X, User, Mail, Phone, MapPin, Building, Calendar, Edit, Globe, MessageSquare, Tag } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  platform: string;
  company_name?: string | null;
  client_type?: string | null;
  email_primary?: string | null;
  email_secondary?: string | null;
  phone_primary?: string | null;
  phone_whatsapp?: string | null;
  timezone?: string | null;
  preferred_language?: string | null;
  country?: string | null;
  city?: string | null;
  industry?: string | null;
  services_needed?: string[] | null;
  budget_range?: string | null;
  collaboration_frequency?: string | null;
  acquisition_source?: string | null;
  client_status?: string | null;
  priority_level?: string | null;
  payment_terms?: string | null;
  preferred_contact_method?: string | null;
  availability_notes?: string | null;
  important_notes?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  tags?: string[] | null;
  created_at: string;
}

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, isOpen, onClose, onEdit }) => {
  if (!isOpen || !client) return null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-blue-900/30 text-blue-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-blue-900/30 text-blue-300';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {getInitials(client.name)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              {client.company_name && (
                <p className="text-gray-600">{client.company_name}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {client.platform}
                </span>
                {client.client_status && (
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.client_status)}`}>
                    {client.client_status === 'active' ? 'Actif' :
                     client.client_status === 'prospect' ? 'Prospect' :
                     client.client_status === 'inactive' ? 'Inactif' :
                     client.client_status === 'completed' ? 'Terminé' : client.client_status}
                  </span>
                )}
                {client.priority_level && (
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority_level)}`}>
                    Priorité {client.priority_level === 'high' ? 'Haute' : 
                              client.priority_level === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(client)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={16} className="mr-2" />
              Modifier
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations de contact */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="mr-2 text-blue-600" size={20} />
                  Contact
                </h3>
                <div className="space-y-3">
                  {client.email_primary && (
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.email_primary}</p>
                        <p className="text-xs text-gray-500">Email principal</p>
                      </div>
                    </div>
                  )}
                  {client.email_secondary && (
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.email_secondary}</p>
                        <p className="text-xs text-gray-500">Email secondaire</p>
                      </div>
                    </div>
                  )}
                  {client.phone_primary && (
                    <div className="flex items-center space-x-3">
                      <Phone size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.phone_primary}</p>
                        <p className="text-xs text-gray-500">Téléphone principal</p>
                      </div>
                    </div>
                  )}
                  {client.phone_whatsapp && (
                    <div className="flex items-center space-x-3">
                      <MessageSquare size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.phone_whatsapp}</p>
                        <p className="text-xs text-gray-500">WhatsApp</p>
                      </div>
                    </div>
                  )}
                  {client.preferred_contact_method && (
                    <div className="flex items-center space-x-3">
                      <MessageSquare size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {client.preferred_contact_method === 'email' ? 'Email' :
                           client.preferred_contact_method === 'phone' ? 'Téléphone' :
                           client.preferred_contact_method === 'whatsapp' ? 'WhatsApp' :
                           client.preferred_contact_method === 'platform' ? 'Plateforme' : client.preferred_contact_method}
                        </p>
                        <p className="text-xs text-gray-500">Méthode préférée</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Localisation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2 text-blue-600" size={20} />
                  Localisation
                </h3>
                <div className="space-y-3">
                  {(client.country || client.city) && (
                    <div className="flex items-center space-x-3">
                      <Globe size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {[client.city, client.country].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">Localisation</p>
                      </div>
                    </div>
                  )}
                  {client.timezone && (
                    <div className="flex items-center space-x-3">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.timezone}</p>
                        <p className="text-xs text-gray-500">Fuseau horaire</p>
                      </div>
                    </div>
                  )}
                  {client.preferred_language && (
                    <div className="flex items-center space-x-3">
                      <Globe size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.preferred_language}</p>
                        <p className="text-xs text-gray-500">Langue préférée</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations business */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="mr-2 text-blue-600" size={20} />
                  Activité
                </h3>
                <div className="space-y-3">
                  {client.client_type && (
                    <div>
                      <p className="text-xs text-gray-500">Type de client</p>
                      <p className="text-sm font-medium text-gray-900">
                        {client.client_type === 'individual' ? 'Particulier' :
                         client.client_type === 'company' ? 'Entreprise' :
                         client.client_type === 'freelance' ? 'Freelance' : client.client_type}
                      </p>
                    </div>
                  )}
                  {client.industry && (
                    <div>
                      <p className="text-xs text-gray-500">Secteur d'activité</p>
                      <p className="text-sm font-medium text-gray-900">{client.industry}</p>
                    </div>
                  )}
                  {client.budget_range && (
                    <div>
                      <p className="text-xs text-gray-500">Budget moyen</p>
                      <p className="text-sm font-medium text-gray-900">{client.budget_range}</p>
                    </div>
                  )}
                  {client.collaboration_frequency && (
                    <div>
                      <p className="text-xs text-gray-500">Fréquence de collaboration</p>
                      <p className="text-sm font-medium text-gray-900">
                        {client.collaboration_frequency === 'one-time' ? 'Ponctuel' :
                         client.collaboration_frequency === 'occasional' ? 'Occasionnel' :
                         client.collaboration_frequency === 'regular' ? 'Régulier' :
                         client.collaboration_frequency === 'ongoing' ? 'Continu' : client.collaboration_frequency}
                      </p>
                    </div>
                  )}
                  {client.services_needed && client.services_needed.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Services demandés</p>
                      <div className="flex flex-wrap gap-1">
                        {client.services_needed.map((service, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gestion */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  Gestion
                </h3>
                <div className="space-y-3">
                  {client.acquisition_source && (
                    <div>
                      <p className="text-xs text-gray-500">Source d'acquisition</p>
                      <p className="text-sm font-medium text-gray-900">{client.acquisition_source}</p>
                    </div>
                  )}
                  {client.payment_terms && (
                    <div>
                      <p className="text-xs text-gray-500">Conditions de paiement</p>
                      <p className="text-sm font-medium text-gray-900">{client.payment_terms}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Créé le</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(client.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suivi et notes */}
          <div className="mt-8 space-y-6">
            {client.next_action && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Prochaine action</h4>
                <p className="text-sm text-blue-200">{client.next_action}</p>
                {client.next_action_date && (
                  <p className="text-xs text-blue-400 mt-1">
                    Prévu pour le {formatDate(client.next_action_date)}
                  </p>
                )}
              </div>
            )}

            {client.availability_notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes de disponibilité</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{client.availability_notes}</p>
              </div>
            )}

            {client.important_notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes importantes</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{client.important_notes}</p>
              </div>
            )}

            {client.tags && client.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Tag className="mr-2" size={16} />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;