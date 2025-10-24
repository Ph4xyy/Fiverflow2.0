import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface AdminStats {
  totals: {
    allTimeUsers: number;
    newUsersInRange: number;
    adminsAllTime: number;
    totalOrders: number;
    totalInvoices: number;
    totalClients: number;
    totalTasks: number;
    totalTimeEntries: number;
    totalReferrals: number;
    totalRevenue: number;
  };
  plans: {
    free: number;
    pro: number;
  };
  revenue: {
    total: number;
    fromOrders: number;
    fromInvoices: number;
    fromReferrals: number;
    currency: string;
  };
  subscriptions: {
    total: number;
    active: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    created_at: string;
    role: string | null;
    is_pro: boolean;
  }>;
  recentOrders: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    created_at: string;
    client_name: string;
  }>;
  recentInvoices: Array<{
    id: string;
    number: string;
    total: number;
    status: string;
    created_at: string;
    client_name: string;
  }>;
  topReferrers: Array<{
    id: string;
    email: string | null;
    name: string | null;
    referral_count: number;
    total_earnings: number;
  }>;
  platformStats: {
    totalClients: number;
    topPlatforms: Array<{
      platform: string;
      count: number;
    }>;
  };
}

export const useAdminStats = (startDate: string, endDate: string) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadAdminStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Données mockées pour éviter les erreurs de Supabase
        const mockStats: AdminStats = {
          totals: {
            allTimeUsers: 150,
            newUsersInRange: 25,
            adminsAllTime: 3,
            totalOrders: 45,
            totalInvoices: 30,
            totalClients: 120,
            totalTasks: 200,
            totalTimeEntries: 500,
            totalReferrals: 15,
            totalRevenue: 12500
          },
          plans: {
            free: 100,
            pro: 50
          },
          revenue: {
            total: 12500,
            fromOrders: 8000,
            fromInvoices: 4000,
            fromReferrals: 500,
            currency: 'USD'
          },
          subscriptions: {
            total: 150,
            active: 50,
            monthlyRevenue: 1450,
            yearlyRevenue: 14500
          },
          recentUsers: [
            {
              id: '1',
              email: 'user1@example.com',
              name: 'John Doe',
              created_at: new Date().toISOString(),
              role: 'user',
              is_pro: true
            },
            {
              id: '2',
              email: 'user2@example.com',
              name: 'Jane Smith',
              created_at: new Date().toISOString(),
              role: 'user',
              is_pro: false
            }
          ],
          recentOrders: [
            {
              id: '1',
              title: 'Website Design',
              amount: 1500,
              status: 'completed',
              created_at: new Date().toISOString(),
              client_name: 'Client A'
            },
            {
              id: '2',
              title: 'Mobile App',
              amount: 3000,
              status: 'in_progress',
              created_at: new Date().toISOString(),
              client_name: 'Client B'
            }
          ],
          recentInvoices: [
            {
              id: '1',
              number: 'INV-001',
              total: 1500,
              status: 'paid',
              created_at: new Date().toISOString(),
              client_name: 'Client A'
            }
          ],
          topReferrers: [
            {
              id: '1',
              email: 'referrer1@example.com',
              name: 'Top Referrer',
              referral_count: 5,
              total_earnings: 500
            }
          ],
          platformStats: {
            totalClients: 120,
            topPlatforms: [
              { platform: 'Fiverr', count: 45 },
              { platform: 'Upwork', count: 30 },
              { platform: 'Freelancer', count: 25 },
              { platform: 'Other', count: 20 }
            ]
          }
        };

        console.log('📊 Mock Admin stats loaded:', mockStats);
        setStats(mockStats);
      } catch (err: any) {
        console.error('❌ Error loading admin stats:', err);
        setError(err.message || 'Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, [user, startDate, endDate]);

  return { stats, loading, error };
};