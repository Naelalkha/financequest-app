import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCompass, FaCrown, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);

  // Réinitialiser l'état pending dès que l'URL change
  useEffect(() => {
    setPendingPath(null);
  }, [location.pathname]);
  
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
    <nav className="fixed bottom-0 left-0 right-0 z-60 pb-safe">
      {/* Fond glassmorphism aligné au thème QuestList */}
      <div className="px-3 py-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 lg:backdrop-blur-xl backdrop-blur-xs">
          <div className="flex items-stretch justify-between gap-1 px-2 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const currentPath = pendingPath ?? location.pathname;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex-1 overflow-hidden rounded-xl px-2 py-2 text-center transition-all duration-200 focus-visible-ring ${
                    isActive ? 'text-amber-300' : 'text-gray-300 hover:text-gray-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    // Laisser l'animation se jouer avant de naviguer
                    if (!isActive) {
                      e.preventDefault();
                      setPendingPath(item.path);
                      window.setTimeout(() => navigate(item.path), 140);
                    }
                  }}
                >
                  {/* Indicateur d'arrière-plan animé pour l'onglet actif */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        layoutId="bottomnav-active-bg"
                        className="absolute inset-0 rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 shadow-glow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.6 }}
                        style={{ willChange: 'transform, opacity' }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <Icon
                      className={`mb-0.5 text-[20px] transition-transform duration-200 ${
                        isActive ? 'scale-110' : ''
                      }`}
                      style={{ willChange: 'transform' }}
                    />
                    <span className="text-[11px] font-extrabold tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;