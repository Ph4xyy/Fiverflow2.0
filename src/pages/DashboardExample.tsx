import React from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

const DashboardExample: React.FC = () => {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Bienvenue sur votre tableau de bord professionnel</p>
          </div>
          <div className="flex gap-3">
            <ModernButton variant="outline" size="sm">
              Exporter
            </ModernButton>
            <ModernButton size="sm">
              Nouveau
            </ModernButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard 
            title="Total Clients" 
            icon={<Users size={20} className="text-white" />}
          >
            <div className="text-3xl font-bold text-white mb-2">1,234</div>
            <div className="flex items-center text-green-400 text-sm">
              <TrendingUp size={16} className="mr-1" />
              +12% ce mois
            </div>
          </ModernCard>

          <ModernCard 
            title="Commandes" 
            icon={<Package size={20} className="text-white" />}
          >
            <div className="text-3xl font-bold text-white mb-2">89</div>
            <div className="flex items-center text-blue-400 text-sm">
              <Activity size={16} className="mr-1" />
              +5% cette semaine
            </div>
          </ModernCard>

          <ModernCard 
            title="Revenus" 
            icon={<DollarSign size={20} className="text-white" />}
          >
            <div className="text-3xl font-bold text-white mb-2">€12,456</div>
            <div className="flex items-center text-green-400 text-sm">
              <TrendingUp size={16} className="mr-1" />
              +8% ce mois
            </div>
          </ModernCard>

          <ModernCard 
            title="Événements" 
            icon={<Calendar size={20} className="text-white" />}
          >
            <div className="text-3xl font-bold text-white mb-2">24</div>
            <div className="flex items-center text-purple-400 text-sm">
              <Calendar size={16} className="mr-1" />
              Cette semaine
            </div>
          </ModernCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard 
            title="Ventes Mensuelles" 
            icon={<BarChart3 size={20} className="text-white" />}
          >
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Graphique des ventes</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard 
            title="Répartition des Clients" 
            icon={<PieChart size={20} className="text-white" />}
          >
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <PieChart size={48} className="mx-auto mb-4 opacity-50" />
                <p>Graphique en secteurs</p>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Recent Activity */}
        <ModernCard 
          title="Activité Récente" 
          icon={<Activity size={20} className="text-white" />}
        >
          <div className="space-y-4">
            {[
              { action: "Nouveau client ajouté", time: "Il y a 2 heures", type: "client" },
              { action: "Commande #1234 confirmée", time: "Il y a 4 heures", type: "order" },
              { action: "Paiement reçu", time: "Il y a 6 heures", type: "payment" },
              { action: "Rendez-vous planifié", time: "Il y a 8 heures", type: "calendar" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'client' ? 'bg-green-400' :
                  item.type === 'order' ? 'bg-blue-400' :
                  item.type === 'payment' ? 'bg-yellow-400' :
                  'bg-purple-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.action}</p>
                  <p className="text-gray-400 text-xs">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>
    </Layout>
  );
};

export default DashboardExample;
