// src/pages/NetworkPage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { useReferrals } from '../hooks/useReferrals';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { usePayouts } from '../hooks/usePayouts';
import PayoutModal from '../components/PayoutModal';
import { useReferralLink } from '../hooks/useReferralLink';
import toast from 'react-hot-toast';
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
  Ban as Bank,
  Loader2
} from 'lucide-react';


export default function NetworkPage() {
  const { user } = useAuth();
  const { currency } = useCurrency();

  // 🔒 Plan access
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  // 🔗 Referral data
  const { 
    referrals, 
    referralLogs, 
    totalEarnings, 
    loading: referralLoading, 
    error: referralError,
    refreshData: refreshReferralData 
  } = useReferrals();

  const {
    payoutDetails,
    payoutRequests,
    availableEarnings,
    loading: payoutLoading,
    error: payoutError,
    setupStripeAccount,
    checkAccountStatus,
    requestPayout,
    refreshData: refreshPayoutData
  } = usePayouts();

  const [copied, setCopied] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  
  // Use referral link hook for centralized link generation
  const { referralLink, referralCode, isReady } = useReferralLink({
    username: userProfile?.username || (user as any)?.username
  });

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, name, email')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error loading user profile:', error);
        } else {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    
    loadUserProfile();
  }, [user?.id]);

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

  const handleRetry = async () => {
    await refreshReferralData();
    await refreshPayoutData();
  };

  const generateUsername = async () => {
    if (!user) {
      toast.error('User not found');
      return;
    }
    
    setIsGeneratingUsername(true);
    try {
      console.log('🔄 Generating username for user:', user.id);
      
      // First, let's check if user already has a username
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('username, name, email')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        toast.error('Failed to fetch user data');
        return;
      }
      
      if (existingUser.username) {
        toast.success('You already have a username: ' + existingUser.username);
        setUserProfile(existingUser); // Update local state
        return;
      }
      
      // Generate a username based on user's name or email
      let baseUsername = '';
      if (existingUser.name) {
        baseUsername = existingUser.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      } else if (existingUser.email) {
        baseUsername = existingUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      } else {
        baseUsername = 'user';
      }
      
      // Ensure minimum length
      if (baseUsername.length < 3) {
        baseUsername = baseUsername + '123';
      }
      
      // Try to generate a unique username
      let newUsername = baseUsername;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.floor(Math.random() * 10000);
        newUsername = baseUsername + randomSuffix;
        
        // Check if username is available
        try {
          const { data: isAvailable, error: checkError } = await supabase.rpc('is_username_available', {
            username_to_check: newUsername
          });
          
          if (checkError) {
            console.warn('RPC function not available, using direct query:', checkError);
            // Fallback: direct database query
            const { data: existingUsers, error: directError } = await supabase
              .from('users')
              .select('username')
              .eq('username', newUsername)
              .limit(1);
            
            if (directError) {
              console.error('Error checking username availability:', directError);
              toast.error('Failed to check username availability');
              return;
            }
            
            if (!existingUsers || existingUsers.length === 0) {
              break; // Username is available
            }
          } else if (isAvailable) {
            break; // Username is available
          }
        } catch (rpcError) {
          console.warn('RPC function not available, using direct query:', rpcError);
          // Fallback: direct database query
          const { data: existingUsers, error: directError } = await supabase
            .from('users')
            .select('username')
            .eq('username', newUsername)
            .limit(1);
          
          if (directError) {
            console.error('Error checking username availability:', directError);
            toast.error('Failed to check username availability');
            return;
          }
          
          if (!existingUsers || existingUsers.length === 0) {
            break; // Username is available
          }
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        // Fallback: use user ID
        newUsername = 'user' + user.id.substring(0, 8).replace(/-/g, '');
      }
      
      console.log('📝 Generated username:', newUsername);
      
      // Update user profile with new username
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating username:', updateError);
        toast.error('Failed to update username: ' + updateError.message);
      } else {
        console.log('✅ Username updated successfully');
        toast.success('Username generated successfully: ' + newUsername);
        // Update local state instead of reloading
        setUserProfile(prev => ({ ...prev, username: newUsername }));
      }
    } catch (error) {
      console.error('💥 Unexpected error generating username:', error);
      toast.error('An unexpected error occurred: ' + (error as Error).message);
    } finally {
      setIsGeneratingUsername(false);
    }
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
    await refreshPayoutData();
  };

  const handlePayoutSuccess = () => {
    refreshPayoutData();
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
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // 🔒 Gate the whole page to paid users only
  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-3 text-zinc-400">Loading...</p>
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
    if ((referralLoading && payoutLoading) || (referralLoading && !referralError && !payoutError)) {
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-zinc-400">{'Loading referral network...'}</p>
          </div>
        </div>
      );
    }

  // Critical error state
  if (referralError && payoutError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className={`${card} max-w-md w-full p-8 text-center`}>
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-zinc-100 mb-4">{'Unable to Load Network Page'}</h1>
          <p className="text-zinc-400 mb-6">
            {'We\'re having trouble connecting to our services. Please check your internet connection and try again.'}
          </p>
          <div className="space-y-2 text-sm text-zinc-400 mb-6 text-left">
            <p><strong>{'Referral Error:'}</strong> {referralError}</p>
            <p><strong>{'Payout Error:'}</strong> {payoutError}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-zinc-100 py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {(referralError || payoutError) && (
          <div className="mb-6 rounded-xl p-4 border border-blue-800 bg-blue-900/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-blue-300 font-medium">{'Demo Mode Active'}</h3>
                <p className="text-blue-400 text-sm mt-1">
                  {'We\'re showing demo data because we couldn\'t connect to the database. Your actual referral data will appear once the connection is restored.'}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-blue-300 hover:underline text-sm font-medium"
                >
                  {'Try to reconnect'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Referral Network</h1>
          <p className="text-gray-400">Share your referral link and earn commissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${card} p-6`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">{'Total Referrals'}</p>
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
                <p className="text-sm font-medium text-zinc-400">{'Paid Referrals'}</p>
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
                <p className="text-sm font-medium text-zinc-400">{'Total Earnings'}</p>
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
              {'Payout Management'}
            </h2>
              <p className={pSub + ' mt-1'}>{'Manage your earnings and request payouts'}</p>
            </div>
            <button
              onClick={handleCheckStatus}
              className="inline-flex items-center px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              {'Refresh Status'}
            </button>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Earnings */}
              <div className="rounded-lg p-6 border border-green-800 bg-green-900/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">{'Available Earnings'}</h3>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      {formatCurrency(availableEarnings)}
                    </p>
                    <p className="text-sm text-green-400 mt-1">{'Ready for withdrawal'}</p>
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
                  {'Request Payout'}
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
                      {'Setting up...'}
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      {'Setup Payout Account'}
                    </>
                  )}
                </button>
              )}

                {availableEarnings < 20 && (
                  <p className="text-xs text-green-400 mt-2 text-center">{'Minimum payout: $20.00'}</p>
                )}
            </div>

            {/* Payout Account Status */}
            <div className="rounded-lg p-6 border border-blue-800 bg-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300">{'Payout Account'}</h3>
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
                            {'Bank:'} •••• {payoutDetails.bank_account_last4} ({payoutDetails.bank_account_country})
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-300">
                        {'Not Set Up'}
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
                      <p className="font-medium">{'Account verification required'}</p>
                      <p className="mt-1">{'Complete your Stripe Connect setup to receive payouts.'}</p>
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
              <h2 className={h2 + ' mb-4'}>{'Payout History'}</h2>
              <div className={tableWrap}>
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-800/60">
                    <tr>
                      <th className={thBase}>{'Amount'}</th>
                      <th className={thBase}>{'Status'}</th>
                      <th className={thBase}>{'Requested'}</th>
                      <th className={thBase}>{'Processed'}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {payoutRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={tdStrong}>{formatCurrency(request.amount_requested)}</div>
                          <div className={tdMuted}>{'Net:'} {formatCurrency(request.amount_net)}</div>
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
          <h2 className={h2 + ' mb-4'}>{'Your Referral Link'}</h2>
          
          {!referralCode ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">You don't have a username yet. Generate one to create your referral link.</p>
              <button
                onClick={generateUsername}
                disabled={isGeneratingUsername}
                className="flex items-center px-6 py-3 bg-blue-600 text-zinc-100 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                {isGeneratingUsername ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {'Generating...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {'Generate Username'}
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
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
                      {'Copied!'}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {'Copy'}
                    </>
                  )}
                </button>
                <button
                  onClick={generateUsername}
                  disabled={isGeneratingUsername}
                  className="flex items-center px-4 py-2 bg-zinc-700 text-zinc-100 rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate new username"
                >
                  {isGeneratingUsername ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className={pSub + ' text-sm mt-2'}>{'Share this link to earn 20% commission on each paid subscription'}</p>
            </>
          )}
        </div>

        {/* Referrals List */}
        <div className={`${card} p-6 mb-8`}>
          <h2 className={h2 + ' mb-4'}>{'My Referrals'}</h2>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">{'No referrals yet'}</p>
              <p className="text-sm text-zinc-400 mt-2">{'Share your link to start earning commissions'}</p>
            </div>
          ) : (
            <div className={tableWrap}>
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/60">
                  <tr>
                    <th className={thBase}>{'User'}</th>
                    <th className={thBase}>{'Status'}</th>
                    <th className={thBase}>{'Registration Date'}</th>
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
          <h2 className={h2 + ' mb-4'}>{'Earnings History'}</h2>
          {referralLogs.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">{'No earnings yet'}</p>
              <p className="text-sm text-zinc-400 mt-2">
                {'Your commissions will appear here when your referrals subscribe'}
              </p>
            </div>
          ) : (
            <div className={tableWrap}>
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/60">
                  <tr>
                    <th className={thBase}>{'User'}</th>
                    <th className={thBase}>{'Commission'}</th>
                    <th className={thBase}>{'Date'}</th>
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
