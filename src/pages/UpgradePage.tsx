// src/pages/UpgradePage.tsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
import { getMonthlyProducts, getYearlyProducts } from '../stripe-config';
import toast from 'react-hot-toast';
import { Check, Crown, Star, Zap } from 'lucide-react';

type Billing = 'monthly' | 'yearly';

const UpgradePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { subscription, loading: subscriptionLoading, createCheckoutSession } = useStripeSubscription();
  const [billingCycle, setBillingCycle] = useState<Billing>('monthly');
  const [processingPriceId, setProcessingPriceId] = useState<string | null>(null);

  const getDisplayedProducts = () => (billingCycle === 'monthly' ? getMonthlyProducts() : getYearlyProducts());
  const displayedProducts = getDisplayedProducts();

  // ---- Correct mapping with your usePlanRestrictions price ids
  const getCurrentPlan = () => {
    if (!subscription?.price_id) return 'free';
    switch (subscription.price_id) {
      // PRO (monthly / yearly)
      case 'price_1RoRLDENcVsHr4WI6TViAPNb':
      case 'price_1RoXOgENcVsHr4WIitiOEaaz':
        return 'pro';
      // EXCELLENCE (monthly / yearly)  <-- fixed monthly id
      case 'price_1RoRMdENcVsHr4WIVRYCy8JL':
      case 'price_1RoXNwENcVsHr4WI3SP8AYYu':
        return 'excellence';
      default:
        return 'free';
    }
  };

  const isCurrentPlan = (priceId: string) => subscription?.price_id === priceId;

  const calculateSavings = (planType: 'pro' | 'excellence') => {
    const monthlyProducts = getMonthlyProducts();
    const yearlyProducts = getYearlyProducts();

    const monthly = monthlyProducts.find(p => p.name.toLowerCase().includes(planType));
    const yearly = yearlyProducts.find(p => p.name.toLowerCase().includes(planType));
    if (!monthly || !yearly) return 0;

    const monthlyPrice = parseFloat(monthly.price.replace(/[^0-9.]/g, ''));
    const yearlyPrice = parseFloat(yearly.price.replace(/[^0-9.]/g, ''));
    const monthlyCost = monthlyPrice * 12;
    if (!monthlyCost) return 0;

    const savingsPct = Math.round(((monthlyCost - yearlyPrice) / monthlyCost) * 100);
    return Math.max(0, savingsPct);
  };

  const handleUpgrade = async (priceId: string) => {
    if (!user) {
      toast.error(t('toast.upgrade.signin'));
      return;
    }

    const product = displayedProducts.find(p => p.priceId === priceId);
    const isPro = product?.name.toLowerCase().includes('pro');
    const trialDays = isPro ? 7 : undefined;

    setProcessingPriceId(priceId);
    const checkoutUrl = await createCheckoutSession(priceId, 'subscription', trialDays);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setProcessingPriceId(null);
    }
  };

  const currentPlan = getCurrentPlan();

  // ----- Plans Feature Sets (accurate for your gating rules)
  const freePlan = {
    name: t('upgrade.plan.free'),
    price: '$0',
    period: 'forever',
    description: t('upgrade.plan.free.desc'),
    // Matches: can't access calendar/tasks/referrals/stats/invoices
    features: [
      t('upgrade.features.clients.limit').replace('{count}', '5'),
      t('upgrade.features.orders.limit').replace('{count}', '10'),
      t('upgrade.features.templates.limit').replace('{count}', '3'),
      t('upgrade.features.dashboard'),
      t('upgrade.features.themes'),
      t('upgrade.features.support.email')
    ],
    limitations: [
      t('upgrade.features.no.tasks'),
      t('upgrade.features.no.calendar'),
      t('upgrade.features.no.referrals'),
      t('upgrade.features.no.stats'),
      t('upgrade.features.no.invoices')
    ],
    current: currentPlan === 'free',
    buttonText: t('upgrade.plan.current'),
    buttonStyle: 'bg-gray-300 text-gray-700 dark:bg-slate-700 dark:text-slate-300 cursor-not-allowed',
    disabled: true
  };

  // Convert Stripe products to UI cards with plan-accurate features
  const dynamicPlans = displayedProducts.map(product => {
    const isPro = product.name.toLowerCase().includes('pro');
    const isYear = product.interval === 'year';
    const savings = isYear ? calculateSavings(isPro ? 'pro' : 'excellence') : null;
    const isActive = isCurrentPlan(product.priceId);

    // Plan features aligned to your app rules
    const features = isPro
      ? [
          t('upgrade.features.clients.unlimited'),
          t('upgrade.features.orders.unlimited'),
          t('upgrade.features.templates.unlimited'),
          t('upgrade.features.tasks'),
          t('upgrade.features.calendar'),
          t('upgrade.features.referrals'),
          t('upgrade.features.integrations.basic'),
          t('upgrade.features.support.standard')
        ]
      : [
          t('upgrade.features.all.pro'),
          t('upgrade.features.stats'),
          t('upgrade.features.invoices'),
          t('upgrade.features.integrations.advanced'),
          t('upgrade.features.support.priority'),
          t('upgrade.features.team')
        ];

    return {
      name: isPro ? t('upgrade.plan.pro') : t('upgrade.plan.excellence'),
      price: product.price,
      period: isYear ? 'per year' : 'per month',
      description: isPro
        ? t('upgrade.plan.pro.desc')
        : t('upgrade.plan.excellence.desc'),
      features,
      popular: isPro && !isYear, // highlight Pro monthly as "Most Popular"
      hasFreeTrial: isPro,       // Pro has 7‑day trial
      buttonText: isActive ? t('upgrade.plan.current') : `${t('upgrade.plan.upgrade')} ${isPro ? t('upgrade.plan.pro') : t('upgrade.plan.excellence')}`,
      buttonStyle: isActive
        ? 'bg-gray-300 text-gray-700 dark:bg-slate-700 dark:text-slate-300 cursor-not-allowed'
        : isPro
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-purple-600 text-white hover:bg-purple-700',
      priceId: product.priceId,
      disabled: isActive,
      savings
    };
  });

  const allPlans = [freePlan, ...dynamicPlans];

  const benefits = [
    {
      icon: Crown,
      title: t('upgrade.benefits.premium.title'),
      description: t('upgrade.benefits.premium.desc')
    },
    {
      icon: Zap,
      title: t('upgrade.benefits.workflow.title'),
      description: t('upgrade.benefits.workflow.desc')
    },
    {
      icon: Star,
      title: t('upgrade.benefits.support.title'),
      description: t('upgrade.benefits.support.desc')
    }
  ];

  if (subscriptionLoading) {
    return (
      <Layout>
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="ml-4 text-gray-600 dark:text-slate-300">{t('upgrade.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('upgrade.title')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('upgrade.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-1 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('upgrade.billing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('upgrade.billing.yearly')}
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {t('upgrade.billing.save')} {Math.max(calculateSavings('pro'), calculateSavings('excellence'))}%
              </span>
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 min-w-0"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                  <Icon className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 break-words">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pricing Plans */}
        <div className={`grid grid-cols-1 ${allPlans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 sm:gap-8`}>
          {allPlans.map((plan: any, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 p-6 sm:p-8 min-w-0 ${
                plan.popular ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                    {t('upgrade.plan.popular')}
                  </span>
                </div>
              )}

              {plan.savings ? (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    {t('upgrade.billing.save')} {plan.savings}%
                  </span>
                </div>
              ) : null}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-slate-300 ml-2">{plan.period}</span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 break-words">{plan.description}</p>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-slate-200 break-words">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Limitations:</p>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation: string, limitIndex: number) => (
                      <li key={limitIndex} className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 break-words">
                        • {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className={`w-full py-2 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                  plan.buttonStyle
                } ${
                  plan.disabled || processingPriceId === plan.priceId
                    ? 'cursor-not-allowed'
                    : 'hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                disabled={plan.disabled || processingPriceId === plan.priceId}
                onClick={() => {
                  if (!user) {
                    toast.error('Please sign in to upgrade.');
                    return;
                  }
                  if (!plan.disabled && plan.priceId) handleUpgrade(plan.priceId);
                }}
              >
                {processingPriceId === plan.priceId ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </div>
                ) : plan.hasFreeTrial ? (
                  <>
                    <Star size={16} className="mr-2" />
                    Start 7‑Day Free Trial
                  </>
                ) : (
                  plan.buttonText
                )}
              </button>

              {plan.hasFreeTrial && !plan.disabled ? (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="text-blue-600 dark:text-blue-400" size={16} />
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Free Trial Details</h4>
                    </div>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• 7 days of full Pro access</li>
                      <li>• Credit card required (no charge during trial)</li>
                      <li>• Cancel anytime before trial ends</li>
                      <li>• Billing starts after trial</li>
                    </ul>
                  </div>
                  <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-3">
                    Credit card required • Cancel anytime during trial
                  </p>
                </>
              ) : plan.name !== 'Free' && !plan.disabled ? (
                <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-3">
                  Immediate billing • Cancel anytime
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 sm:p-6 lg:p-8 mt-12 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm break-words">
                Yes—upgrade or downgrade whenever you want. Changes apply to your next billing cycle.
              </p>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm break-words">
                Pro includes a 7‑day free trial. A credit card is required to start, but you won’t be charged during the trial.
              </p>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm break-words">
                We accept all major credit cards. Bank transfer is available for annual invoices on request.
              </p>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm break-words">
                Yes. You’ll retain access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

        {/* NOTE: Money‑back guarantee section removed per request */}
      </div>
    </Layout>
  );
};

export default UpgradePage;
