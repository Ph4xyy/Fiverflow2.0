import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3, 
  Crown,
  ArrowRight,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Globe,
  Award,
  ChevronRight,
  Play,
  HelpCircle,   // ✅ added
  BookOpen,     // ✅ added
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // ✅ Gère le scroll vers #features même quand on vient d'une autre page (/support -> /#features)
  useEffect(() => {
    if (location.hash === '#features') {
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Organize all your clients in one place with their information and platforms. Track communication history and project status.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ShoppingCart,
      title: 'Order Tracking',
      description: 'Monitor project status from A to Z with clear deadlines and amounts. Never miss a delivery date again.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageSquare,
      title: 'Message Templates',
      description: 'Create reusable message templates for efficient communication. Save time with automated responses.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Analyze your performance with detailed charts and key metrics. Make data-driven business decisions.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Automate repetitive tasks and save precious time. Focus on what matters most - your clients.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data is protected with enterprise-grade encryption. Bank-level security for your business.',
      color: 'from-red-500 to-red-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Graphic Designer',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'FiverFlow transformed my freelance business. I went from chaos to complete organization in just one week. My revenue increased by 40%!',
      rating: 5
    },
    {
      name: 'Marcus Chen',
      role: 'Web Developer',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'The automation features are incredible. I save 10+ hours per week on administrative tasks. Best investment I\'ve made for my business.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Content Writer',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Managing 50+ clients was overwhelming until I found FiverFlow. Now everything is organized and I never miss a deadline.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Freelancers' },
    { number: '500K+', label: 'Projects Managed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const trustedBy = [
    'Fiverr', 'Upwork', 'Freelancer', 'Toptal', '99designs', 'PeoplePerHour'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FiverFlow
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {/* 🔧 Utilise Link vers /#features pour que l’item reste visible partout et scrolle correctement */}
              <Link to="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              {/* 🔁 Reviews -> Support (seule modif) */}
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
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <Star className="mr-2" size={16} />
                Trusted by 10,000+ freelancers worldwide
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Made By{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  A Freelancer
                </span>{' '}
                For Freelancers
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                FiverFlow helps you organize clients, track orders, and grow your freelance business across all platforms. 
                Join thousands of successful freelancers who've transformed their workflow.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {user ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRight size={20} className="ml-2" />
                </Link>
                
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                  <Play size={20} className="mr-2" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="text-green-500 mr-2" size={16} />
                Free 7-day trial • Cancel anytime
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">FiverFlow Dashboard</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Active Clients</div>
                        <div className="text-sm text-gray-600">+12% this month</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">47</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="text-green-600" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Monthly Revenue</div>
                        <div className="text-sm text-gray-600">+28% this month</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">$8,420</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Time Saved</div>
                        <div className="text-sm text-gray-600">This week</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">15h</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 font-medium">Trusted by freelancers on</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {trustedBy.map((platform, index) => (
              <div key={index} className="text-gray-500 font-semibold text-lg">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed specifically for freelancers to manage their business and scale their operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by freelancers worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community of successful freelancers has to say about FiverFlow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your freelance business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful freelancers who've already made the switch to FiverFlow. 
            Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-full hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight size={20} className="ml-2" />
            </Link>
            
            <div className="flex items-center text-blue-100 text-sm">
              <CheckCircle className="mr-2" size={16} />
              7-day free trial 
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Crown className="text-white" size={20} />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FiverFlow
                </h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                The all-in-one platform to manage your freelance business and scale your operations across all platforms.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <Globe size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <Globe size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <Globe size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {/* 🔧 Footer: même correctif pour le lien Features */}
                <li><Link to="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Suppport</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FiverFlow. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacyy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
