import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCompass, FaChartLine, FaUser, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { trackEvent } from '../../utils/analytics';

const BottomNav = () => {
  const location = useLocation();
  const { t, currentLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isSmallPhone, setIsSmallPhone] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(max-width: 380px)').matches : false);
  
  // États pour indicateurs
  const [showStarterBadge, setShowStarterBadge] = useState(false);
  const { impactAnnualEstimated } = useServerImpactAggregates();
  
  // Refs pour analytics (éviter doublons)
  const starterBadgeShownRef = useRef(false);
  const impactChipShownRef = useRef(false);
  
  // Feature flag pour activer Nav V2 (par défaut activé)
  const NAV_V2_ENABLED = import.meta.env.VITE_NAV_V2 !== 'off'; // Par défaut 'on', sauf si explicitement 'off'
  const STARTER_BADGE_TTL_HOURS = parseInt(import.meta.env.VITE_STARTER_BADGE_TTL_HOURS || '72', 10);

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

  // Logique badge Starter (éphémère)
  useEffect(() => {
    if (!user || !NAV_V2_ENABLED) return;

    const checkStarterBadge = async () => {
      try {
        // 1. Vérifier si déjà dismissed
        const dismissed = localStorage.getItem('starterBadgeDismissed');
        if (dismissed === 'true') {
          setShowStarterBadge(false);
          return;
        }

        // 2. Vérifier si l'utilisateur a déjà commencé une quête Starter
        const userQuestsRef = collection(db, 'userQuests');
        const q = query(userQuestsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        
        const starterQuestIds = ['cut-subscription', 'adjust-tax-rate', 'weekly-savings'];
        const hasStartedStarter = snapshot.docs.some(doc => {
          const data = doc.data();
          return starterQuestIds.includes(data.questId) && ['active', 'completed'].includes(data.status);
        });

        if (hasStartedStarter) {
          setShowStarterBadge(false);
          localStorage.setItem('starterBadgeDismissed', 'true');
          return;
        }

        // 3. Vérifier TTL (72h par défaut)
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
          const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCreation < STARTER_BADGE_TTL_HOURS) {
            setShowStarterBadge(true);
          }
        }
      } catch (error) {
        console.error('Error checking starter badge:', error);
      }
    };

    checkStarterBadge();
  }, [user, NAV_V2_ENABLED, STARTER_BADGE_TTL_HOURS]);

  // Analytics badge Starter (1×/session)
  useEffect(() => {
    if (showStarterBadge && !starterBadgeShownRef.current && NAV_V2_ENABLED) {
      trackEvent('nav_starter_badge_shown', {});
      starterBadgeShownRef.current = true;
    }
  }, [showStarterBadge, NAV_V2_ENABLED]);

  // Analytics chip Impact (1×/session)
  useEffect(() => {
    if (impactAnnualEstimated > 0 && !impactChipShownRef.current && NAV_V2_ENABLED) {
      trackEvent('nav_impact_chip_shown', { total_annual_impact: impactAnnualEstimated });
      impactChipShownRef.current = true;
    }
  }, [impactAnnualEstimated, NAV_V2_ENABLED]);

  // Dismiss badge Starter quand on ouvre /quests
  useEffect(() => {
    if (location.pathname === '/quests' && showStarterBadge) {
      localStorage.setItem('starterBadgeDismissed', 'true');
      setShowStarterBadge(false);
      trackEvent('nav_starter_badge_dismissed', { reason: 'opened_quests' });
    }
  }, [location.pathname, showStarterBadge]);
  
  // Configuration des icônes avec variantes
  const iconConfig = {
    dashboard: {
      icon: FaHome,
      gradient: 'from-amber-400 to-orange-400',
      shadow: 'rgba(251,191,36,0.4)',
    },
    quests: {
      icon: FaCompass,
      gradient: 'from-cyan-400 to-blue-400',
      shadow: 'rgba(34,211,238,0.4)',
    },
    impact: {
      icon: FaChartLine,
      gradient: 'from-emerald-400 to-green-400',
      shadow: 'rgba(34,197,94,0.4)',
    },
    profile: {
      icon: FaUser,
      gradient: 'from-purple-400 to-pink-400',
      shadow: 'rgba(168,85,247,0.4)',
    },
    premium: {
      icon: FaCrown,
      gradient: 'from-purple-400 to-pink-400',
      shadow: 'rgba(168,85,247,0.4)',
    }
  };

  // Format Impact pour chip
  const formatImpactChip = (amount) => {
    if (!amount || amount === 0) return null;
    const formatted = Math.round(amount).toLocaleString(currentLang === 'fr' ? 'fr-FR' : 'en-US');
    return t('nav.impact_chip', { amount: `€${formatted}` });
  };

  // Onglets de navigation (V2 ou V1)
  const getNavItems = () => {
    if (NAV_V2_ENABLED) {
      // NAV V2: 4 onglets fixes (Accueil / Quêtes / Impact / Profil)
      return [
        {
          path: '/dashboard',
          icon: FaHome,
          label: t('nav.dashboard') || 'Accueil',
          shortLabel: t('nav.dashboard_short') || 'Accueil',
          a11yLabel: t('nav.a11y.home') || 'Go to Home',
          key: 'dashboard',
          badge: null
        },
        {
          path: '/quests',
          icon: FaCompass,
          label: t('nav.quests') || 'Quêtes',
          shortLabel: t('nav.quests_short') || 'Quêtes',
          a11yLabel: t('nav.a11y.quests') || 'Go to Quests',
          key: 'quests',
          badge: showStarterBadge ? { type: 'starter', label: t('nav.badge.starter') || 'Starter' } : null
        },
        {
          path: '/impact',
          icon: FaChartLine,
          label: t('nav.impact') || 'Impact',
          shortLabel: t('nav.impact_short') || 'Impact',
          a11yLabel: t('nav.a11y.impact') || 'Go to Impact',
          key: 'impact',
          chip: formatImpactChip(impactAnnualEstimated)
        },
        {
          path: '/profile',
          icon: FaUser,
          label: t('nav.profile') || 'Profil',
          shortLabel: t('nav.profile_short') || 'Profil',
          a11yLabel: t('nav.a11y.profile') || 'Go to Profile',
          key: 'profile',
          badge: null
        }
      ];
    } else {
      // NAV V1: ancienne logique (Dashboard / Quêtes / Premium si non-premium / Profil)
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
    }
  };

  const navItems = getNavItems();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[60] pb-safe"
      role="navigation"
      aria-label={NAV_V2_ENABLED ? 'Navigation principale' : 'Main navigation'}
    >
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const config = iconConfig[item.key] || {
                gradient: 'from-gray-400 to-gray-500',
                shadow: 'rgba(156,163,175,0.4)',
              };
              const currentPath = pendingPath ?? location.pathname;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
              const displayLabel = isSmallPhone && item.shortLabel ? item.shortLabel : item.label;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex-1 overflow-hidden rounded-xl px-2 py-2.5 text-center 
                    transition-all duration-300 group
                    min-w-[44px] min-h-[44px]
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-200'
                    }
                  `}
                  style={{
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.a11yLabel || item.label}
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={(e) => {
                    // Animation avant navigation
                    if (!isActive) {
                      e.preventDefault();
                      setPendingPath(item.path);
                      
                      // Analytics
                      trackEvent('nav_tab_clicked', { tab: item.key });
                      
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
                      
                      {/* Badge notification (count ou type) */}
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
                              : item.badge.type === 'starter'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5'
                              : 'bg-red-500'
                            }
                            ${item.badge.count || item.badge.label
                              ? 'min-w-[18px] h-[18px] flex items-center justify-center px-1' 
                              : 'w-2 h-2'
                            }
                            rounded-full text-[9px] font-black text-white
                            shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                            border border-white/20 uppercase
                          `}
                          style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 900,
                            letterSpacing: '0.03em'
                          }}
                        >
                          {item.badge.count && (
                            <span>{item.badge.count > 9 ? '9+' : item.badge.count}</span>
                          )}
                          {item.badge.label && (
                            <span>{item.badge.label}</span>
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
                    </motion.div>

                    {/* Label avec animation et chip optionnel */}
                    <div className="flex items-center gap-1">
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
                      
                      {/* Chip Impact (V2 uniquement) */}
                      {item.chip && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded uppercase border border-emerald-500/30"
                          style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 900,
                            letterSpacing: '0.03em'
                          }}
                        >
                          {item.chip}
                        </motion.span>
                      )}
                    </div>
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
