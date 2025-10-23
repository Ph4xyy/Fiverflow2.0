import React, { useState } from 'react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useCurrency } from '../contexts/CurrencyContext';
import ClientForm from '../components/ClientForm';
import OrderForm from '../components/OrderForm';
import { 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

const DashboardExample: React.FC = () => {
  const { stats, loading, error, refetch } = useDashboardStats();
  const { currency } = useCurrency();
  
  // États pour les modales
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  // Fonctions de gestion des actions
  const handleAddClient = () => {
    setIsClientFormOpen(true);
  };

  const handleCreateOrder = () => {
    setIsOrderFormOpen(true);
  };

  const handleScheduleMeeting = () => {
    // Rediriger vers la page de calendrier ou ouvrir une modale de planification
    window.location.href = '/calendar';
  };

  const handleCreateInvoice = () => {
    // Rediriger vers la page de facturation
    window.location.href = '/invoices';
  };

  const handleFormSuccess = () => {
    setIsClientFormOpen(false);
    setIsOrderFormOpen(false);
    refetch(); // Rafraîchir les statistiques
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="ml-3 text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 font-semibold">Error loading dashboard</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <ModernButton onClick={refetch} className="mt-4">
          <RefreshCw className="mr-2" size={16} />
          Retry
        </ModernButton>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to your professional dashboard</p>
        </div>
        <div className="flex gap-3">
          <ModernButton onClick={refetch} size="sm">
            <RefreshCw className="mr-2" size={16} />
            Refresh
          </ModernButton>
          <div className="relative group">
            <ModernButton size="sm">
              Quick Actions
            </ModernButton>
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e2938] border border-[#35414e] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button 
                  onClick={handleAddClient}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                >
                  <Users size={16} />
                  Add Client
                </button>
                <button 
                  onClick={handleCreateOrder}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                >
                  <Package size={16} />
                  Create Order
                </button>
                <button 
                  onClick={handleScheduleMeeting}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Schedule Meeting
                </button>
                <button 
                  onClick={handleCreateInvoice}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2"
                >
                  <DollarSign size={16} />
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernCard 
          title="Total Clients"
        >
          <div className="relative">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalClients.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${
              stats.clientsGrowth >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp size={16} className="mr-1" />
              {stats.clientsGrowth >= 0 ? '+' : ''}{stats.clientsGrowth}% this month
            </div>
            <div className="absolute top-0 right-0 opacity-50">
              <Users size={20} className="text-gray-400" />
            </div>
          </div>
        </ModernCard>

        <ModernCard 
          title="Orders"
        >
          <div className="relative">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalOrders.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${
              stats.ordersGrowth >= 0 ? 'text-blue-400' : 'text-red-400'
            }`}>
              <Activity size={16} className="mr-1" />
              {stats.ordersGrowth >= 0 ? '+' : ''}{stats.ordersGrowth}% this month
            </div>
            <div className="absolute top-0 right-0 opacity-50">
              <Package size={20} className="text-gray-400" />
            </div>
          </div>
        </ModernCard>

        <ModernCard 
          title="Revenue"
        >
          <div className="relative">
            <div className="text-3xl font-bold text-white mb-2">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(stats.totalRevenue)}
            </div>
            <div className={`flex items-center text-sm ${
              stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp size={16} className="mr-1" />
              {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% this month
            </div>
            <div className="absolute top-0 right-0 opacity-50">
              <DollarSign size={20} className="text-gray-400" />
            </div>
          </div>
        </ModernCard>

        <ModernCard 
          title="Completion Rate"
        >
          <div className="relative">
            <div className="text-3xl font-bold text-white mb-2">{stats.completionRate}%</div>
            <div className="flex items-center text-purple-400 text-sm">
              <Calendar size={16} className="mr-1" />
              Avg. {stats.averageDeliveryTime.toFixed(1)} days
            </div>
            <div className="absolute top-0 right-0 opacity-50">
              <Activity size={20} className="text-gray-400" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard 
          title="Monthly Revenue" 
          icon={<BarChart3 size={20} className="text-white" />}
        >
          <div className="h-64 flex items-center justify-center">
            <div className="w-full">
              <div className="grid grid-cols-6 gap-3 h-full">
                {stats.monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                  const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                  const isHighest = month.revenue === maxRevenue;
                  return (
                    <div key={index} className="flex flex-col justify-end group">
                      <div className="relative">
                        <div 
                          className={`rounded-t-lg transition-all duration-300 group-hover:scale-105 ${
                            isHighest 
                              ? 'bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 shadow-lg shadow-emerald-500/25' 
                              : 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300'
                          }`}
                          style={{ height: `${Math.max(height, 8)}%` }}
                        />
                        {isHighest && (
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-2 text-center font-medium">{month.month}</div>
                      <div className={`text-xs text-center font-semibold transition-colors ${
                        isHighest ? 'text-emerald-400' : 'text-gray-500'
                      }`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(month.revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModernCard>

        <ModernCard 
          title="Orders by Status" 
          icon={<PieChart size={20} className="text-white" />}
        >
          <div className="h-64 flex items-center justify-center">
            <div className="w-full">
              <div className="space-y-4">
                {stats.ordersByStatus.map((status, index) => {
                  const colors = [
                    { bg: 'bg-blue-500', ring: 'ring-blue-500/20', text: 'text-blue-400' },
                    { bg: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-400' },
                    { bg: 'bg-amber-500', ring: 'ring-amber-500/20', text: 'text-amber-400' },
                    { bg: 'bg-rose-500', ring: 'ring-rose-500/20', text: 'text-rose-400' },
                    { bg: 'bg-purple-500', ring: 'ring-purple-500/20', text: 'text-purple-400' }
                  ];
                  const colorSet = colors[index % colors.length];
                  const total = stats.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? Math.round((status.count / total) * 100) : 0;
                  const isHighest = status.count === Math.max(...stats.ordersByStatus.map(s => s.count));
                  
                  return (
                    <div key={index} className={`group relative p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
                      isHighest 
                        ? `${colorSet.ring} bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600` 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${colorSet.bg} shadow-lg ${
                            isHighest ? 'animate-pulse' : ''
                          }`} />
                          <span className={`text-sm font-medium capitalize ${
                            isHighest ? colorSet.text : 'text-gray-300'
                          }`}>
                            {status.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-white">
                            {status.count}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            isHighest 
                              ? `${colorSet.bg} text-white` 
                              : 'bg-slate-700 text-gray-300'
                          }`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>
                      {isHighest && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Recent Activity & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard 
          title="Recent Orders" 
          icon={<Activity size={20} className="text-white" />}
        >
          <div className="space-y-4">
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent orders</p>
            ) : (
              stats.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'completed' ? 'bg-green-400' :
                    order.status === 'in_progress' ? 'bg-blue-400' :
                    order.status === 'pending' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{order.title}</p>
                    <p className="text-gray-400 text-xs">
                      {order.client_name} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </ModernCard>

        <ModernCard 
          title="Top Clients" 
          icon={<Users size={20} className="text-white" />}
        >
          <div className="space-y-4">
            {stats.topClients.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No client data</p>
            ) : (
              stats.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{client.name}</p>
                      <p className="text-gray-400 text-xs">{client.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(client.revenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModernCard>
      </div>

      {/* Modales */}
      <ClientForm
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default DashboardExample;