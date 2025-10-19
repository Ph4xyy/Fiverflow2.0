import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  UserCheck, 
  UserX, 
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Activity
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  email?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersToday: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Vérifier si l'utilisateur est admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      console.log('🔍 AdminDashboard: Pas d\'utilisateur connecté');
      setAdminCheckLoading(false);
      return;
    }

    console.log('🔍 AdminDashboard: Vérification admin pour user:', user.id);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      console.log('🔍 AdminDashboard: Résultat vérification:', { data, error });

      if (error) {
        console.error('Erreur lors de la vérification admin:', error);
        setIsAdmin(false);
      } else {
        console.log('🔍 AdminDashboard: is_admin =', data?.is_admin);
        setIsAdmin(data?.is_admin || false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      setIsAdmin(false);
    } finally {
      setAdminCheckLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          auth_users:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('is_admin, is_active, created_at');

      if (usersError) {
        console.error('Erreur lors du chargement des stats:', usersError);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = allUsers?.filter(user => 
        new Date(user.created_at) >= today
      ).length || 0;

      setStats({
        totalUsers: allUsers?.length || 0,
        activeUsers: allUsers?.filter(u => u.is_active).length || 0,
        adminUsers: allUsers?.filter(u => u.is_admin).length || 0,
        newUsersToday
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: !currentStatus })
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la modification du statut admin:', error);
        return;
      }

      // Recharger les données
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la modification du statut admin:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la modification du statut utilisateur:', error);
        return;
      }

      // Recharger les données
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la modification du statut utilisateur:', error);
    }
  };

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (adminCheckLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="w-8 h-8 animate-spin text-[#9c68f2] mx-auto mb-4" />
              <p className="text-gray-400">Vérification des permissions...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Accès Refusé</h2>
              <p className="text-gray-400">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
            <p className="text-gray-400">Gestion des utilisateurs et du système</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-lg">
            <Crown size={20} className="text-white" />
            <span className="text-white font-medium">Administrateur</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-sm text-gray-400">Utilisateurs Total</p>
              </div>
              <Users size={24} className="text-[#9c68f2]" />
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                <p className="text-sm text-gray-400">Utilisateurs Actifs</p>
              </div>
              <UserCheck size={24} className="text-green-500" />
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.adminUsers}</p>
                <p className="text-sm text-gray-400">Administrateurs</p>
              </div>
              <Shield size={24} className="text-blue-500" />
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.newUsersToday}</p>
                <p className="text-sm text-gray-400">Nouveaux Aujourd'hui</p>
              </div>
              <TrendingUp size={24} className="text-orange-500" />
            </div>
          </ModernCard>
        </div>

        {/* Users Table */}
        <ModernCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Gestion des Utilisateurs</h2>
            <ModernButton onClick={loadUsers} variant="outline" size="sm">
              <Database size={16} className="mr-2" />
              Actualiser
            </ModernButton>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Activity className="w-6 h-6 animate-spin text-[#9c68f2]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#35414e]">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Admin</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Inscription</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userProfile) => (
                    <tr key={userProfile.id} className="border-b border-[#35414e] hover:bg-[#35414e]/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {userProfile.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {userProfile.full_name || 'Utilisateur'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {userProfile.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          userProfile.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userProfile.is_active ? (
                            <>
                              <CheckCircle size={12} />
                              Actif
                            </>
                          ) : (
                            <>
                              <UserX size={12} />
                              Inactif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          userProfile.is_admin 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {userProfile.is_admin ? (
                            <>
                              <Crown size={12} />
                              Admin
                            </>
                          ) : (
                            'Utilisateur'
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(userProfile.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <ModernButton
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAdminStatus(userProfile.user_id, userProfile.is_admin)}
                            className={userProfile.is_admin ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}
                          >
                            {userProfile.is_admin ? (
                              <>
                                <UserX size={14} className="mr-1" />
                                Retirer Admin
                              </>
                            ) : (
                              <>
                                <Crown size={14} className="mr-1" />
                                Promouvoir Admin
                              </>
                            )}
                          </ModernButton>
                          <ModernButton
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(userProfile.user_id, userProfile.is_active)}
                            className={userProfile.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                          >
                            {userProfile.is_active ? (
                              <>
                                <UserX size={14} className="mr-1" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} className="mr-1" />
                                Activer
                              </>
                            )}
                          </ModernButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModernCard>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
