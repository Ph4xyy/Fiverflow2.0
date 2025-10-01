// src/pages/NetworkPage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { useAuth } from '../contexts/AuthContext';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { usePayouts } from '../hooks/usePayouts';
import PayoutModal from '../components/PayoutModal';
import {
  Users,
  Copy,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  Shield,
  Ban as Bank
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralData {
  id: string;
  referred_id: string;
  subscription_status: string;
  created_at: string;
  referred_user: {
    email: string;
    name: string;
  };
}

interface ReferralLog {
  id: string;
  amount_earned: number;
  date: string;
  referred_user: {
    email: string;
    name: string;
  };
}

// Mock data for when Supabase is not configured
const mockReferrals: ReferralData[] = [
  {
    id: '1',
    referred_id: 'mock-referred-1',
    subscription_status: 'paid',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    referred_user: { email: 'john.doe@example.com', name: 'John Doe' }
  },
  {
    id: '2',
    referred_id: 'mock-referred-2',
    subscription_status: 'trial',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    referred_user: { email: 'jane.smith@example.com', name: 'Jane Smith' }
  },
  {
    id: '3',
    referred_id: 'mock-referred-3',
    subscription_status: 'paid',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    referred_user: { email: 'mike.johnson@example.com', name: 'Mike Johnson' }
  }
];

const mockReferralLogs: ReferralLog[] = [
  {
    id: '1',
    amount_earned: 22.0,
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    referred_user: { email: 'john.doe@example.com', name: 'John Doe' }
  },
  {
    id: '2',
    amount_earned: 39.0,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    referred_user: { email: 'mike.johnson@example.com', name: 'Mike Johnson' }
  },
  {
    id: '3',
    amount_earned: 22.0,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    referred_user: { email: 'sarah.wilson@example.com', name: 'Sarah Wilson' }
  }
];

export default function NetworkPage() {
  const { user } = useAuth();

  // 🔒 Plan access
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  const {
    payoutDetails,
    payoutRequests,
    availableEarnings,
    loading: payoutLoading,
    error: payoutError,
    setupStripeAccount,
    checkAccountStatus,
    requestPayout,
    refreshData
  } = usePayouts();

  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const referralCode = (user as any)?.referral_code || '';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  // --------- UI helpers (dark theme)
  const card = 'bg-[#11151D] rounded-xl shadow-sm border border-zinc-800';
  const pSub = 'text-zinc-400';
  const h1 = 'text-3xl font-bold text-zinc-100';
  const h2 = 'text-xl font-semibold text-zinc-100';
  const tableWrap = 'overflow-x-auto';
  const thBase =
    'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400';
  const tdMuted = 'text-sm text-zinc-400';
  const tdStrong = 'text-sm font-medium text-zinc-100';

  useEffect(() => {
    if (user) fetchReferralData();
  }, [user]);

  // Listen for session refresh to refetch data
  useEffect(() => {
    const onRefreshed = () => {
      if (user) fetchReferralData();
    };
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', onRefreshed as any);
  }, [user, fetchReferralData]);

  const fetchReferralData = async () => {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured || !supabase) {
      setReferrals(mockReferrals);
      setReferralLogs(mockReferralLogs);
      setTotalEarnings(mockReferralLogs.reduce((s, l) => s + l.amount_earned, 0));
      setLoading(false);
      setPageError(null);
      return;
    }

    if (!user) {
      setReferrals([]);
      setReferralLogs([]);
      setTotalEarnings(0);
      setLoading(false);
      setPageError(null);
      return;
    }

    try {
      setLoading(true);
      setPageError(null);

      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(
          `
          id,
          referred_id,
          subscription_status,
          created_at,
          referred_user:users!referrals_referred_id_fkey(email, name)
        `
        )
        .eq('referrer_id', (user as any).id);

      if (referralsError) throw referralsError;

      const { data: logsData, error: logsError } = await supabase
        .from('referral_logs')
        .select(
          `
          id,
          amount_earned,
          date,
          referred_user:users!referral_logs_referred_user_id_fkey(email, name)
        `
        )
        .eq('referrer_id', (user as any).id)
        .order('date', { ascending: false });

      if (logsError) throw logsError;

      setReferrals(referralsData || []);
      setReferralLogs(logsData || []);
      setTotalEarnings((logsData || []).reduce((sum, log) => sum + Number(log.amount_earned), 0));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to load referral data');
      setReferrals(mockReferrals);
      setReferralLogs(mockReferralLogs);
      setTotalEarnings(mockReferralLogs.reduce((s, l) => s + l.amount_earned, 0));
      toast.error('Using demo data - connection to database failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    await fetchReferralData();
    await refreshData();
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleSetupPayout = async () => {
    setSetupLoading(true);
    try {
      const onboardingUrl = await setupStripeAccount();
      if (onboardingUrl) window.location.href = onboardingUrl;
    } catch (error) {
      toast.error('Failed to setup payout account');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    await checkAccountStatus();
    await refreshData();
  };

  const handlePayoutSuccess = () => {
    refreshData();
    setIsPayoutModalOpen(false);
  };

  const getPayoutStatusBadge = (status: string) => {
    const base = 'inline-flex px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
        case 'completed':
          return `${base} bg-green-900/30 text-green-300`;
        case 'processing':
          return `${base} bg-blue-900/30 text-blue-300`;
        case 'pending':
          return `${base} bg-blue-900/30 text-blue-300`;
        case 'failed':
        case 'cancelled':
          return `${base} bg-red-900/30 text-red-300`;
        default:
          return `${base} bg-zinc-800 text-zinc-300`;
    }
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
          return <CheckCircle className="text-green-400" size={16} />;
        case 'processing':
          return <Clock className="text-blue-400" size={16} />;
        case 'pending':
          return <Clock className="text-blue-400" size={16} />;
        case 'failed':
        case 'cancelled':
          return <XCircle className="text-red-400" size={16} />;
        default:
          return <AlertCircle className="text-zinc-400" size={16} />;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // 🔒 Gate the whole page to paid users only
  if (restrictionsLoading) {
    return (
      <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="ml-3 text-zinc-400">Checking your access…</p>
          </div>
      </Layout>
    );
  }

  if (!checkAccess('referrals')) {
    return (
      <PlanRestrictedPage
        feature="referrals"
        currentPlan={restrictions?.plan || 'free'}
        isTrialActive={restrictions?.isTrialActive}
        trialDaysRemaining={restrictions?.trialDaysRemaining}
      />
    );
  }

  // Loading state (data)
    if ((loading && payoutLoading) || (loading && !pageError && !payoutError)) {
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-zinc-400">Loading referral network...</p>
          </div>
        </div>
      );
    }

  // Critical error state
  if (pageError && payoutError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className={`${card} max-w-md w-full p-8 text-center`}>
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-zinc-100 mb-4">Unable to Load Network Page</h1>
          <p className="text-zinc-400 mb-6">
            We're having trouble connecting to our services. Please check your internet connection and try again.
          </p>
          <div className="space-y-2 text-sm text-zinc-400 mb-6 text-left">
            <p><strong>Referral Error:</strong> {pageError}</p>
            <p><strong>Payout Error:</strong> {payoutError}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-zinc-100 py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-0">
        {(pageError || payoutError) && (
          <div className="mb-6 rounded-xl p-4 border border-blue-800 bg-blue-900/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-blue-300 font-medium">Demo Mode Active</h3>
                <p className="text-blue-400 text-sm mt-1">
                  We're showing demo data because we couldn't connect to the database.
                  Your actual referral data will appear once the connection is restored.
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-blue-300 hover:underline text-sm font-medium"
                >
                  Try to reconnect
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className={h1}>Referral Network</h1>
          <p className={pSub}>Share your referral link and earn commissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${card} p-6`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-zinc-100">{referrals.length}</p>
                </div>
              </div>
            </div>

          <div className={`${card} p-6`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Paid Referrals</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {referrals.filter((r) => r.subscription_status === 'paid').length}
                </p>
              </div>
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Earnings</p>
                <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Section */}
        <div className={`${card} p-6 mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <div>
            <h2 className={h2 + ' flex items-center'}>
              <Wallet className="mr-2 text-green-400" size={24} />
              Payout Management
            </h2>
              <p className={pSub + ' mt-1'}>Manage your earnings and request payouts</p>
            </div>
            <button
              onClick={handleCheckStatus}
              className="inline-flex items-center px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh Status
            </button>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Earnings */}
              <div className="rounded-lg p-6 border border-green-800 bg-green-900/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">Available Earnings</h3>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      {formatCurrency(availableEarnings)}
                    </p>
                    <p className="text-sm text-green-400 mt-1">Ready for withdrawal</p>
                  </div>
                  <DollarSign className="text-green-400" size={32} />
                </div>

              {payoutDetails?.payout_enabled ? (
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  disabled={availableEarnings < 20}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-zinc-100 font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpRight size={16} className="mr-2" />
                  Request Payout
                </button>
              ) : (
                <button
                  onClick={handleSetupPayout}
                  disabled={setupLoading}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-zinc-100 font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {setupLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      Setup Payout Account
                    </>
                  )}
                </button>
              )}

                {availableEarnings < 20 && (
                  <p className="text-xs text-green-400 mt-2 text-center">Minimum payout: $20.00</p>
                )}
            </div>

            {/* Payout Account Status */}
            <div className="rounded-lg p-6 border border-blue-800 bg-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300">Payout Account</h3>
                  <div className="mt-2">
                    {payoutDetails ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={
                              payoutDetails.payout_enabled
                                ? 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-300'
                                : 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-300'
                            }
                          >
                            {payoutDetails.payout_enabled ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        {payoutDetails.bank_account_last4 && (
                          <p className="text-sm text-blue-300">
                            Bank: •••• {payoutDetails.bank_account_last4} ({payoutDetails.bank_account_country})
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-300">
                        Not Set Up
                      </span>
                    )}
                  </div>
                </div>
                <Bank className="text-blue-400" size={32} />
              </div>

              {!payoutDetails?.payout_enabled && (
                <div className="rounded-lg p-3 mb-4 border border-blue-800 bg-blue-900/20">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium">Account verification required</p>
                      <p className="mt-1">Complete your Stripe Connect setup to receive payouts.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payout History */}
        {payoutRequests.length > 0 && (
          <div className={`${card} p-6 mb-8`}>
              <h2 className={h2 + ' mb-4'}>Payout History</h2>
              <div className={tableWrap}>
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-800/60">
                    <tr>
                      <th className={thBase}>Amount</th>
                      <th className={thBase}>Status</th>
                      <th className={thBase}>Requested</th>
                      <th className={thBase}>Processed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {payoutRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={tdStrong}>{formatCurrency(request.amount_requested)}</div>
                          <div className={tdMuted}>Net: {formatCurrency(request.amount_net)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getPayoutStatusIcon(request.status)}
                          <span className={getPayoutStatusBadge(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        {request.failure_reason && (
                          <p className="text-xs text-red-400 mt-1">{request.failure_reason}</p>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${tdMuted}`}>{formatDate(request.requested_at)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${tdMuted}`}>
                        {request.processed_at ? formatDate(request.processed_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Referral Link */}
        <div className={`${card} p-6 mb-8`}>
          <h2 className={h2 + ' mb-4'}>Your Referral Link</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full px-4 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-200 placeholder-zinc-500"
                />
            </div>
            <button
              onClick={copyReferralLink}
              className="flex items-center px-4 py-2 bg-blue-600 text-zinc-100 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className={pSub + ' text-sm mt-2'}>Share this link to earn 20% commission on each paid subscription</p>
        </div>

        {/* Referrals List */}
        <div className={`${card} p-6 mb-8`}>
          <h2 className={h2 + ' mb-4'}>My Referrals</h2>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">No referrals yet</p>
              <p className="text-sm text-zinc-400 mt-2">Share your link to start earning commissions</p>
            </div>
          ) : (
            <div className={tableWrap}>
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/60">
                  <tr>
                    <th className={thBase}>User</th>
                    <th className={thBase}>Status</th>
                    <th className={thBase}>Registration Date</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {referrals.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={tdStrong}>{referral.referred_user?.name || 'User'}</div>
                          <div className={tdMuted}>{referral.referred_user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={
                            referral.subscription_status === 'paid'
                              ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-300'
                              : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-300'
                          }
                        >
                          {referral.subscription_status === 'paid' ? 'Paid' : 'Trial'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${tdMuted}`}>{formatDate(referral.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Earnings History */}
        <div className={`${card} p-6`}>
          <h2 className={h2 + ' mb-4'}>Earnings History</h2>
          {referralLogs.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">No earnings yet</p>
              <p className="text-sm text-zinc-400 mt-2">
                Your commissions will appear here when your referrals subscribe
              </p>
            </div>
          ) : (
            <div className={tableWrap}>
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/60">
                  <tr>
                    <th className={thBase}>User</th>
                    <th className={thBase}>Commission</th>
                    <th className={thBase}>Date</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {referralLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={tdStrong}>{log.referred_user?.name || 'User'}</div>
                          <div className={tdMuted}>{log.referred_user?.email}</div>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-400">
                            {formatCurrency(Number(log.amount_earned))}
                          </span>
                        </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${tdMuted}`}>{formatDate(log.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout Modal */}
        <PayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => setIsPayoutModalOpen(false)}
          availableEarnings={availableEarnings}
          onSuccess={handlePayoutSuccess}
        />
      </div>
    </Layout>
  );
}
