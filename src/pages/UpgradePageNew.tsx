import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  Crown, 
  Zap, 
  Rocket, 
  Check, 
  Star, 
  Users,
  BarChart3,
  Shield,
  Headphones,
  FileText,
  Calendar,
  Network,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';

interface PlanFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  icon: React.ReactNode;
  gradient: boolean;
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
  current?: boolean;
}

const UpgradePageNew: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('boost');
  const [isYearly, setIsYearly] = useState(false);

  const plans: Plan[] = [
    {
      id: 'lunch',
      name: 'Lunch',
      subtitle: 'Perfect for beginners',
      price: '0',
      period: 'free',
      description: 'All essential features to start your freelance business.',
      features: [
        {
          icon: <Users size={20} />,
          title: 'Up to 5 clients',
          description: 'Manage your first clients easily'
        },
        {
          icon: <FileText size={20} />,
          title: '10 orders per month',
          description: 'Track your first orders'
        },
        {
          icon: <Calendar size={20} />,
          title: 'Basic calendar',
          description: 'Organize your schedule'
        },
        {
          icon: <Shield size={20} />,
          title: 'Email support',
          description: 'Email assistance only'
        }
      ],
      icon: <Users size={24} />,
      gradient: false,
      current: true,
      buttonText: 'Current plan',
      buttonVariant: 'outline'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'For active freelancers',
      price: isYearly ? '240' : '24',
      period: isYearly ? 'year' : 'month',
      description: 'Increase your productivity with advanced tools and more capacity.',
      features: [
        {
          icon: <Users size={20} />,
          title: 'Unlimited clients',
          description: 'Manage as many clients as needed'
        },
        {
          icon: <FileText size={20} />,
          title: 'Unlimited orders',
          description: 'No limits on your orders'
        },
        {
          icon: <BarChart3 size={20} />,
          title: 'Advanced statistics',
          description: 'Detailed analysis of your performance'
        },
        {
          icon: <Calendar size={20} />,
          title: 'Smart calendar',
          description: 'Automatic planning and reminders'
        },
        {
          icon: <Network size={20} />,
          title: 'Partner network',
          description: 'Connect with other freelancers'
        },
        {
          icon: <Headphones size={20} />,
          title: 'Priority support',
          description: 'Fast assistance via chat and email'
        }
      ],
      icon: <Zap size={24} />,
      gradient: true,
      popular: true,
      buttonText: 'Upgrade to Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'For businesses',
      price: isYearly ? '590' : '59',
      period: isYearly ? 'year' : 'month',
      description: 'The complete solution to scale your business to new heights.',
      features: [
        {
          icon: <Crown size={20} />,
          title: 'Everything from Boost',
          description: 'All Boost features included'
        },
        {
          icon: <Users size={20} />,
          title: 'Team management',
          description: 'Collaborate with your team'
        },
        {
          icon: <Shield size={20} />,
          title: 'Complete API',
          description: 'Custom integrations'
        },
        {
          icon: <BarChart3 size={20} />,
          title: 'Advanced reports',
          description: 'Detailed analytics and insights'
        },
        {
          icon: <Headphones size={20} />,
          title: '24/7 support',
          description: 'Assistance available 24/7'
        },
        {
          icon: <Award size={20} />,
          title: 'Custom training',
          description: 'Dedicated training sessions'
        },
        {
          icon: <Sparkles size={20} />,
          title: 'Premium features',
          description: 'Early access to new features'
        }
      ],
      icon: <Rocket size={24} />,
      gradient: true,
      buttonText: 'Choose Scale',
      buttonVariant: 'primary'
    }
  ];

  const benefits = [
    {
      icon: <Clock size={24} />,
      title: 'Time saving',
      description: 'Automate your repetitive tasks and focus on what matters'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Accelerated growth',
      description: 'Develop your business with professional tools'
    },
    {
      icon: <Shield size={24} />,
      title: 'Guaranteed security',
      description: 'Your data is protected with bank-level encryption'
    },
    {
      icon: <Users size={24} />,
      title: 'Active community',
      description: 'Join a community of passionate freelancers'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'UI/UX Designer',
      avatar: 'MD',
      text: 'Boost allowed me to double my revenue in 3 months. The analytics tools are incredible!',
      plan: 'Boost'
    },
    {
      name: 'Pierre Martin',
      role: 'Full-Stack Developer',
      avatar: 'PM',
      text: 'Scale is perfect for my team. Collaborative management changes everything!',
      plan: 'Scale'
    },
    {
      name: 'Sophie Leroy',
      role: 'Digital Marketing',
      avatar: 'SL',
      text: 'Upgrading from Lunch to Boost was the best decision of my freelance career.',
      plan: 'Boost'
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="text-[#9c68f2]" size={32} />
            <h1 className="text-4xl font-bold text-white">
              Take it to the next level
            </h1>
          </div>
          <p className="text-xl text-gray-400 mb-8">
            Unlock the full potential of your freelance business with our premium plans
          </p>
          
          {/* Current Plan Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#35414e] rounded-full text-sm text-gray-300 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Current plan: Lunch
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isYearly ? 'bg-[#9c68f2]' : 'bg-[#35414e]'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>Yearly</span>
            {isYearly && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                -20% savings
              </span>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-[#9c68f2] text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Star size={12} />
                    Most popular
                  </div>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Check size={12} />
                    Current plan
                  </div>
                </div>
              )}
              
              <ModernCard 
                className={`h-full flex flex-col transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-[#9c68f2] scale-105' : 
                  plan.current ? 'ring-2 ring-green-500' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-[#9c68f2]' : ''}`}
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-4 bg-[#35414e] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9c68f2]/20 to-[#422ca5]/20"></div>
                    <div className="relative z-10 text-[#9c68f2]">
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.subtitle}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">
                      {plan.price === '0' ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price !== '0' && (
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                <div className="flex-1 mb-6">
                  <div className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#35414e]/50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#35414e] relative overflow-hidden flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#9c68f2]/30 to-[#422ca5]/30"></div>
                          <div className="relative z-10 text-[#9c68f2]">
                            {feature.icon}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                          <p className="text-xs text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ModernButton 
                  variant={plan.buttonVariant}
                  className={`w-full ${plan.gradient && !plan.current ? 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5] hover:from-[#8a5cf0] hover:to-[#3a2590]' : ''}`}
                  size="lg"
                  disabled={plan.current}
                >
                  {plan.current ? (
                    <>
                      <Check size={16} className="mr-2" />
                      {plan.buttonText}
                    </>
                  ) : (
                    <>
                      {plan.buttonText}
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </ModernButton>
              </ModernCard>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why upgrade?
            </h2>
            <p className="text-gray-400">
              Discover the benefits that will make the difference in your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <ModernCard key={index} className="text-center">
                <div className="w-16 h-16 bg-[#35414e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#9c68f2]">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              They made the leap
            </h2>
            <p className="text-gray-400">
              Discover testimonials from our premium users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <ModernCard key={index}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <span className="text-xs px-2 py-1 bg-[#9c68f2]/20 text-[#9c68f2] rounded-full">
                        {testimonial.plan}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{testimonial.role}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">"{testimonial.text}"</p>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and you only pay the difference."
              },
              {
                question: "Are there any setup fees?",
                answer: "No, there are no hidden setup fees. You only pay your monthly subscription."
              },
              {
                question: "What happens if I cancel my subscription?",
                answer: "You keep access to all premium features until the end of your billing period. After that, you return to the Lunch plan."
              },
              {
                question: "Do you offer a free trial?",
                answer: "Yes! We offer a 14-day free trial for all our premium plans. No credit card required."
              }
            ].map((faq, index) => (
              <ModernCard key={index}>
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center max-w-4xl mx-auto">
          <ModernCard className="p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9c68f2]/10 to-[#422ca5]/10"></div>
            <div className="relative z-10">
              <Crown size={48} className="text-white mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to transform your business?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join thousands of freelancers who have already taken the step towards success
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ModernButton size="lg" variant="secondary">
                  <Rocket size={20} className="mr-2" />
                  Try for free
                </ModernButton>
                <ModernButton size="lg" variant="outline">
                  <Headphones size={20} className="mr-2" />
                  Talk to an expert
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </Layout>
  );
};

export default UpgradePageNew;
