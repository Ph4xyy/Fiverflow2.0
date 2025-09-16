import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/footer";
import { useTranslation } from "react-i18next"; // ✅ Import
import i18n from "../i18n"; // ✅ Import config

import { 
  CheckCircle, Users, ShoppingCart, MessageSquare, BarChart3, Crown,
  ArrowRight, Star, Zap, Shield, TrendingUp, Clock, ChevronRight, Play
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation(); // ✅ Hook de traduction

  useEffect(() => {
    if (location.hash === "#features") {
      const el = document.getElementById("features");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-blue-600">FiverFlow</h1>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#features">{t("navbar.features")}</Link>
            <Link to="/pricing">{t("navbar.pricing")}</Link>
            <Link to="/support">{t("navbar.support")}</Link>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                {t("navbar.dashboard")}
              </Link>
            ) : (
              <>
                <Link to="/login">{t("navbar.signIn")}</Link>
                <Link to="/register" className="btn-primary">
                  {t("navbar.getStarted")}
                </Link>
              </>
            )}
          </div>
          {/* Switch langue */}
          <button onClick={() => i18n.changeLanguage("en")}>🇬🇧</button>
          <button onClick={() => i18n.changeLanguage("fr")}>🇫🇷</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="badge">{t("hero.trusted")}</div>
            <h1 className="text-5xl font-bold">
              {t("hero.title1")}{" "}
              <span className="text-gradient">{t("hero.title2")}</span>{" "}
              {t("hero.title3")}
            </h1>
            <p className="mt-6 text-lg">{t("hero.description")}</p>
            <div className="mt-8 flex gap-4">
              <Link to="/register" className="btn-primary">
                {t("hero.ctaPrimary")}
              </Link>
              <button className="btn-secondary">{t("hero.ctaSecondary")}</button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              <CheckCircle className="inline mr-2" size={16} />
              {t("hero.trialNote")}
            </p>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-gray-50 text-center">
        <p className="text-gray-600">{t("trustedBy")}</p>
        <div className="flex justify-center gap-8 opacity-60 mt-4">
          <span>Fiverr</span>
          <span>Upwork</span>
          <span>Freelancer</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-center text-white">
        <h2 className="text-4xl font-bold">{t("cta.title")}</h2>
        <p className="mt-4 text-lg">{t("cta.subtitle")}</p>
        <Link to="/register" className="btn-light mt-6">
          {t("cta.start")}
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
