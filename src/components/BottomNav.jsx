import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCompass, FaCrown, FaUser } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Onglets conditionnels selon le statut premium
  const getNavItems = () => {
    const baseItems = [
      {
        path: '/dashboard',
        icon: FaHome,
        label: t('nav.dashboard') || 'Dashboard'
      },
      {
        path: '/quests',
        icon: FaCompass,
        label: t('nav.quests') || 'Quêtes'
      }
    ];

    if (user?.isPremium) {
      // Si premium: ['Dashboard', 'Quêtes', 'Profil']
      return [
        ...baseItems,
        {
          path: '/profile',
          icon: FaUser,
          label: t('nav.profile') || 'Profil'
        }
      ];
    } else {
      // Si pas premium: ['Dashboard', 'Quêtes', 'Premium', 'Profil']
      return [
        ...baseItems,
        {
          path: '/premium',
          icon: FaCrown,
          label: t('nav.premium') || 'Premium'
        },
        {
          path: '/profile',
          icon: FaUser,
          label: t('nav.profile') || 'Profil'
        }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40">
      <div className="container mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center flex-1 h-full px-2 transition-all duration-200
                  ${isActive 
                    ? 'text-yellow-400' 
                    : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                <Icon className={`text-xl mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;