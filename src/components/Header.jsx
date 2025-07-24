import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTrophy, FaUser, FaCrown, FaSignOutAlt, 
  FaBars, FaTimes, FaHome, FaScroll, FaCoins
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logout_success') || 'Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('errors.generic'));
    }
  };

  const navLinks = [
    { 
      to: '/dashboard', 
      label: t('dashboard.title') || 'Dashboard', 
      icon: FaHome,
      color: 'text-yellow-400'
    },
    { 
      to: '/quests', 
      label: t('quests') || 'Quests', 
      icon: FaScroll,
      color: 'text-green-400'
    },
    { 
      to: '/premium', 
      label: t('premium') || 'Premium', 
      icon: FaCrown,
      color: 'text-purple-400',
      premium: true
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors group"
          >
            <FaTrophy className="text-2xl group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">FinanceQuest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive(link.to) 
                    ? 'bg-gray-800 text-yellow-400' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                  ${link.premium ? 'relative' : ''}
                `}
              >
                <link.icon className={`text-lg ${isActive(link.to) ? link.color : ''}`} />
                <span className="font-medium">{link.label}</span>
                {link.premium && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Points Display */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <FaCoins className="text-yellow-400" />
              <span className="text-white font-semibold">
                {user?.points || 0}
              </span>
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaUser />
                <span className="text-sm">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <FaSignOutAlt />
                <span>{t('logout')}</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white transition-colors p-2"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-2">
              {/* Mobile Points */}
              <div className="flex items-center gap-2 px-4 py-2 text-yellow-400">
                <FaCoins />
                <span className="font-semibold">{user?.points || 0} {t('points')}</span>
              </div>
              
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive(link.to) 
                      ? 'bg-gray-800 text-yellow-400' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <link.icon className="text-lg" />
                  <span className="font-medium">{link.label}</span>
                  {link.premium && (
                    <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className="border-t border-gray-800 mt-2 pt-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                  <FaUser />
                  <span>{t('profile')}</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;