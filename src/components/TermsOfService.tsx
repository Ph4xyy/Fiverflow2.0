import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";
import Footer from "../components/footer";
import { useAuth } from "../contexts/AuthContext";

const TermsOfService = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header same as PrivacyPolicy, only nav label changed */}
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
              <span className="text-blue-600 font-medium">Terms of Service</span>
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
        <h2 className="text-3xl font-bold mb-6">Terms of Service</h2>
        <p className="mb-4 text-gray-700">
          Welcome to FiverFlow. By using our services, you agree to comply with these Terms of Service, which govern your use of our website and applications.
        </p>
        <h3 className="text-xl font-semibold mb-2">Account Terms</h3>
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>You must provide accurate and complete information when creating an account.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>We may suspend or terminate accounts for violations of these terms.</li>
        </ul>
        <h3 className="text-xl font-semibold mb-2">Use of Services</h3>
        <p className="mb-4 text-gray-700">
          You agree not to misuse our services, including attempting unauthorized access, transmitting harmful content, or interfering with others' use of the platform.
        </p>
        <h3 className="text-xl font-semibold mb-2">Limitation of Liability</h3>
        <p className="mb-4 text-gray-700">
          FiverFlow shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services, except as required by Canadian law.
        </p>
        <h3 className="text-xl font-semibold mb-2">Governing Law</h3>
        <p className="mb-4 text-gray-700">
          These Terms are governed by the laws of Canada. Any disputes shall be resolved under Canadian jurisdiction.
        </p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsOfService;
