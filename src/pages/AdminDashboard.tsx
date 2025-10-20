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
  Activity,
  MoreVertical,
  Edit,
  Key,
  CreditCard,
  Ban,
  UserPlus,
  Mail,
  Eye,
  Trash2,
  X
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  email?: string;
  // Nouvelles propriétés pour la gestion avancée
  subscription_plan?: 'launch' | 'boost' | 'scale' | 'free';
  user_role?: 'user' | 'moderator' | 'admin' | 'super_admin';
  permissions?: string[];
  last_login?: string;
  total_orders?: number;
  total_revenue?: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersToday: number;
  // Statistiques d'abonnements
  totalSubscriptions: number;
  totalRevenue: number;
  launchSubscriptions: number;
  boostSubscriptions: number;
  scaleSubscriptions: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersToday: 0,
    totalSubscriptions: 0,
    totalRevenue: 0,
    launchSubscriptions: 0,
    boostSubscriptions: 0,
    scaleSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [menuUser, setMenuUser] = useState<UserProfile | null>(null);

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

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const loadUsers = async () => {
    try {
      console.log('🔍 AdminDashboard: Chargement des utilisateurs...');
      
      // Utiliser la vue qui inclut les emails
      const { data, error } = await supabase
        .from('user_emails_view')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 AdminDashboard: Résultat requête utilisateurs:', { data, error });

      if (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        console.error('Détails de l\'erreur:', error.message, error.details, error.hint);
        return;
      }

      console.log('🔍 AdminDashboard: Nombre d\'utilisateurs trouvés:', data?.length || 0);
      console.log('🔍 AdminDashboard: Utilisateurs trouvés:', data?.map(u => ({ name: u.full_name, email: u.email, id: u.id })));

      // Récupérer les vraies données d'abonnement pour chaque utilisateur
      const usersWithRealData = await Promise.all((data || []).map(async (user, index) => {
        // Récupérer l'abonnement réel de l'utilisateur
        const { data: subscriptionData } = await supabase
          .rpc('get_user_current_subscription', { user_uuid: user.user_id });

        const currentSubscription = subscriptionData && subscriptionData.length > 0 ? subscriptionData[0] : null;

        return {
          ...user,
          email: user.email || `user${index + 1}@example.com`,
          subscription_plan: currentSubscription?.plan_name || 'launch', // Utiliser le vrai plan
          user_role: user.is_admin ? 'admin' : 'user',
          permissions: user.is_admin ? ['admin', 'manage_users', 'view_analytics'] : ['user'],
          last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_orders: Math.floor(Math.random() * 50),
          total_revenue: Math.floor(Math.random() * 5000)
        };
      }));

      console.log('🔍 AdminDashboard: Utilisateurs avec vraies données:', usersWithRealData);
      setUsers(usersWithRealData);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('🔍 AdminDashboard: Chargement des statistiques...');
      
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('is_admin, is_active, created_at');

      console.log('🔍 AdminDashboard: Résultat requête stats:', { allUsers, usersError });

      if (usersError) {
        console.error('Erreur lors du chargement des stats:', usersError);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = allUsers?.filter(user => 
        new Date(user.created_at) >= today
      ).length || 0;

      const statsData = {
        totalUsers: allUsers?.length || 0,
        activeUsers: allUsers?.filter(u => u.is_active).length || 0,
        adminUsers: allUsers?.filter(u => u.is_admin).length || 0,
        newUsersToday,
        // Données simulées pour les abonnements (à remplacer par de vraies données)
        totalSubscriptions: 156,
        totalRevenue: 12450.00,
        launchSubscriptions: 89,
        boostSubscriptions: 45,
        scaleSubscriptions: 22
      };

      console.log('🔍 AdminDashboard: Statistiques calculées:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log('🔍 AdminDashboard: Changement de statut admin pour user:', userId, 'actuel:', currentStatus);
      
      if (currentStatus) {
        // Rétrograder admin vers user
        const { data, error } = await supabase
          .rpc('demote_admin_to_user', {
            target_user_id: userId,
            admin_user_id: user?.id // ID de l'admin qui fait le changement
          });

        if (error) {
          console.error('Erreur lors de la rétrogradation admin:', error);
          alert('Erreur lors de la rétrogradation: ' + error.message);
          return;
        }

        console.log('🔍 AdminDashboard: Admin rétrogradé avec succès:', data);
        alert('✅ Utilisateur rétrogradé en utilisateur normal avec succès!');
      } else {
        // Promouvoir user vers admin
        const { data, error } = await supabase
          .rpc('promote_user_to_admin', {
            target_user_id: userId,
            admin_user_id: user?.id // ID de l'admin qui fait le changement
          });

        if (error) {
          console.error('Erreur lors de la promotion admin:', error);
          alert('Erreur lors de la promotion: ' + error.message);
          return;
        }

        console.log('🔍 AdminDashboard: Utilisateur promu admin avec succès:', data);
        alert('✅ Utilisateur promu administrateur avec succès!');
      }

      // Recharger les données pour voir le changement
      setLoading(true);
      await loadUsers();
      await loadStats();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la modification du statut admin:', error);
      alert('❌ Erreur lors de la modification du statut admin: ' + error.message);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log('🔍 AdminDashboard: Changement de statut utilisateur pour user:', userId, 'actuel:', currentStatus);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la modification du statut utilisateur:', error);
        alert('Erreur lors de la modification du statut: ' + error.message);
        return;
      }

      console.log('🔍 AdminDashboard: Statut utilisateur modifié avec succès');
      alert(`✅ Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès!`);

      // Recharger les données pour voir le changement
      setLoading(true);
      await loadUsers();
      await loadStats();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la modification du statut utilisateur:', error);
      alert('❌ Erreur lors de la modification du statut utilisateur: ' + error.message);
    }
  };

  // Nouvelles fonctions de gestion
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('🔍 AdminDashboard: Changement de rôle pour user:', userId, 'vers rôle:', newRole);
      
      // Utiliser la fonction SQL pour changer le rôle
      const { data, error } = await supabase
        .rpc('change_user_role', {
          user_uuid: userId,
          new_role_name: newRole,
          admin_user_id: user?.id // ID de l'admin qui fait le changement
        });

      if (error) {
        console.error('Erreur lors de la modification du rôle:', error);
        alert('Erreur lors de la modification du rôle: ' + error.message);
        return;
      }

      console.log('🔍 AdminDashboard: Rôle changé avec succès:', data);
      alert(`✅ Rôle changé vers ${newRole === 'admin' ? 'Admin' : 'User'} avec succès!`);

      // Recharger les données pour voir le changement
      setLoading(true);
      await loadUsers();
      await loadStats();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la modification du rôle:', error);
      alert('❌ Erreur lors de la modification du rôle: ' + error.message);
    }
  };

  const updateSubscription = async (userId: string, newPlan: string) => {
    try {
      console.log('🔍 AdminDashboard: Changement d\'abonnement pour user:', userId, 'vers plan:', newPlan);
      
      // Utiliser la fonction SQL pour changer l'abonnement
      const { data, error } = await supabase
        .rpc('change_user_subscription', {
          user_uuid: userId,
          new_plan_name: newPlan,
          billing_cycle_param: 'monthly'
        });

      if (error) {
        console.error('Erreur lors de la modification de l\'abonnement:', error);
        alert('Erreur lors de la modification de l\'abonnement: ' + error.message);
        return;
      }

      console.log('🔍 AdminDashboard: Abonnement changé avec succès:', data);
      
      // Afficher un message de succès plus informatif
      const planDisplayName = newPlan === 'scale' ? 'Scale (59€/mois)' :
                             newPlan === 'boost' ? 'Boost (24€/mois)' :
                             'Launch (Gratuit)';
      alert(`✅ Abonnement changé vers ${planDisplayName} avec succès!`);

      // Recharger les données pour voir le changement
      setLoading(true);
      await loadUsers();
      await loadStats();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'abonnement:', error);
      alert('❌ Erreur lors de la modification de l\'abonnement: ' + error.message);
    }
  };

  const sendEmailToUser = (userEmail: string) => {
    // Ouvrir le client email par défaut
    window.open(`mailto:${userEmail}?subject=Message from FiverFlow Admin`);
    setOpenMenuId(null);
  };

  const viewUserDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setOpenMenuId(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        return;
      }

      loadUsers();
      loadStats();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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

        {/* Stats Cards - Utilisateurs */}
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

        {/* Stats Cards - Abonnements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalSubscriptions}</p>
                <p className="text-sm text-gray-400">Abonnements Total</p>
              </div>
              <Crown size={24} className="text-yellow-500" />
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Revenus Total</p>
              </div>
              <TrendingUp size={24} className="text-green-500" />
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.launchSubscriptions}</p>
                <p className="text-sm text-gray-400">Launch</p>
              </div>
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">L</span>
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.boostSubscriptions}</p>
                <p className="text-sm text-gray-400">Boost</p>
              </div>
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.scaleSubscriptions}</p>
                <p className="text-sm text-gray-400">Scale</p>
              </div>
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Users Table */}
        <ModernCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Gestion des Utilisateurs</h2>
            <ModernButton 
              onClick={() => {
                setLoading(true);
                loadUsers();
                loadStats();
              }} 
              variant="outline" 
              size="sm"
            >
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
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Abonnement</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Rôle</th>
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
                          userProfile.subscription_plan === 'scale' 
                            ? 'bg-orange-500/20 text-orange-400'
                            : userProfile.subscription_plan === 'boost'
                            ? 'bg-purple-500/20 text-purple-400'
                            : userProfile.subscription_plan === 'launch'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {userProfile.subscription_plan === 'scale' ? 'Scale' :
                           userProfile.subscription_plan === 'boost' ? 'Boost' :
                           userProfile.subscription_plan === 'launch' ? 'Launch' : 'Free'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          userProfile.user_role === 'super_admin' 
                            ? 'bg-red-500/20 text-red-400'
                            : userProfile.user_role === 'admin'
                            ? 'bg-blue-500/20 text-blue-400'
                            : userProfile.user_role === 'moderator'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {userProfile.user_role === 'super_admin' ? 'Super Admin' :
                           userProfile.user_role === 'admin' ? 'Admin' :
                           userProfile.user_role === 'moderator' ? 'Moderator' : 'User'}
                        </span>
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
                        <div className="relative menu-container">
                          <button
                            onClick={() => {
                              console.log('🔍 AdminDashboard: Clic sur menu pour user:', userProfile.full_name, 'ID:', userProfile.id, 'Email:', userProfile.email);
                              if (openMenuId === userProfile.id) {
                                setOpenMenuId(null);
             setMenuUser(null);
                                setMenuUser(null);
                              } else {
                                setOpenMenuId(userProfile.id);
                                setMenuUser(userProfile);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-[#35414e] transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>

                          {openMenuId === userProfile.id && menuUser && (
                            <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={() => {
                              setOpenMenuId(null);
             setMenuUser(null);
                              setMenuUser(null);
                            }}>
                              <div className="w-96 bg-[#1e2938] border border-[#35414e] rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="p-4">
                                  {/* Debug info */}
                                  {console.log('🔍 AdminDashboard: Menu ouvert pour user:', menuUser.full_name, 'ID:', menuUser.id, 'Email:', menuUser.email)}
                                  
                                  {/* Header du menu */}
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                      Gérer {menuUser.full_name || 'Utilisateur'}
                                    </h3>
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
             setMenuUser(null);
                                        setMenuUser(null);
                                      }}
                                      className="p-1 rounded-lg hover:bg-[#35414e] transition-colors"
                                    >
                                      <X size={16} className="text-gray-400" />
                                    </button>
                                  </div>

                                  {/* Informations utilisateur */}
                                  <div className="bg-[#35414e] rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {(menuUser.full_name || 'U').charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-white font-medium">{menuUser.full_name || 'Utilisateur'}</p>
                                        <p className="text-gray-400 text-sm">{menuUser.email}</p>
                                      </div>
                                    </div>
                                  </div>

                                {/* Actions rapides */}
                                <div className="space-y-1">
                                  <button
                                    onClick={() => viewUserDetails(menuUser)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#35414e] rounded-lg transition-colors"
                                  >
                                    <Eye size={14} />
                                    Voir les détails
                                  </button>

                                  <button
                                    onClick={() => sendEmailToUser(menuUser.email || '')}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#35414e] rounded-lg transition-colors"
                                  >
                                    <Mail size={14} />
                                    Envoyer un email
                                  </button>
                                </div>

                                <div className="border-t border-[#35414e] my-3"></div>

                                {/* Gestion des rôles */}
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-white mb-2">Rôle & Permissions</h4>
                                  <div className="space-y-1">
                                    {['user', 'admin'].map(role => (
                                      <button
                                        key={role}
                                        onClick={() => updateUserRole(menuUser.user_id, role)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                          menuUser.user_role === role
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-300 hover:bg-[#35414e]'
                                        }`}
                                      >
                                        <Key size={14} />
                                        {role === 'admin' ? 'Admin' : 'User'}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Gestion des abonnements */}
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-white mb-2">Abonnement</h4>
                                  <div className="space-y-1">
                                    {['launch', 'boost', 'scale'].map(plan => (
                                      <button
                                        key={plan}
                                        onClick={() => updateSubscription(menuUser.user_id, plan)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                          menuUser.subscription_plan === plan
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'text-gray-300 hover:bg-[#35414e]'
                                        }`}
                                      >
                                        <CreditCard size={14} />
                                        {plan === 'scale' ? 'Scale (59€/mois)' :
                                         plan === 'boost' ? 'Boost (24€/mois)' :
                                         'Launch (Gratuit)'}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="border-t border-[#35414e] my-3"></div>

                                {/* Actions d'administration */}
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-white mb-2">Administration</h4>
                                  <div className="space-y-1">
                                  <button
                                    onClick={() => toggleAdminStatus(menuUser.user_id, menuUser.is_admin)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                      menuUser.is_admin 
                                        ? 'text-red-400 hover:bg-red-500/20' 
                                        : 'text-blue-400 hover:bg-blue-500/20'
                                    }`}
                                  >
                                    {menuUser.is_admin ? (
                                      <>
                                        <UserX size={14} />
                                        Retirer Admin
                                      </>
                                    ) : (
                                      <>
                                        <Crown size={14} />
                                        Promouvoir Admin
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => toggleUserStatus(menuUser.user_id, menuUser.is_active)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                      menuUser.is_active 
                                        ? 'text-red-400 hover:bg-red-500/20' 
                                        : 'text-green-400 hover:bg-green-500/20'
                                    }`}
                                  >
                                    {menuUser.is_active ? (
                                      <>
                                        <Ban size={14} />
                                        Désactiver
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={14} />
                                        Activer
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => deleteUser(menuUser.user_id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    Supprimer
                                  </button>
                                  </div>
                                </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModernCard>

        {/* Modal de détails utilisateur */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1e2938] border border-[#35414e] rounded-xl shadow-2xl">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Détails de l'Utilisateur</h2>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="p-2 rounded-lg hover:bg-[#35414e] transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Informations utilisateur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations de base */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Informations de Base</h3>
                    
                    <div className="bg-[#35414e] rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {(selectedUser.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">{selectedUser.full_name || 'Utilisateur'}</h4>
                          <p className="text-gray-400">{selectedUser.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID Utilisateur:</span>
                        <span className="text-white font-mono text-sm">{selectedUser.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID Profil:</span>
                        <span className="text-white font-mono text-sm">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date d'inscription:</span>
                        <span className="text-white">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statut et permissions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Statut & Permissions</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Statut:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedUser.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Rôle:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.user_role === 'admin' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedUser.user_role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Admin:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.is_admin 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedUser.is_admin ? 'Oui' : 'Non'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Abonnement */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Abonnement</h3>
                    
                    <div className="bg-[#35414e] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Plan actuel:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.subscription_plan === 'scale' 
                            ? 'bg-orange-500/20 text-orange-400'
                            : selectedUser.subscription_plan === 'boost'
                            ? 'bg-purple-500/20 text-purple-400'
                            : selectedUser.subscription_plan === 'launch'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedUser.subscription_plan === 'scale' ? 'Scale' :
                           selectedUser.subscription_plan === 'boost' ? 'Boost' :
                           selectedUser.subscription_plan === 'launch' ? 'Launch' : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Statistiques</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#35414e] rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{selectedUser.total_orders || 0}</p>
                        <p className="text-sm text-gray-400">Commandes</p>
                      </div>
                      <div className="bg-[#35414e] rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">${selectedUser.total_revenue || 0}</p>
                        <p className="text-sm text-gray-400">Revenus</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#35414e]">
                  <ModernButton
                    variant="outline"
                    onClick={() => setShowUserDetails(false)}
                  >
                    Fermer
                  </ModernButton>
                  <ModernButton
                    onClick={() => sendEmailToUser(selectedUser.email || '')}
                  >
                    <Mail size={16} className="mr-2" />
                    Envoyer un Email
                  </ModernButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
