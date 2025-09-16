// components/Footer.jsx
import { Link } from "react-router-dom"; // ou next/link si Next.js
import { Crown, Globe } from "lucide-react"; // Assure-toi que ces icônes sont installées

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Logo & description */}
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

            {/* Social icons */}
            <div className="flex space-x-4">
              <a href="https://dsc.gg/fiverflow#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
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

          {/* Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Pages</h4>
            <ul className="space-y-3">
              <li><Link to="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
             <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            <a href="https://dsc.gg/fiverflow" className="text-gray-400 hover:text-white text-sm transition-colors">Discord</a>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 FiverFlow. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <li><Link to="/PrivacyPolicy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/TermsOfService" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
            <li><Link to="/CoockiePolicy" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</Link></li>
          </div>
        </div>
      </div>
    </footer>
  );
}
