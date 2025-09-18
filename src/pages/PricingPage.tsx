import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
      name: 'Free',
      description: 'Perfect for getting started with freelancing',
      price: '$0',
      period: 'forever',
      popular: false,
      features: {
        clients: 'Up to 5 clients',
        orders: 'Up to 10 orders per month',
        templates: '3 message templates',
        analytics: 'Basic statistics',
        support: 'Email support',
        storage: '1 GB storage',
        integrations: 'Basic integrations',
        calendar: false,
        referrals: false,
        advanced_stats: false,
        google_calendar: false,
        vip_badge: false,
        free_trial: false
      },
      limitations: [
        'Limited templates',
        'Basic reports only',
        'No calendar access',
        'No referral program',
        'No advanced statistics'
      ],
      cta: 'Get Started Free',
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
      name: isPro ? 'Pro' : 'Excellence',
      description: product.description,
      price: product.price,
      period: isYearly ? 'per year' : 'per month',
      popular: isPro && !isYearly,
      bestValue: !isPro && isYearly,
      hasFreeTrial,
      features: {
        clients: 'Unlimited clients',
        orders: 'Unlimited orders',
        templates: 'Unlimited message templates',
        analytics: isPro ? 'Advanced analytics' : 'Advanced analytics & custom reports',
        support: isPro ? 'Priority email support' : '24/7 phone & email support',
        storage: isPro ? '50 GB storage' : '500 GB storage',
        integrations: isPro ? 'All integrations' : 'All integrations + custom ones',
        calendar: true,
        referrals: true,
        advanced_stats: !isPro,
        google_calendar: !isPro,
        vip_badge: !isPro,
        free_trial: true
      },
      cta: isPro ? 'Start 7-Day Free Trial' : `Upgrade to Excellence`,
      ctaStyle: isPro 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
      priceId: product.priceId,
      savings: isYearly ? calculateSavings(isPro ? 'pro' : 'excellence') : null
    };
  });

  const allPlans = [plans[0], ...dynamicPlans];

  const allFeatures = [
    { key: 'clients', label: 'Client Management', icon: Users },
    { key: 'orders', label: 'Order Tracking', icon: ShoppingCart },
    { key: 'templates', label: 'Message Templates', icon: MessageSquare },
    { key: 'analytics', label: 'Analytics & Reporting', icon: BarChart3 },
    { key: 'calendar', label: 'Calendar Access', icon: Calendar },
    { key: 'referrals', label: 'Referral Program', icon: Share2 },
    { key: 'advanced_stats', label: 'Advanced Statistics', icon: BarChart3 },
    { key: 'google_calendar', label: 'Google Calendar Integration', icon: Globe },
    { key: 'vip_badge', label: 'VIP Dashboard Badge', icon: Crown },
    { key: 'support', label: 'Customer Support', icon: HelpCircle },
    { key: 'storage', label: 'File Storage', icon: Shield },
    { key: 'integrations', label: 'Platform Integrations', icon: Globe },
    { key: 'free_trial', label: '7-Day Free Trial', icon: Star }
  ];

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. If you upgrade mid-cycle, you\'ll be charged a prorated amount.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'We offer a 7-day free trial for all paid plans. No credit card required to start. You can explore all features and decide which plan works best for you.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan features until the end of your current billing period. No cancellation fees.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied within the first 30 days, we\'ll provide a full refund, no questions asked.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade security with 256-bit SSL encryption, regular security audits, and comply with GDPR and SOC 2 standards. Your data is backed up daily and stored securely.'
    },
    {
      question: 'Can I import my existing data?',
      answer: 'Yes, we provide free data migration assistance for all paid plans. Our team will help you import your clients, orders, and other data from spreadsheets or other platforms.'
    },
    {
      question: 'Do you offer team accounts?',
      answer: 'Yes, our Professional and Enterprise plans support team collaboration. You can invite team members, set permissions, and manage multiple users under one account.'
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
              <Link to="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <span className="text-blue-600 font-medium">Pricing</span>
              <Link to="/support" className="text-gray-600 hover:text-gray-900 transition-colors">Support</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Dashboard
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Started
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
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your freelance business. Start free, upgrade when you're ready to scale.
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
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save up to 17%
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
                      Most Popular
                    </span>
                  </div>
                )}

                {(plan as any).bestValue && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                      <Crown size={14} className="mr-2" />
                      Best Value
                    </span>
                  </div>
                )}

                {(plan as any).savings && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Save {(plan as any).savings}%
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  {(plan as any).hasFreeTrial && (
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
                      <Star size={14} className="mr-1" />
                      7-Day Free Trial
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
                      Save {(plan as any).savings}%
                    </div>
                  )}
                </div>

                {(plan as any).hasFreeTrial && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="text-blue-600" size={16} />
                      <h4 className="text-sm font-semibold text-blue-900">Free Trial Details</h4>
                    </div>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 7 days of full Pro access</li>
                      <li>• Credit card required (not charged during trial)</li>
                      <li>• Cancel anytime before trial ends</li>
                      <li>• Automatic billing starts after trial</li>
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
                      <span className="text-gray-700">Calendar access</span>
                    </li>
                  )}
                  
                  {(plan.features as any).referrals && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">Referral program</span>
                    </li>
                  )}
                  
                  {(plan.features as any).advanced_stats && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">Advanced statistics</span>
                    </li>
                  )}
                  
                  {(plan.features as any).google_calendar && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">Google Calendar integration</span>
                    </li>
                  )}
                  
                  {(plan.features as any).vip_badge && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">VIP badge in dashboard</span>
                    </li>
                  )}
                  
                  {(plan.features as any).free_trial && (
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700">7-day free trial</span>
                    </li>
                  )}
                </ul>

                {plan.limitations && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Limitations:</p>
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
                    Credit card required • Cancel anytime during trial
                  </p>
                ) : plan.name !== 'Free' && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Immediate billing • Cancel anytime
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
              Compare all features
            </h2>
            <p className="text-xl text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                    {allPlans.map((plan, index) => (
                      <th key={index} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {plan.name}
                        {plan.popular && (
                          <span className="block text-xs text-blue-600 font-normal mt-1">Most Popular</span>
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
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans
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
            30-Day Money-Back Guarantee
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Try FiverFlow risk-free. If you're not completely satisfied within 30 days, 
            we'll refund your money, no questions asked.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              No long-term contracts
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to grow your freelance business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful freelancers who trust FiverFlow to manage their business.
          </p>
          
          <Link
            to={user ? "/dashboard" : "/register"}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-full hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {user ? "Go to Dashboard" : "Start Your Free Trial"}
            <ArrowRight size={20} className="ml-2" />
          </Link>
          
          <p className="text-blue-100 text-sm mt-4">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PricingPage;