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
            <p className="text-gray-400">Welcome to your professional dashboard</p>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <ModernButton size="sm">
                Quick Actions
              </ModernButton>
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e2938] border border-[#35414e] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2">
                    <Users size={16} />
                    Add Client
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2">
                    <Package size={16} />
                    Create Order
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2">
                    <Calendar size={16} />
                    Schedule Meeting
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#35414e] flex items-center gap-2">
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
              <div className="text-3xl font-bold text-white mb-2">1,234</div>
              <div className="flex items-center text-green-400 text-sm">
                <TrendingUp size={16} className="mr-1" />
                +12% this month
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
              <div className="text-3xl font-bold text-white mb-2">89</div>
              <div className="flex items-center text-blue-400 text-sm">
                <Activity size={16} className="mr-1" />
                +5% this week
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
              <div className="text-3xl font-bold text-white mb-2">€12,456</div>
              <div className="flex items-center text-green-400 text-sm">
                <TrendingUp size={16} className="mr-1" />
                +8% this month
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <DollarSign size={20} className="text-gray-400" />
              </div>
            </div>
          </ModernCard>

          <ModernCard 
            title="Events"
          >
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-2">24</div>
              <div className="flex items-center text-purple-400 text-sm">
                <Calendar size={16} className="mr-1" />
                This week
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <Calendar size={20} className="text-gray-400" />
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard 
            title="Monthly Sales" 
            icon={<BarChart3 size={20} className="text-white" />}
          >
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Sales chart</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard 
            title="Client Distribution" 
            icon={<PieChart size={20} className="text-white" />}
          >
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <PieChart size={48} className="mx-auto mb-4 opacity-50" />
                <p>Pie chart</p>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Recent Activity */}
        <ModernCard 
          title="Recent Activity" 
          icon={<Activity size={20} className="text-white" />}
        >
          <div className="space-y-4">
            {[
              { action: "New client added", time: "2 hours ago", type: "client" },
              { action: "Order #1234 confirmed", time: "4 hours ago", type: "order" },
              { action: "Payment received", time: "6 hours ago", type: "payment" },
              { action: "Appointment scheduled", time: "8 hours ago", type: "calendar" }
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
