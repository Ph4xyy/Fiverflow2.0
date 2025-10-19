import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  CheckCircle2, 
  FileText,
  Download,
  MoreVertical,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdDate: string;
  description: string;
}

const InvoicesPageNew: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-001',
      client: 'Marie Dubois',
      amount: 2500,
      status: 'paid',
      dueDate: '2024-01-15',
      createdDate: '2024-01-01',
      description: 'Développement site web'
    },
    {
      id: '2',
      number: 'INV-002',
      client: 'Pierre Martin',
      amount: 1800,
      status: 'sent',
      dueDate: '2024-01-20',
      createdDate: '2024-01-05',
      description: 'Design UI/UX'
    },
    {
      id: '3',
      number: 'INV-003',
      client: 'Sophie Leroy',
      amount: 3200,
      status: 'overdue',
      dueDate: '2024-01-10',
      createdDate: '2023-12-20',
      description: 'Application mobile'
    },
    {
      id: '4',
      number: 'INV-004',
      client: 'Alexandre Petit',
      amount: 1200,
      status: 'draft',
      dueDate: '2024-02-01',
      createdDate: '2024-01-10',
      description: 'Consultation technique'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'sent':
        return <Send size={16} className="text-blue-500" />;
      case 'overdue':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'draft':
        return <FileText size={16} className="text-gray-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-gray-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'sent':
        return 'Envoyée';
      case 'overdue':
        return 'En retard';
      case 'draft':
        return 'Brouillon';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Factures</h1>
            <p className="text-gray-400">Gérez vos factures et suivez les paiements</p>
          </div>
          
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Exporter
            </ModernButton>
            <ModernButton size="sm">
              <Plus size={16} className="mr-2" />
              Nouvelle facture
            </ModernButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{filteredInvoices.length}</p>
                <p className="text-sm text-gray-400">Total factures</p>
              </div>
              <div className="text-gray-400 opacity-50">
                <FileText size={20} />
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">${totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Montant total</p>
              </div>
              <div className="text-gray-400 opacity-50">
                <DollarSign size={20} />
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">${paidAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Montant payé</p>
              </div>
              <div className="text-gray-400 opacity-50">
                <CheckCircle size={20} />
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">${(totalAmount - paidAmount).toLocaleString()}</p>
                <p className="text-sm text-gray-400">En attente</p>
              </div>
              <div className="text-gray-400 opacity-50">
                <Clock size={20} />
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Filters and Search */}
        <ModernCard>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par client ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulée</option>
              </select>

              <ModernButton variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filtres
              </ModernButton>
            </div>
          </div>
        </ModernCard>

        {/* Invoices Table */}
        <ModernCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#35414e]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    <button
                      onClick={() => {
                        setSortBy('number');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Numéro
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    <button
                      onClick={() => {
                        setSortBy('amount');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Montant
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    <button
                      onClick={() => {
                        setSortBy('dueDate');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Échéance
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-[#35414e] hover:bg-[#35414e]/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{invoice.number}</div>
                      <div className="text-sm text-gray-400">
                        Créée le {new Date(invoice.createdDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{invoice.client}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-300 max-w-xs truncate">{invoice.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">${invoice.amount.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {getStatusText(invoice.status)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-300">
                        {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <ModernButton size="sm" variant="outline">
                          <Eye size={14} />
                        </ModernButton>
                        <ModernButton size="sm" variant="outline">
                          <Edit size={14} />
                        </ModernButton>
                        {invoice.status === 'sent' && (
                          <ModernButton size="sm" variant="outline">
                            <Send size={14} />
                          </ModernButton>
                        )}
                        <ModernButton size="sm" variant="outline">
                          <MoreVertical size={14} />
                        </ModernButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#35414e] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aucune facture trouvée</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter 
                  ? 'Aucune facture ne correspond à vos critères de recherche'
                  : 'Commencez par créer votre première facture'
                }
              </p>
              <ModernButton>
                <Plus size={16} className="mr-2" />
                Créer une facture
              </ModernButton>
            </div>
          )}
        </ModernCard>
      </div>
    </Layout>
  );
};

export default InvoicesPageNew;