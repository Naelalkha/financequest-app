import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCompass, FaCrown, FaUser, FaTrophy, FaFire } from 'react-icons/fa';
import { GiTwoCoins } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isSmallPhone, setIsSmallPhone] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(max-width: 380px)').matches : false);

  // Réinitialiser l'état pending dès que l'URL change
  useEffect(() => {
    setPendingPath(null);
  }, [location.pathname]);

  // Détecter les très petits écrans pour adapter les libellés
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 380px)');
    const onChange = () => setIsSmallPhone(mq.matches);
    onChange();
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
    };
  }, []);
  
  // Configuration des icônes avec variantes
  const iconConfig = {
    dashboard: {
      icon: FaHome,
      activeIcon: FaHome,
      gradient: 'from-amber-400 to-orange-400',
      shadow: 'rgba(251,191,36,0.4)',
      particleColor: 'bg-amber-400'
    },
    quests: {
      icon: FaCompass,
      activeIcon: FaCompass,
      gradient: 'from-cyan-400 to-blue-400',
      shadow: 'rgba(34,211,238,0.4)',
      particleColor: 'bg-cyan-400'
    },
    premium: {
      icon: FaCrown,
      activeIcon: FaCrown,
      gradient: 'from-purple-400 to-pink-400',
      shadow: 'rgba(168,85,247,0.4)',
      particleColor: 'bg-purple-400'
    },
    profile: {
      icon: FaUser,
      activeIcon: FaUser,
      gradient: 'from-emerald-400 to-green-400',
      shadow: 'rgba(34,197,94,0.4)',
      particleColor: 'bg-emerald-400'
    }
  };

  // Onglets conditionnels selon le statut premium
  const getNavItems = () => {
    const baseItems = [
      {
        path: '/dashboard',
        icon: FaHome,
        label: t('nav.dashboard') || 'Accueil',
        shortLabel: t('nav.dashboard_short') || 'Accueil',
        key: 'dashboard',
        badge: null
      },
      {
        path: '/quests',
        icon: FaCompass,
        label: t('nav.quests') || 'Quêtes',
        shortLabel: t('nav.quests_short') || 'Quêtes',
        key: 'quests',
        badge: user?.newQuests > 0 ? { count: user.newQuests, type: 'new' } : null
      }
    ];

    if (user?.isPremium) {
      // Si premium: ['Dashboard', 'Quêtes', 'Profil']
      return [
        ...baseItems,
        {
          path: '/profile',
          icon: FaUser,
          label: t('nav.profile') || 'Profil',
          shortLabel: t('nav.profile_short') || 'Profil',
          key: 'profile',
          badge: null
        }
      ];
    } else {
      // Si pas premium: ['Dashboard', 'Quêtes', 'Premium', 'Profil']
      return [
        ...baseItems,
        {
          path: '/premium',
          icon: FaCrown,
          label: t('nav.premium') || 'Premium',
          shortLabel: t('nav.premium_short') || 'Pro',
          key: 'premium',
          badge: { type: 'premium' }
        },
        {
          path: '/profile',
          icon: FaUser,
          label: t('nav.profile') || 'Profil',
          shortLabel: t('nav.profile_short') || 'Profil',
          key: 'profile',
          badge: null
        }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] pb-safe">
      {/* Ombre portée pour séparer de la page (supprimée pour éviter la ligne translucide) */}
      
      {/* Container principal avec padding */}
      <div className="px-2 sm:px-3 py-2">
        {/* Navbar avec glassmorphism amélioré */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Fond avec meilleur contraste */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl" />
          
          {/* Bordure néon subtile */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/[0.08] to-white/[0.04]" />
          
          {/* Reflet supérieur */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Contenu */}
          <div className="relative flex items-stretch justify-between gap-1 px-2 py-1.5">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const config = iconConfig[item.key];
              const currentPath = pendingPath ?? location.pathname;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
              const displayLabel = isSmallPhone && item.shortLabel ? item.shortLabel : item.label;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex-1 overflow-hidden rounded-xl px-2 py-2.5 text-center 
                    transition-all duration-300 focus-visible-ring group
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-200'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={(e) => {
                    // Animation avant navigation
                    if (!isActive) {
                      e.preventDefault();
                      setPendingPath(item.path);
                      
                      // Petit feedback haptique si disponible
                      if (window.navigator?.vibrate) {
                        window.navigator.vibrate(10);
                      }
                      
                      setTimeout(() => navigate(item.path), 140);
                    }
                  }}
                >
                  {/* Fond animé pour l'onglet actif */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        layoutId="bottomnav-active-bg"
                        className={`
                          absolute inset-0 rounded-xl
                          bg-gradient-to-r ${config.gradient}
                          opacity-20
                        `}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 500, 
                          damping: 30,
                          mass: 0.5
                        }}
                        style={{ 
                          willChange: 'transform, opacity',
                          boxShadow: `0 0 20px ${config.shadow}`
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Effet hover */}
                  {hoveredItem === item.key && !isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/5"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Indicateur actif en haut retiré (doublon visuel) */}

                  {/* Contenu avec icône et label */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {/* Container icône avec animation */}
                    <motion.div
                      className="relative mb-1.5"
                      animate={isActive ? {
                        y: [0, -2, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Icon
                        className={`
                          text-[22px] transition-all duration-300
                          ${isActive ? 'text-white' : ''}
                        `}
                        style={{ 
                          willChange: 'transform',
                          filter: isActive ? `drop-shadow(0 2px 8px ${config.shadow})` : 'none'
                        }}
                      />
                      
                      {/* Badge notification */}
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`
                            absolute -top-1 -right-1 
                            ${item.badge.type === 'new' 
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                              : item.badge.type === 'premium'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-red-500'
                            }
                            ${item.badge.count 
                              ? 'min-w-[18px] h-[18px] flex items-center justify-center px-1' 
                              : 'w-2 h-2'
                            }
                            rounded-full text-[9px] font-black text-white
                            shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                            border border-white/20
                          `}
                        >
                          {item.badge.count && (
                            <span>{item.badge.count > 9 ? '9+' : item.badge.count}</span>
                          )}
                          {item.badge.type === 'premium' && !item.badge.count && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{
                                background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)'
                              }}
                            />
                          )}
                        </motion.div>
                      )}
                      
                      {/* Particules supprimées */}
                    </motion.div>

                    {/* Label avec animation */}
                    <motion.span 
                      className={`
                        text-[10px] sm:text-[11px] font-black tracking-wide uppercase whitespace-nowrap leading-none
                        transition-all duration-300
                        ${isActive ? 'opacity-100' : 'opacity-80'}
                      `}
                      style={{ 
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 900,
                        letterSpacing: '0.03em'
                      }}
                      animate={isActive ? {
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      {displayLabel}
                    </motion.span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Effet de lueur globale subtile */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </nav>
  );
};

export default BottomNav;