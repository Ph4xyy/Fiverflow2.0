import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";
import Footer from "../components/footer";
import { useAuth } from '../contexts/AuthContext';

const PrivacyPolicy = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
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
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <span className="text-blue-600 font-medium">Privacy Policy</span>
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

      {/* Main content */}
      <main className="flex-grow mt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>
        <p className="mb-4 text-gray-700">
          At FiverFlow, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.
        </p>
        <h3 className="text-xl font-semibold mb-2">Information We Collect</h3>
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>Account information you provide, such as email and name.</li>
          <li>Usage data, including pages visited and actions taken on our platform.</li>
          <li>Cookies and analytics data to improve user experience.</li>
        </ul>
        <h3 className="text-xl font-semibold mb-2">How We Use Your Information</h3>
        <p className="mb-4 text-gray-700">
          We use your information to provide, maintain, and improve our services, communicate with you, and ensure compliance with legal obligations under Canadian privacy law (PIPEDA).
        </p>
        <h3 className="text-xl font-semibold mb-2">Your Rights</h3>
        <p className="mb-4 text-gray-700">
          You have the right to access, correct, or request deletion of your personal information. You may also withdraw consent for processing at any time by contacting us.
        </p>
        <h3 className="text-xl font-semibold mb-2">Data Security</h3>
        <p className="mb-4 text-gray-700">
          We implement reasonable technical and organizational measures to protect your personal data against unauthorized access, disclosure, or destruction.
        </p>
        <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
        <p className="text-gray-700">
          For questions or concerns regarding this Privacy Policy, please contact us at privacy@fiverflow.com.
        </p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;