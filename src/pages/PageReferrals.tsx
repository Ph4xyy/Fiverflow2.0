import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReferral } from '../contexts/ReferralContext';
import { useTranslation } from '../hooks/useTranslation';

import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
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
  Target,
  Globe,
  Mail,
  MessageSquare,
  QrCode,
  Download,
  Eye,
  Star,
  Zap,
  Heart,
  Shield,
  Crown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PageReferrals: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { referralCode, referrerInfo, applyReferralCode } = useReferral();
  // Données mockées pour éviter les erreurs
  const stats = {
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0,
    pendingCommissions: 0
  };
  const referrals: any[] = [];
  const commissions: any[] = [];
  const loading = false;
  const error = null;
  const referralLink = `https://fiverflow.com/register?ref=${referralCode || 'user'}`;

  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Rafraîchir les données au montage
  useEffect(() => {
    if (user) {
      // refreshData();
    }
  }, [user]);

  // Copy referral link
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(t.referrals.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  // Share functions
  const shareOnSocial = (platform: string) => {
    const message = customMessage || `${t.referrals.howItWorks.step1} ${referralLink}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(referralLink);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent('Rejoignez-moi sur FiverFlow!');
    const body = encodeURIComponent(`
Bonjour,

Je vous invite à rejoindre FiverFlow, la plateforme qui révolutionne la gestion de projets freelance.

Utilisez mon code de parrainage: ${referralCode}
Lien direct: ${referralLink}

Avec ce code, vous bénéficierez de:
- 50€ de bonus de bienvenue
- 10% de commission sur vos premiers achats
- Accès à des fonctionnalités premium

Rejoignez-moi dès maintenant!
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="ml-3 text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t.common.error}</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <ModernButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.common.refresh}
          </ModernButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.referrals.title}</h1>
          <p className="text-gray-400">{t.referrals.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <ModernButton variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.common.refresh}
          </ModernButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats?.totalReferrals || 0}</p>
              <p className="text-sm text-gray-400">{t.referrals.stats.totalReferrals}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </ModernCard>

        <ModernCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats?.activeReferrals || 0}</p>
              <p className="text-sm text-gray-400">{t.referrals.stats.activeReferrals}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </ModernCard>

        <ModernCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">€{stats?.totalCommissions || 0}</p>
              <p className="text-sm text-gray-400">{t.referrals.stats.totalCommissions}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </ModernCard>

        <ModernCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">€{stats?.pendingCommissions || 0}</p>
              <p className="text-sm text-gray-400">{t.referrals.stats.pendingCommissions}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </ModernCard>
      </div>

      {/* Referral Code Section */}
      <ModernCard>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">{t.referrals.yourCode}</h2>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl mb-6">
            <div className="text-3xl font-bold text-white mb-2">{referralCode}</div>
            <p className="text-purple-100">{referralLink}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ModernButton onClick={copyReferralLink} className="flex-1 sm:flex-none">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? t.referrals.copied : t.referrals.copyCode}
            </ModernButton>
            
            <ModernButton variant="outline" onClick={() => setShowQR(!showQR)} className="flex-1 sm:flex-none">
              <QrCode className="h-4 w-4 mr-2" />
              {t.referrals.share.generateQR}
            </ModernButton>
          </div>
        </div>
      </ModernCard>

      {/* How It Works */}
      <ModernCard>
        <h2 className="text-xl font-semibold text-white mb-6">{t.referrals.howItWorks.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">1</h3>
            <p className="text-sm text-gray-400">{t.referrals.howItWorks.step1}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">2</h3>
            <p className="text-sm text-gray-400">{t.referrals.howItWorks.step2}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">3</h3>
            <p className="text-sm text-gray-400">{t.referrals.howItWorks.step3}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">4</h3>
            <p className="text-sm text-gray-400">{t.referrals.howItWorks.step4}</p>
          </div>
        </div>
      </ModernCard>

      {/* Benefits */}
      <ModernCard>
        <h2 className="text-xl font-semibold text-white mb-6">{t.referrals.benefits.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t.referrals.benefits.commission}</h3>
              <p className="text-sm text-gray-400">Sur tous les achats de vos parrainés</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t.referrals.benefits.bonus}</h3>
              <p className="text-sm text-gray-400">Pour chaque nouvel utilisateur</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t.referrals.benefits.lifetime}</h3>
              <p className="text-sm text-gray-400">Commissions à vie sur leurs achats</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t.referrals.benefits.noLimit}</h3>
              <p className="text-sm text-gray-400">Invitez autant de personnes que vous voulez</p>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#1e2938] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#9c68f2] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t.referrals.tabs.overview}
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'referrals'
              ? 'bg-[#9c68f2] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t.referrals.tabs.referrals}
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'commissions'
              ? 'bg-[#9c68f2] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t.referrals.tabs.commissions}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Analytics Chart Placeholder */}
          <ModernCard>
            <h3 className="text-lg font-semibold text-white mb-4">{t.referrals.stats.thisMonth}</h3>
            <div className="h-64 bg-[#1e2938] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Graphique des performances</p>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {activeTab === 'referrals' && (
        <ModernCard>
          <h3 className="text-lg font-semibold text-white mb-4">{t.referrals.referralList.title}</h3>
          {referrals && referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#35414e]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.referralList.name}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.referralList.email}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.referralList.joinedDate}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.referralList.status}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.referralList.commission}</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral: any) => (
                    <tr key={referral.id} className="border-b border-[#35414e] hover:bg-[#1e2938]">
                      <td className="py-3 px-4 text-white">{referral.name}</td>
                      <td className="py-3 px-4 text-gray-300">{referral.email}</td>
                      <td className="py-3 px-4 text-gray-300">{new Date(referral.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {referral.status === 'active' ? t.common.active : t.common.inactive}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">€{referral.commission || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t.referrals.referralList.noReferrals}</h3>
              <p className="text-gray-400 mb-4">Commencez à partager votre code de parrainage</p>
              <ModernButton onClick={() => setActiveTab('overview')}>
                <Share2 className="h-4 w-4 mr-2" />
                {t.referrals.referralList.inviteMore}
              </ModernButton>
            </div>
          )}
        </ModernCard>
      )}

      {activeTab === 'commissions' && (
        <ModernCard>
          <h3 className="text-lg font-semibold text-white mb-4">{t.referrals.commissionHistory.title}</h3>
          {commissions && commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#35414e]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.commissionHistory.date}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.commissionHistory.referral}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.commissionHistory.amount}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.commissionHistory.status}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">{t.referrals.commissionHistory.description}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission: any) => (
                    <tr key={commission.id} className="border-b border-[#35414e] hover:bg-[#1e2938]">
                      <td className="py-3 px-4 text-gray-300">{new Date(commission.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-white">{commission.referral_name}</td>
                      <td className="py-3 px-4 text-white">€{commission.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          commission.status === 'paid' 
                            ? 'bg-green-500/20 text-green-400'
                            : commission.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {commission.status === 'paid' ? t.referrals.commissionHistory.paid : 
                           commission.status === 'pending' ? t.referrals.commissionHistory.pending :
                           t.referrals.commissionHistory.cancelled}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{commission.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t.referrals.commissionHistory.noCommissions}</h3>
              <p className="text-gray-400">Les commissions apparaîtront ici une fois que vos parrainés commenceront à acheter</p>
            </div>
          )}
        </ModernCard>
      )}

      {/* Share Section */}
      <ModernCard>
        <h3 className="text-lg font-semibold text-white mb-4">{t.referrals.share.title}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.referrals.share.customMessage}</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              rows={3}
              placeholder="Personnalisez votre message de parrainage..."
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <ModernButton variant="outline" onClick={() => shareOnSocial('twitter')} className="flex items-center justify-center">
              <Globe className="h-4 w-4 mr-2" />
              Twitter
            </ModernButton>
            <ModernButton variant="outline" onClick={() => shareOnSocial('facebook')} className="flex items-center justify-center">
              <Globe className="h-4 w-4 mr-2" />
              Facebook
            </ModernButton>
            <ModernButton variant="outline" onClick={() => shareOnSocial('linkedin')} className="flex items-center justify-center">
              <Globe className="h-4 w-4 mr-2" />
              LinkedIn
            </ModernButton>
            <ModernButton variant="outline" onClick={() => shareOnSocial('whatsapp')} className="flex items-center justify-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </ModernButton>
            <ModernButton variant="outline" onClick={shareByEmail} className="flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </ModernButton>
          </div>
        </div>
      </ModernCard>

      {/* Terms */}
      <ModernCard>
        <h3 className="text-lg font-semibold text-white mb-4">{t.referrals.terms.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{t.referrals.terms.content}</p>
      </ModernCard>
    </div>
  );
};

export default PageReferrals;
