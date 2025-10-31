import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReferral } from '../contexts/ReferralContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { 
  Copy, 
  Users, 
  DollarSign, 
  Gift, 
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReferralCommission {
  id: string;
  referred_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

const PageReferrals: React.FC = () => {
  const { user } = useAuth();
  const { referralCode, referrerInfo } = useReferral();
  const { currency } = useCurrency();

  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [requestPayoutLoading, setRequestPayoutLoading] = useState(false);

  // Fetch referral data
  const fetchReferralData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch stats from user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('total_referrals, referral_earnings')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      setStats({
        totalReferrals: profile?.total_referrals || 0,
        totalEarnings: parseFloat(profile?.referral_earnings || '0'),
        pendingEarnings: 0
      });

      // Get user's profile ID
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile?.id) {
        throw new Error('User profile not found');
      }

      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('referral_commissions')
        .select(`
          id,
          referred_id,
          amount,
          status,
          created_at
        `)
        .eq('referrer_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commissionsError) throw commissionsError;

      // Calculate pending earnings
      const pending = (commissionsData || [])
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

      setStats(prev => ({ ...prev, pendingEarnings: pending }));
      setCommissions(commissionsData || []);

    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user, fetchReferralData]);

  // Generate referral link
  const referralLink = referralCode
    ? `https://fiverflow.com/?ref=${referralCode}`
    : '';

  // Copy referral link
  const copyReferralLink = async () => {
    if (!referralLink) {
      toast.error('Referral link not ready yet');
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // Request payout
  const handleRequestPayout = async () => {
    if (stats.totalEarnings < 20) {
      toast.error('Minimum payout amount is $20.00');
      return;
    }

    setRequestPayoutLoading(true);
    try {
      // Call the payout request function
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: { amount: stats.totalEarnings }
      });

      if (error) throw error;

      toast.success('Payout request submitted successfully!');
      await fetchReferralData();
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast.error(error.message || 'Failed to request payout');
    } finally {
      setRequestPayoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#0f0f0f] to-[#0b0b0b] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#0f0f0f] to-[#0b0b0b] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-bold text-white mb-2">Referral Program</h1>
            <p className="text-gray-400 text-lg">Earn 20% lifetime commissions for every subscription you refer</p>
        </div>
          <button
            onClick={fetchReferralData}
            className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-700"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
      </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-white">{stats.totalReferrals}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Pending Payouts</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.pendingEarnings)}</p>
            </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
          </div>
            </div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-700/30 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Your Referral Link</h2>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 mb-4">
            <p className="text-white font-mono text-sm break-all">{referralLink || 'Loading...'}</p>
          </div>
          <button
            onClick={copyReferralLink}
            disabled={!referralLink}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy Link
              </>
            )}
          </button>
          <p className="text-gray-400 text-sm mt-4 text-center">
            Share this link with your friends. When they subscribe, you earn 20% commission!
          </p>
        </div>

        {/* Commission History */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-semibold text-white">Recent Commissions</h2>
          </div>
          <div className="p-6">
            {commissions.length > 0 ? (
              <div className="space-y-4">
                {commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-purple-400" />
            </div>
                      <div>
                        <p className="text-white font-medium">
                          Commission #{commission.id.slice(0, 8)}
                        </p>
                        <p className="text-gray-400 text-sm">{formatDate(commission.created_at)}</p>
                      </div>
          </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{formatCurrency(parseFloat(commission.amount))}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(commission.status)}`}>
                        {commission.status}
                      </span>
            </div>
          </div>
                ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No commissions yet</p>
                <p className="text-gray-500 text-sm">Commissions will appear here once your referrals subscribe</p>
            </div>
            )}
          </div>
        </div>

        {/* Payout Request */}
        {stats.totalEarnings >= 20 && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-700/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready for Payout</h3>
                <p className="text-gray-400">You have {formatCurrency(stats.totalEarnings)} available to withdraw</p>
              </div>
              <button
                onClick={handleRequestPayout}
                disabled={requestPayoutLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestPayoutLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Request Payout'
                )}
              </button>
            </div>
            {stats.totalEarnings < 20 && (
              <p className="text-yellow-400 text-sm mt-2">
                Minimum payout amount is $20.00
              </p>
            )}
          </div>
        )}
        </div>
    </div>
  );
};

export default PageReferrals;
