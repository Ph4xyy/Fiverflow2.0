// src/pages/SupportPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

import { HelpCircle, BookOpen, Newspaper, Mail, ArrowRight } from "lucide-react";
import { FAQ } from "@/components/support/FAQ";
import { Button } from "@/components/ui/Button";
import Footer from "../components/footer";
import { 
  Crown, 
} from 'lucide-react';


const SupportPage: React.FC = () => {
    const { user } = useAuth();
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
              <Link to="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">{'Features'}</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">{'Pricing'}</Link>
              <span className="text-blue-600 font-medium">{'Support'}</span>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {'Dashboard'}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    {'Sign In'}
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {'Get Started'}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-5">
              <HelpCircle className="w-4 h-4 mr-2" /> {'We\'re here to help'}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {'Support, FAQ & Resources'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {'Find quick answers, browse documentation, or contact our team.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="px-6 py-3">
                <a href="#faq">{'Browse FAQ'}</a>
              </Button>
              <Button asChild className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-6 py-3">
                <Link to="/register">{'Start Free Trial'}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="#" className="group rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition">
                <BookOpen className="w-6 h-6 text-blue-600 mb-3" />
                <div className="font-semibold text-gray-900">{'Documentation'}</div>
                <div className="text-sm text-gray-500">{'Step-by-step guides'}</div>
                <ArrowRight className="w-4 h-4 text-gray-400 mt-3 group-hover:translate-x-1 transition" />
              </Link>
              <Link to="#" className="group rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition">
                <Newspaper className="w-6 h-6 text-purple-600 mb-3" />
                <div className="font-semibold text-gray-900">{'Blog'}</div>
                <div className="text-sm text-gray-500">{'Tips & news'}</div>
                <ArrowRight className="w-4 h-4 text-gray-400 mt-3 group-hover:translate-x-1 transition" />
              </Link>
              <a href="mailto:support@fiverflow.app" className="group rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition">
                <Mail className="w-6 h-6 text-green-600 mb-3" />
                <div className="font-semibold text-gray-900">{'Contact'}</div>
                <div className="text-sm text-gray-500">support@fiverflow.app</div>
                <ArrowRight className="w-4 h-4 text-gray-400 mt-3 group-hover:translate-x-1 transition" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{'Frequently Asked Questions'}</h2>
          <FAQ
            items={[
              {
                q: 'How does the free trial work?',
                a: 'You have 7 days with all features. No card is charged before the end of the trial.',
              },
              {
                q: 'Can I connect my platforms (Fiverr, Upwork)?',
                a: 'Yes, you can track your clients and orders across multiple platforms in one place.',
              },
              {
                q: 'Invoices and payments?',
                a: 'You create your invoices and payment goes directly to your connected Stripe account.',
              },
              {
                q: 'Is my data secure?',
                a: 'We use Supabase and enterprise-level security practices (encryption, RBAC).',
              },
              {
                q: 'Can I cancel at any time?',
                a: 'Yes. You can cancel or change your plan from the billing page at any time.',
              },
            ]}
          />
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SupportPage;
