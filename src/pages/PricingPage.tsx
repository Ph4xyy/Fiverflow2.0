import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from "../components/footer";
import { stripeProducts, getMonthlyProducts, getYearlyProducts } from '../stripe-config';
import { 
  Check, 
  X, 
  Crown, 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  Users,
  MessageSquare,
  BarChart3,
  Globe,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShoppingCart,
  Calendar,
  Share2,
  Clock
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getDisplayedProducts = () => {
    return billingCycle === 'monthly' ? getMonthlyProducts() : getYearlyProducts();
  };

  const getSavingsPercentage = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - yearlyPrice;
    return Math.round((savings / monthlyCost) * 100);
  };

  const calculateSavings = (planType: 'pro' | 'excellence') => {
    const monthlyProducts = getMonthlyProducts();
    const yearlyProducts = getYearlyProducts();
    
    const monthlyProduct = monthlyProducts.find(p => 
      p.name.toLowerCase().includes(planType.toLowerCase())
    );
    const yearlyProduct = yearlyProducts.find(p => 
      p.name.toLowerCase().includes(planType.toLowerCase())
    );
    
    if (!monthlyProduct || !yearlyProduct) return 0;
    
    const monthlyPrice = parseFloat(monthlyProduct.price.replace(/[^0-9.]/g, ''));
    const yearlyPrice = parseFloat(yearlyProduct.price.replace(/[^0-9.]/g, ''));
    
    return getSavingsPercentage(monthlyPrice, yearlyPrice);
  };

  const plans = [
    {
      name: t('pricing.plan.free'),
      description: t('pricing.plan.free.desc'),
      price: '$0',
      period: 'forever',
      popular: false,
      features: {
        clients: t('pricing.features.clients.5'),
        orders: t('pricing.features.orders.10'),
        templates: t('pricing.features.templates.3'),
        analytics: t('pricing.features.analytics.basic'),
        support: t('pricing.features.support.email'),
        storage: t('pricing.features.storage.1gb'),
        integrations: t('pricing.features.integrations.basic'),
        calendar: false,
        referrals: false,
        advanced_stats: false,
        google_calendar: false,
        vip_badge: false,
        free_trial: false
      },
      limitations: [
        t('pricing.limitations.templates'),
        t('pricing.limitations.reports'),
        t('pricing.limitations.no.calendar'),
        t('pricing.limitations.no.referral'),
        t('pricing.limitations.no.stats')
      ],
      cta: t('pricing.plan.free.cta'),
      ctaStyle: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];

  // Get products for current billing cycle and create dynamic plans
  const displayedProducts = getDisplayedProducts();
  const dynamicPlans = displayedProducts.map(product => {
    const isPro = product.name.toLowerCase().includes('pro');
    const isYearly = product.interval === 'year';
    const hasFreeTrial = isPro; // Only Pro packages have free trial
    
    return {
      name: isPro ? t('pricing.plan.pro') : t('pricing.plan.excellence'),
      description: product.description,
      price: product.price,
      period: isYearly ? 'per year' : 'per month',
      popular: isPro && !isYearly,
      bestValue: !isPro && isYearly,
      hasFreeTrial,
      features: {
        clients: t('pricing.features.clients.unlimited'),
        orders: t('pricing.features.orders.unlimited'),
        templates: t('pricing.features.templates.unlimited'),
        analytics: isPro ? t('pricing.features.analytics.advanced') : t('pricing.features.analytics.reports'),
        support: isPro ? t('pricing.features.support.priority') : t('pricing.features.support.247'),
        storage: isPro ? t('pricing.features.storage.50gb') : t('pricing.features.storage.500gb'),
        integrations: isPro ? t('pricing.features.integrations.all') : t('pricing.features.integrations.custom'),
        calendar: true,
        referrals: true,
        advanced_stats: !isPro,
        google_calendar: !isPro,
        vip_badge: !isPro,
        free_trial: true
      },
      cta: isPro ? t('pricing.plan.start.trial') : t('pricing.plan.upgrade'),
      ctaStyle: isPro 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
      priceId: product.priceId,
      savings: isYearly ? calculateSavings(isPro ? 'pro' : 'excellence') : null
    };
  });

  const allPlans = [plans[0], ...dynamicPlans];

  const allFeatures = [
    { key: 'clients', label: t('pricing.features.clients'), icon: Users },
    { key: 'orders', label: t('pricing.features.orders'), icon: ShoppingCart },
    { key: 'templates', label: t('pricing.features.templates'), icon: MessageSquare },
    { key: 'analytics', label: t('pricing.features.analytics'), icon: BarChart3 },
    { key: 'calendar', label: t('pricing.features.calendar'), icon: Calendar },
    { key: 'referrals', label: t('pricing.features.referrals'), icon: Share2 },
    { key: 'advanced_stats', label: t('pricing.features.stats'), icon: BarChart3 },
    { key: 'google_calendar', label: t('pricing.features.gcal'), icon: Globe },
    { key: 'vip_badge', label: t('pricing.features.vip'), icon: Crown },
    { key: 'support', label: t('pricing.features.support'), icon: HelpCircle },
    { key: 'storage', label: t('pricing.features.storage'), icon: Shield },
    { key: 'integrations', label: t('pricing.features.integrations'), icon: Globe },
    { key: 'free_trial', label: t('pricing.features.trial'), icon: Star }
  ];

  const faqs = [
    {
      question: t('pricing.faq.change'),
      answer: t('pricing.faq.change.answer')
    },
    {
      question: t('pricing.faq.trial'),
      answer: t('pricing.faq.trial.answer')
    },
    {
      question: t('pricing.faq.payment'),
      answer: t('pricing.faq.payment.answer')
    },
    {
      question: t('pricing.faq.cancel'),
      answer: t('pricing.faq.cancel.answer')
    },
    {
      question: t('pricing.faq.refund'),
      answer: t('pricing.faq.refund.answer')
    },
    {
      question: t('pricing.faq.security'),
      answer: t('pricing.faq.security.answer')
    },
    {
      question: t('pricing.faq.import'),
      answer: t('pricing.faq.import.answer')
    },
    {
      question: t('pricing.faq.team'),
      answer: t('pricing.faq.team.answer')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FiverFlow
              </h1>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">{t('pricing.header.features')}</Link>
              <span className="text-blue-600 font-medium">{t('pricing.header.pricing')}</span>
              <Link to="/support" className="text-gray-600 hover:text-gray-900 transition-colors">{t('pricing.header.support')}</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t('pricing.header.dashboard')}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    {t('pricing.header.signin')}
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t('pricing.header.getstarted')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('pricing.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('pricing.hero.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('pricing.billing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('pricing.billing.yearly')}
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {t('pricing.billing.save')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 ${allPlans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
            {allPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.popular
                    ? 'border-blue-500 scale-105'
                    : (plan as any).bestValue
                    ? 'border-purple-500 scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-300 hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                      <Star size={14} className="mr-2" />
                      {t('pricing.plan.most.popular')}
                    </span>
                  </div>
                )}

                {(plan as any).bestValue && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                      <Crown size={14} className="mr-2" />
                      {t('pricing.plan.best.value')}
                    </span>
                  </div>
                )}

                {(plan as any).savings && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {t('pricing.billing.save').replace('17%', `${(plan as any).savings}%`)}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  {(plan as any).hasFreeTrial && (
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
                      <Star size={14} className="mr-1" />
                      {t('pricing.plan.trial')}
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.name !== 'Free' && (
                      <span className="text-gray-600 ml-2">
                        /{plan.period?.split(' ')[1] || 'month'}
                      </span>
                    )}
                  </div>
                  
                  {(plan as any).savings && (
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {t('pricing.billing.save').replace('17%', `${(plan as any).savings}%`)}
                    </div>
                  )}
                </div>

                {(plan as any).hasFreeTrial && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="text-blue-600" size={16} />
                      <h4 className="text-sm font-semibold text-blue-900">{t('pricing.trial.details')}</h4>
                    </div>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {t('pricing.trial.access')}</li>
                      <li>• {t('pricing.trial.card')}</li>
                      <li>• {t('pricing.trial.cancel')}</li>
                      <li>• {t('pricing.trial.billing')}</li>
                    </ul>
                  </div>
                )}

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{plan.features.clients}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{plan.features.orders}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{plan.features.templates}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{plan.features.analytics}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{plan.features.support}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{plan.features.storage}</span>
                  </li>
                  
                  {(plan.features as any).calendar && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{t('pricing.features.calendar.yes')}</span>
                    </li>
                  )}
                  
                  {(plan.features as any).referrals && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{t('pricing.features.referral.yes')}</span>
                    </li>
                  )}
                  
                  {(plan.features as any).advanced_stats && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{t('pricing.features.stats.yes')}</span>
                    </li>
                  )}
                  
                  {(plan.features as any).google_calendar && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{t('pricing.features.gcal.yes')}</span>
                    </li>
                  )}
                  
                  {(plan.features as any).vip_badge && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{t('pricing.features.vip.yes')}</span>
                    </li>
                  )}
                  
                  {(plan.features as any).free_trial && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{t('pricing.features.trial.yes')}</span>
                    </li>
                  )}
                </ul>

                {plan.limitations && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('pricing.limitations.title')}</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="text-sm text-gray-600 flex items-start">
                          <X className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" size={12} />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.name === 'Free' ? (
                  <Link
                    to={user ? "/dashboard" : "/register"}
                    className={`w-full py-4 px-6 rounded-full font-semibold transition-all duration-200 text-center block ${plan.ctaStyle} shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <a
                    href={`/upgrade?plan=${(plan as any).priceId}`}
                    className={`w-full py-4 px-6 rounded-full font-semibold transition-all duration-200 text-center block ${plan.ctaStyle} shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                  >
                    {(plan as any).hasFreeTrial ? (
                      <div className="flex items-center justify-center">
                        <Star size={16} className="mr-2" />
                        {plan.cta}
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </a>
                )}
                
                {(plan as any).hasFreeTrial ? (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {t('pricing.trial.card.cancel')}
                  </p>
                ) : plan.name !== t('pricing.plan.free') && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {t('pricing.payment.immediate')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pricing.comparison.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('pricing.comparison.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">{t('pricing.comparison.features')}</th>
                    {allPlans.map((plan, index) => (
                      <th key={index} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {plan.name}
                        {plan.popular && (
                          <span className="block text-xs text-blue-600 font-normal mt-1">{t('pricing.plan.most.popular')}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Icon className="text-gray-400 mr-3" size={20} />
                            <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                          </div>
                        </td>
                        {allPlans.map((plan, planIndex) => (
                          <td key={planIndex} className="px-6 py-4 text-center">
                            {typeof plan.features[feature.key as keyof typeof plan.features] === 'boolean' ? (
                              plan.features[feature.key as keyof typeof plan.features] ? (
                                <Check className="text-green-500 mx-auto" size={20} />
                              ) : (
                                <X className="text-gray-300 mx-auto" size={20} />
                              )
                            ) : (
                              <span className="text-sm text-gray-700">
                                {plan.features[feature.key as keyof typeof plan.features] as string}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pricing.faq.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('pricing.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="text-gray-500" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-500" size={20} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money Back Guarantee */}
      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Shield className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('pricing.guarantee.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('pricing.guarantee.subtitle')}
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              {t('pricing.guarantee.no.setup')}
            </div>
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              {t('pricing.guarantee.cancel')}
            </div>
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              {t('pricing.guarantee.no.contract')}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('pricing.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('pricing.cta.subtitle')}
          </p>
          
          <Link
            to={user ? "/dashboard" : "/register"}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-full hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {user ? t('pricing.cta.dashboard') : t('pricing.cta.trial')}
            <ArrowRight size={20} className="ml-2" />
          </Link>
          
          <p className="text-blue-100 text-sm mt-4">
            {t('pricing.cta.details')}
          </p>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PricingPage;