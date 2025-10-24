import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReferral } from '../contexts/ReferralContext';
import { useReferral as useReferralHook } from '../hooks/useReferral';

import { 
  Copy, 
  ExternalLink, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Share2,
  BarChart3,
  Award,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const { referralCode, referrerInfo, applyReferralCode } = useReferral();
  const { 
    profile, 
    stats, 
    analytics, 
    referralLink, 
    referrals, 
    commissions, 
    loading, 
    error, 
    refreshData 
  } = useReferralHook();

  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview');
  const [copied, setCopied] = useState(false);

  // Rafraîchir les données au montage
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Copy referral link
  const copyReferralLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink.url);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Impossible de copier le lien');
    }
  };

  // Partager le lien
  const shareReferralLink = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez-moi sur FiverFlow',
          text: 'Use my referral link to sign up!',
          url: referralLink.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyReferralLink();
    }
  };

  // Obtenir le statut d'une commission
  const getCommissionStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Payée' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'En attente' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Annulée' };
      case 'refunded':
        return { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Remboursée' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Inconnu' };
    }
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading referral data...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">Erreur lors du chargement des données</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Gift className="w-8 h-8 text-purple-500" />
                  Network
                </h1>
                <p className="text-slate-400">
                  Manage your referrals and earn commissions
                </p>
              </div>
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Statistiques principales */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total des gains</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatAmount(stats.paid_commissions || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Filleuls</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {stats.total_referrals || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">En attente</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatAmount(stats.pending_commissions || 0)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Taux de conversion</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {stats.total_referrals > 0 ? Math.round((stats.total_commissions / stats.total_referrals) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Onglets */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                { id: 'referrals', label: 'Mes filleuls', icon: Users },
                { id: 'commissions', label: 'Commissions', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="space-y-8">
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Lien de parrainage */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-500" />
                    Your referral link
                  </h3>
                  
                  {referralLink ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm mb-1">Referral code</p>
                          <p className="text-white font-mono text-lg">{referralLink.code}</p>
                        </div>
                        <button
                          onClick={copyReferralLink}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            copied 
                              ? 'bg-green-600 text-white' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? 'Copié !' : 'Copier'}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm mb-1">Lien complet</p>
                          <p className="text-white font-mono text-sm break-all">{referralLink.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={copyReferralLink}
                            className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            title="Copier le lien"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={shareReferralLink}
                            className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            title="Partager"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <a
                            href={referralLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            title="Ouvrir dans un nouvel onglet"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <p className="text-blue-300 text-sm">
                          💡 <strong>Comment ça marche :</strong> Partagez votre lien avec vos amis. 
                          Quand ils s'inscrivent et effectuent un paiement, vous gagnez 20% de commission !
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Loading referral link...</p>
                    </div>
                  )}
                </div>

                {/* Graphiques et analytics */}
                {analytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gains mensuels */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <h4 className="text-lg font-semibold text-white mb-4">Gains mensuels</h4>
                      {analytics.monthly_earnings.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.monthly_earnings.slice(-6).map((month, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-slate-400">{month.month}</span>
                              <span className="text-green-400 font-medium">
                                {formatAmount(month.earnings)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-4">Aucun gain pour le moment</p>
                      )}
                    </div>

                    {/* Top referrals */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <h4 className="text-lg font-semibold text-white mb-4">Top referrals</h4>
                      {analytics.top_referrals.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.top_referrals.slice(0, 5).map((referral, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                  <span className="text-slate-300 text-sm font-medium">
                                    {referral.referred_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white text-sm">{referral.referred_name}</p>
                                  <p className="text-slate-400 text-xs">{referral.referred_email}</p>
                                </div>
                              </div>
                              <span className="text-green-400 font-medium">
                                {formatAmount(referral.commission_amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-4">Aucun referral pour le moment</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mes filleuls */}
            {activeTab === 'referrals' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Mes filleuls ({referrals.length})
                  </h3>
                </div>
                
                <div className="p-6">
                  {referrals.length > 0 ? (
                    <div className="space-y-4">
                      {referrals.map((referral, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {referral.referred_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{referral.referred_name}</p>
                              <p className="text-slate-400 text-sm">{referral.referred_email}</p>
                              <p className="text-slate-500 text-xs">
                                Inscrit le {formatDate(referral.referred_joined_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-medium">
                              {formatAmount(referral.commission_amount)}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Commission {referral.commission_status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg mb-2">Aucun filleul pour le moment</p>
                      <p className="text-slate-500 text-sm">
                        Partagez votre lien de parrainage pour commencer à gagner !
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commissions */}
            {activeTab === 'commissions' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Mes commissions ({commissions.length})
                  </h3>
                </div>
                
                <div className="p-6">
                  {commissions.length > 0 ? (
                    <div className="space-y-4">
                      {commissions.map((commission, index) => {
                        const statusInfo = getCommissionStatus(commission.status);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                                <statusInfo.icon className={`w-5 h-5 ${statusInfo.color}`} />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  Commission #{commission.id.slice(0, 8)}
                                </p>
                                <p className="text-slate-400 text-sm">
                                  {formatDate(commission.created_at)}
                                </p>
                                {commission.payment_reference && (
                                  <p className="text-slate-500 text-xs">
                                    Ref: {commission.payment_reference}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-medium text-lg">
                                {formatAmount(commission.amount)}
                              </p>
                              <p className={`text-sm ${statusInfo.color}`}>
                                {statusInfo.label}
                              </p>
                              <p className="text-slate-500 text-xs">
                                {commission.percentage}% de commission
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg mb-2">Aucune commission pour le moment</p>
                      <p className="text-slate-500 text-sm">
                        Les commissions apparaîtront ici quand vos filleuls effectueront des paiements.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ReferralsPage;
