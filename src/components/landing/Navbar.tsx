import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LogoImage from '../../assets/LogoFiverFlow.png';

interface NavbarProps {
  onTryNow?: () => void;
}

export const Navbar = ({ onTryNow }: NavbarProps = {}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTryNow = () => {
    if (onTryNow) {
      onTryNow();
    } else {
      // Si un referral est en sessionStorage, aller à register, sinon dashboard
      const referralUsername = sessionStorage.getItem('referralUsername');
      if (referralUsername) {
        window.location.href = '/register';
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Benefits", href: "#benefits" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Docs", href: "/docs" }
  ];

  const handleScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <a href="/">
            <img src={LogoImage} alt="FiverFlow Logo" className="h-6 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll(link.href);
                }}
                className="text-neutral-300 hover:text-white transition-colors"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleTryNow}
              className="hidden lg:inline-flex items-center justify-center rounded-full text-white font-medium text-sm px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try FiverFlow for free
            </motion.button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 space-y-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll(link.href);
                }}
                className="block py-2 text-neutral-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={handleTryNow}
              className="inline-flex items-center justify-center rounded-full text-white font-medium text-sm px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow mt-2"
            >
              Try FiverFlow for free
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

