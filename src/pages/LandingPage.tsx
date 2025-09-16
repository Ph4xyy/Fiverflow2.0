import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/footer";
import { useTranslation } from "react-i18next";

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
  ChevronRight,
  Play,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // ✅ scroll vers #features même depuis une autre route
  useEffect(() => {
    if (location.hash === "#features") {
      const el = document.getElementById("features");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const features = [
    {
      icon: Users,
      title: t("landing.features.clientManagement.title"),
      description: t("landing.features.clientManagement.description"),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: ShoppingCart,
      title: t("landing.features.orderTracking.title"),
      description: t("landing.features.orderTracking.description"),
      color: "from-green-500 to-green-600",
    },
    {
      icon: MessageSquare,
      title: t("landing.features.messageTemplates.title"),
      description: t("landing.features.messageTemplates.description"),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Zap,
      title: t("landing.features.automation.title"),
      description: t("landing.features.automation.description"),
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Shield,
      title: t("landing.features.security.title"),
      description: t("landing.features.security.description"),
      color: "from-red-500 to-red-600",
    },
  ];

  const stats = [
    { number: "10,000+", label: t("landing.stats.freelancers") },
    { number: "500K+", label: t("landing.stats.projects") },
    { number: "99.9%", label: t("landing.stats.uptime") },
    { number: "24/7", label: t("landing.stats.support") },
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
              <Link to="/#features" className="text-blue-600 font-medium">
                {t("landing.nav.features")}
              </Link>
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("landing.nav.pricing")}
              </Link>
              <Link
                to="/support"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("landing.nav.support")}
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* 🌍 Switcher langue */}
              <button
                onClick={() =>
                  i18n.changeLanguage(i18n.language === "en" ? "fr" : "en")
                }
                className="p-2 rounded-full hover:bg-gray-100"
                title="Switch language"
              >
                {i18n.language === "en" ? "🇬🇧" : "🇫🇷"}
              </button>

              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t("landing.nav.dashboard")}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    {t("landing.nav.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t("landing.nav.getStarted")}
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
                {t("landing.hero.trusted")}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t("landing.hero.title")}{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("landing.hero.highlight")}
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                {t("landing.hero.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
